"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// --- DATA ---
const playerStats = [
  { label: "Matches Played", value: "24", icon: "/images/trophy-icon.png" },
  { label: "Win Rate", value: "72%", icon: "/images/medal-icon.png" },
  { label: "Total Points", value: "1,150", icon: "/images/points-icon.png" },
  { label: "Team Ranking", value: "#12", icon: "/images/ranking-icon.png" },
];

const upcomingMatches = [
  {
    event: "City Sports Open - Round 1",
    date: "Oct 15, 2026",
    sport: "Taekwondo",
  },
  {
    event: "Weekly Local Scrimmage",
    date: "Oct 18, 2026",
    sport: "Taekwondo",
  },
];

// --- TYPE ---
type Profile = {
  id: string;
  full_name: string;
  dojo: string;
  belt_rank: string;
  dob: string;
  gender: string;
  status: string;
  category?: string;
  email?: string;
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
        .from("player_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      const typedData = data as Profile;

      setProfile({
        ...typedData,
        email: user.email,
      });

      if (typedData?.certificate_url) {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("certificates")
            .createSignedUrl(typedData.certificate_url, 3600); // 1 hour

        if (signedError) {
          console.error("SIGNED URL ERROR:", signedError.message);
        } else if (signedData?.signedUrl) {
          setCertificateUrl(signedData.signedUrl);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-600 text-white font-bold">
        Loading profile...
      </div>
    );
  }

  const normalizedStatus = profile.status?.toLowerCase();

  const statusColor =
    normalizedStatus === "verified"
      ? "text-green-600"
      : normalizedStatus === "rejected"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="border-b p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold">
              Player <span className="text-red-600">Profile</span>
            </h1>
            {/* ✅ Added Back to Dashboard Link */}
            <Link 
              href="/player/event_browsing" 
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 mt-1 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome</p>
              <p className="font-bold">{profile.full_name}</p>

              <button
                onClick={handleSignOut}
                className="text-xs text-red-600 underline"
              >
                Sign Out
              </button>
            </div>

            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
              {profile.full_name?.charAt(0) || "P"}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto p-6 space-y-10">
        {/* PROFILE CARD */}
        <section className="bg-white shadow-lg rounded-2xl p-8 border">
          <div className="flex items-center gap-6 mb-6">
            <img
              src="/images/player-avatar.png"
              alt="Player Avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />

            <div>
              <h2 className="text-2xl font-bold">
                {profile.full_name}
              </h2>

              <p className="text-sm text-gray-500">
                {profile.email || "No email available"}
              </p>

              <p
                className={`text-sm font-bold mt-1 ${statusColor}`}
              >
                {profile.status?.toUpperCase() || "PENDING"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Dojo</p>
              <p className="font-semibold">
                {profile.dojo || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Belt Rank</p>
              <p className="font-semibold">
                {profile.belt_rank || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-semibold">
                {profile.category || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-semibold">{profile.gender || "Not Set"}</p>
            </div>

            <div>
              <p className="text-gray-500">Instructor</p>
              <p className="font-semibold">
                {profile.instructor || "N/A"}
              </p>
            </div>
          </div>

          {certificateUrl && (
            <div className="mt-4">
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 underline text-sm"
              >
                View Certificate
              </a>
            </div>
          )}
        </section>

        {/* STATS */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            Performance Stats
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {playerStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-50 p-5 rounded-xl text-center border"
              >
                <img
                  src={stat.icon}
                  alt={stat.label}
                  className="w-8 h-8 mx-auto mb-2"
                />

                <p className="text-xl font-bold">
                  {stat.value}
                </p>

                <p className="text-xs text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            Upcoming Events
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {upcomingMatches.map((match, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {match.event}
                  </p>

                  <p className="text-sm text-gray-500">
                    {match.date} • {match.sport}
                  </p>
                </div>

                <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                  View
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* EDIT PROFILE BUTTON */}
        <div className="text-center">
          <Link
            href="/player/profile/edit"
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </main>
  );
}