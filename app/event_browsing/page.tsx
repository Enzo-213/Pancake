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
    <div className={`min-h-screen bg-[#F8F9FA] ${montserrat.className} relative`}>
      
      {/* FIXED BACKGROUND: image_a62e6d.jpg 
          This container ensures the image stays at the top but is large enough 
          not to feel "cut off" by a small div.
      */}
      <div className="absolute top-0 left-0 w-full h-[500px] z-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/images/bg-arena.png')",
            backgroundPosition: 'center 20%' // Adjusts vertical focus of the arena
          }}
        />
        {/* Subtle gradient to blend into the white background below */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F8F9FA]" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto text-white">
        <Link href="/player/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity drop-shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          <span className="font-black text-xs uppercase tracking-widest">Back</span>
        </Link>
        
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20">
          <div className="w-6 h-6 bg-[#bd1e24] rounded-full flex items-center justify-center text-white font-bold text-[10px] border border-white/40">
              {userName.charAt(0)}
          </div>
          <span className="font-bold text-xs uppercase tracking-tighter">{userName}</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-10 pb-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2 italic tracking-tighter uppercase drop-shadow-lg">
                Find <span className="">Tournaments</span>
            </h1>
            <p className="text-white/90 text-sm md:text-base font-bold mb-8 uppercase tracking-wide drop-shadow-md">
                Discover and join exciting tournaments near you.
            </p>
            
            <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#bd1e24] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Search tournaments, sports, locations..." 
                    className="w-full bg-white p-5 pl-14 rounded-2xl text-gray-800 outline-none shadow-2xl border-none focus:ring-4 focus:ring-[#bd1e24]/20 transition-all text-sm font-bold placeholder:text-gray-400"
                />
            </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Upcoming Tournaments</h2>
            <div className="h-1 flex-1 bg-gray-200 ml-6 rounded-full opacity-20" />
        </div>
        
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