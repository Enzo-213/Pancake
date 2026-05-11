"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// --- DATA CONSTANTS ---
const playerStats = [
  { label: "Matches Played", value: "24", icon: "/images/trophy-icon.png" }, 
  { label: "Win Rate", value: "72%", icon: "/images/medal-icon.png" },
  { label: "Total Points", value: "1,150", icon: "/images/points-icon.png" },
  { label: "Team Ranking", value: "#12", icon: "/images/ranking-icon.png" },
];

const upcomingMatches = [
  { event: "City Sports Open - Round 1", date: "Oct 15, 2026", sport: "Taekwondo" },
  { event: "Weekly Local Scrimmage", date: "Oct 18, 2026", sport: "Taekwondo" },
];

// --- TYPES ---
type Profile = {
  id: string;
  full_name: string;
  dojo: string;
  belt_rank: string;
  category: string;
  dob: string;
  instructor: string;
  status: string;
  certificate_url?: string;
  email?: string;
};

export default function PlayerProfilePage() {
  const supabase = getSupabaseBrowserClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        console.log("No user logged in");
        return;
      }

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("PROFILE FETCH ERROR:", error.message);
        return;
      }

      setProfile({ ...data, email: user.email });

      if (data?.certificate_url) {
        const { data: signedData, error: signedError } =
          await supabase.storage
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
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center text-white font-bold">
        Loading profile...
      </div>
    );
  }

  const currentStatus = profile.status || "pending";
  const statusColor =
    currentStatus === "verified"
      ? "text-green-600"
      : currentStatus === "rejected"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <main className="relative min-h-screen font-sans">
      
      {/* 🔴 FIXED FULL-SCREEN BACKGROUND */}
      <div className="fixed inset-0 z-0 w-full h-screen">
        <img 
          src="/images/bg-arena.png" 
          className="w-full h-full object-cover" 
          alt="stadium background" 
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        {/* Added a slight dark overlay to ensure text readability against the image */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">
        
        {/* HEADER TEXT */}
        <div className="text-center mb-10 text-white drop-shadow-lg">
          <h1 className="text-4xl font-extrabold tracking-tight">Player Profile</h1>
          <p className="mt-2 text-white opacity-90 text-lg font-medium">Track your performance and tournaments</p>
        </div>

        {/* WHITE CONTENT CARD */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl p-8 md:p-12 space-y-12 border border-white">
          
          {/* PROFILE TOP SECTION */}
          <div className="flex flex-col md:flex-row items-center gap-8 border-b border-zinc-100 pb-10">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-zinc-100 flex items-center justify-center">
              <img 
                src="/images/player-avatar.png" 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-4xl font-black text-zinc-900 leading-tight">
                {profile.full_name || "New Player"}
              </h2>
              <div className="mt-2 inline-block bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                Player
              </div>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-zinc-500 text-sm font-medium">
                <p>📍 New York, USA</p>
                <p>✉️ {profile.email || "johndoe@email.com"}</p>
              </div>
            </div>
          </div>

          {/* PLAYER STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {playerStats.map((stat) => (
              <div key={stat.label} className="bg-zinc-50/50 border border-zinc-100 p-6 rounded-[32px] text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <img src={stat.icon} className="w-7 h-7" alt={stat.label} />
                </div>
                <p className="text-3xl font-black text-zinc-950">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* KARATE DETAILS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            {[
              { label: "Dojo", value: profile.dojo },
              { label: "Belt Rank", value: profile.belt_rank },
              { label: "Category", value: profile.category },
              { label: "Date of Birth", value: profile.dob },
              { label: "Instructor", value: profile.instructor },
              { 
                label: "Status", 
                value: (profile.status || "pending").toUpperCase(), 
                extraClass: statusColor 
              }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{item.label}</p>
                <p className={`font-bold text-zinc-900 ${item.extraClass || ""}`}>
                  {item.value || "Not Set"}
                </p>
              </div>
            ))}
          </div>

          {/* CERTIFICATE LINK */}
          {certificateUrl && (
            <div className="pt-2">
              <a href={certificateUrl} target="_blank" className="text-red-600 font-bold underline text-sm hover:text-red-700">
                View Official Certificate
              </a>
            </div>
          )}

          {/* EDIT BUTTON */}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]">
            Edit Profile
          </button>
        </div>

        {/* TOURNAMENTS SECTION */}
        <div className="mt-14 mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white drop-shadow-md tracking-tight">Upcoming Tournaments</h3>
            <Link href="/player/events" className="text-white font-bold text-sm underline hover:text-red-100">
              View All
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingMatches.map((match, i) => (
              <div key={i} className="bg-white/95 p-6 rounded-[35px] flex items-center gap-6 shadow-xl border border-white hover:border-red-100 transition-colors">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center shrink-0 border border-zinc-100">
                  <img 
                    src="/images/kick-icon.png" 
                    className="w-12 h-12" 
                    alt="Sport Icon" 
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-extrabold text-zinc-950 text-lg truncate">{match.event}</h4>
                  <p className="text-sm text-zinc-400 font-medium">Sport: {match.sport}</p>
                  <p className="text-sm text-red-600 font-black mt-2">Starts in {i + 3} days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}