"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const playerStats = [
  { label: "Matches Played", value: "24" },
  { label: "Win Rate", value: "72%" },
  { label: "Total Points", value: "1,150" },
  { label: "Team Ranking", value: "#12" },
];

const upcomingMatches = [
  { event: "City Sports Open - Round 1", date: "Oct 15, 2026", time: "6:00 PM" },
  { event: "Weekly Local Scrimmage", date: "Oct 18, 2026", time: "5:30 PM" },
];

type Profile = {
  id: string;
  full_name: string;
  dojo: string;
  belt_rank: string;
  dob: string;
  instructor: string;
  status: string;
  certificate_url?: string;
};

export default function PlayerProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      setProfile(data as unknown as Profile);

      if (data?.certificate_url) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("certificates")
          .createSignedUrl(data.certificate_url, 60);

        if (signedError) {
          console.error("SIGNED URL ERROR:", signedError.message);
        } else {
          setCertificateUrl(signedData.signedUrl);
        }
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    router.push("/login");
  };

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  const playerName = profile.full_name || "New Player";
  const statusColor =
    profile.status === "verified"
      ? "text-green-600"
      : profile.status === "rejected"
        ? "text-red-600"
        : "text-yellow-600";

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <header className="border-b border-gray-100 p-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
              Player <span className="text-red-600">Profile</span>
            </h1>
            <Link
              href="/event_browsing"
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600 transition-colors hover:text-red-800"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Welcome,</span>
                <span className="font-semibold text-gray-800">{playerName}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-red-600 underline transition-colors hover:text-red-800"
              >
                Sign Out
              </button>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow-sm">
              {playerName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 p-6 md:p-10">
        <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Karate Profile
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-gray-500">Dojo</p>
              <p className="font-semibold">{profile.dojo || "Independent"}</p>
            </div>

            <div>
              <p className="text-gray-500">Belt Rank</p>
              <p className="font-semibold">{profile.belt_rank || "Not Set"}</p>
            </div>

            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-semibold">{profile.dob || "Not Set"}</p>
            </div>

            <div>
              <p className="text-gray-500">Instructor</p>
              <p className="font-semibold">{profile.instructor || "Not Set"}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-semibold ${statusColor}`}>
                {profile.status.toUpperCase()}
              </p>
            </div>
          </div>

          {certificateUrl && (
            <div className="mt-4">
              <p className="mb-1 text-sm text-gray-500">Certificate</p>
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Certificate
              </a>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/player/profile/edit"
              className="inline-block rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Key Performance
          </h2>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {playerStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-4xl font-extrabold text-gray-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>

            <Link
              href="/event_browsing"
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              View All Events
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div
                key={match.event}
                className="flex items-center justify-between rounded-2xl border bg-gray-50 p-6 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{match.event}</p>
                  <p className="text-sm text-gray-500">
                    {match.date} • {match.time}
                  </p>
                </div>
                <button className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
