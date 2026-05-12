"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

interface TournamentEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  location: string;
  teams: string;
  description: string;
}

export default function EventBrowsing() {
  const [userName, setUserName] = useState<string>("Loading...");
  const [previewEvent, setPreviewEvent] = useState<TournamentEvent | null>(null);

  const [events] = useState<TournamentEvent[]>([
    { id: 1, title: 'Taekwondo Open', type: 'Taekwondo', date: 'April 10-15, 2026', location: 'Cebu City, PH', teams: '32 teams', description: 'Annual regional championship for all belt levels.' },
    { id: 2, title: 'Summer Karate Bash', type: 'Karate', date: 'May 05-20, 2026', location: 'Mandaue City, PH', teams: '16 teams', description: 'Open category tournament for local community teams.' },
    { id: 3, title: 'Grandmaster Invite', type: 'Chess', date: 'June 12, 2026', location: 'Online / Cebu', teams: '64 players', description: 'Strategic battle featuring top-rated local players.' },
    { id: 4, title: 'Arnis Regional', type: 'Arnis', date: 'July 20, 2026', location: 'Lapu-Lapu City', teams: '20 teams', description: 'The ultimate stick fighting competition.' }
  ]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setUserName(data?.full_name || "User");
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HERO + HEADER CONTAINER */}
<div
  className="relative bg-cover bg-center bg-no-repeat text-white"
  style={{ backgroundImage: "url('/welcome-bg.png')" }}
>
  

  {/* Header Section */}
  <header className="relative z-10 p-4 flex justify-between items-center">
    <div className="text-xl font-bold tracking-tight text-white">
      HuddleUp
    </div>

    <div className="flex items-center gap-3">
      <Link 
        href="/player/profile" 
        className="font-medium hover:text-gray-200 transition-colors cursor-pointer"
      >
        {userName}
      </Link>

      <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white overflow-hidden shadow-sm">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
          alt="User Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <div className="relative z-10 p-10">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-2 text-white">
        Find Tournaments
      </h1>

      <p className="text-lg opacity-90 mb-6 text-white">
        Discover and join exciting tournaments near you.
      </p>

      <div className="relative max-w-lg">
        <input 
          type="text" 
          placeholder="Search tournaments, sports, locations..." 
          className="w-full p-4 pl-6 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/70 outline-none shadow-lg backdrop-blur-sm focus:ring-2 focus:ring-red-300 transition-all"
        />
      </div>
    </div>
  </div>

</div>

      {/* Event Listings Section */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Tournaments</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div 
              key={event.id}
              onClick={() => setPreviewEvent(event)}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative"
            >
              {/* Gritty Texture Overlay: image_b0a65a.jpg */}
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none grayscale" 
                style={{ backgroundImage: "url('/images/image_b0a65a.jpg')", backgroundSize: 'cover' }} 
              />
              
              <div className="bg-red-50 p-5 rounded-2xl flex-shrink-0 group-hover:bg-[#bd1e24] transition-colors duration-300">
                <img src="/images/gi-icon.png" alt="Icon" className="w-10 h-10 group-hover:invert transition-all" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[#bd1e24] text-[10px] font-black uppercase tracking-[0.2em]">{event.type}</p>
                    <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#bd1e24] transition-colors">VIEW DETAILS →</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter leading-tight group-hover:text-[#bd1e24] transition-colors">
                    {event.title}
                </h3>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center text-gray-500 text-xs font-bold">
                    <span className="text-[#bd1e24] mr-2 text-base">📅</span> {event.date}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs font-bold">
                    <span className="text-[#bd1e24] mr-2 text-base">📍</span> {event.location}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 text-[10px] font-black uppercase tracking-tighter group-hover:bg-red-50 transition-colors">
                    👥 {event.teams}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal - Dark/Gritty Theme */}
      {previewEvent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#0f0f0f] rounded-[40px] border border-white/10 p-10 max-w-xl w-full overflow-hidden shadow-2xl">
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: "url('/images/image_b0a65a.jpg')", backgroundSize: 'cover' }}
            />
            
            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[#bd1e24] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Tournament Entry</p>
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{previewEvent.title}</h2>
                </div>
                <button onClick={() => setPreviewEvent(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl mb-8">
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                    {previewEvent.description}
                </p>
              </div>

              <button className="w-full bg-[#bd1e24] hover:bg-white hover:text-black py-5 rounded-2xl font-black text-xl transition-all shadow-[0_10px_20px_rgba(189,30,36,0.3)] uppercase italic tracking-tighter">
                Enter The Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}