"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function PlayerRegisterPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // AUTH STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // PLAYER STATES
  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [beltRank, setBeltRank] = useState("");
  const [dob, setDob] = useState("");
  const [instructor, setInstructor] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // VALIDATION
    if (!email || !password || !fullName || !dob || !instructor || !beltRank) {
      alert("Please fill in all required player fields.");
      setLoading(false);
      return;
    }

    if (!certificate) {
      alert("Please upload your belt certification.");
      setLoading(false);
      return;
    }

    // 1. CREATE AUTH USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "player" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    let user = data.user;
    if (!user) {
      const { data: existing } = await supabase.auth.getUser();
      user = existing?.user;
    }

    if (!user) {
      alert("User not available. Please confirm your email.");
      setLoading(false);
      return;
    }

    // 2. CERTIFICATE UPLOAD
    let certificatePath = null;
    if (certificate) {
      const fileExt = certificate.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, certificate, { upsert: true });

      if (uploadError) {
        console.error("UPLOAD ERROR:", uploadError.message);
        alert(uploadError.message);
        setLoading(false);
        return;
      }
      certificatePath = filePath;
    }

    // 3. SAVE PLAYER PROFILE
    const { error: profileError } = await (supabase as any)
      .from("player_profiles")
      .upsert({
        id: user.id,
        email,
        full_name: fullName,
        dojo,
        belt_rank: beltRank,
        dob,
        instructor,
        certificate_url: certificatePath,
        status: "pending",
      });

    if (profileError) {
      console.error("PROFILE ERROR:", profileError.message);
      alert("Failed to save player profile");
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm.");
    router.push("/player/profile");
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-md border">
        
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h1>

        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Registering as a{" "}
          <span className="font-bold text-red-600 capitalize">
            Player
          </span>
        </p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          {/* CREDENTIALS */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyle}
            required
          />

          {/* PLAYER DETAILS */}
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputStyle}
            required
          />

          <input
            placeholder="Dojo / Club"
            value={dojo}
            onChange={(e) => setDojo(e.target.value)}
            className={inputStyle}
          />

          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className={inputStyle}
            required
          />

          <input
            placeholder="Instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className={inputStyle}
            required
          />

          <select
            value={beltRank}
            onChange={(e) => setBeltRank(e.target.value)}
            className={inputStyle}
            required
          >
            <option value="">Belt Rank</option>
            <option>White</option>
            <option>Yellow</option>
            <option>Green</option>
            <option>Blue</option>
            <option>Purple</option>
            <option>Brown</option>
            <option>Black</option>
          </select>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 px-1">
              Upload Belt Certification (Image or PDF)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                setCertificate(e.target.files?.[0] || null)
              }
              className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-700 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-red-600 text-white font-semibold py-4 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>
      </div>
    </main>
  );
}