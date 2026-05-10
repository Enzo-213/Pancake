import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabase/server-client";

const PROTECTED_ROUTE_PREFIXES = ["/protected"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}
/**
 * Next.js proxy (formerly middleware) entry point responsible for basic auth gating.
 *
 * Runtime assumptions due to conflicting docs (Next.js 16):
 * - Proxy runs in the Node.js runtime by default (not Edge)
 * - Node runtime grants access to the shared cookie store used by Supabase
 *
 * What happens per request:
 * - Instantiate the Supabase server client (shares cookies via `NextResponse`)
 * - Call `supabase.auth.getUser()` which refreshes tokens if necessary
 * - Redirect anonymous users away from `/protected` routes to `/login`
 *
 * Add extra path checks or redirects here when you need more complex routing rules.
 */
export async function proxy(request: NextRequest) {
  if (!isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
