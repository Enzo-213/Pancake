"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Define the interface to solve the TypeScript 'never' errors
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
  // Explicitly typing the state to allow either the Event object or null
  const [previewEvent, setPreviewEvent] = useState<TournamentEvent | null>(null);

  // Mock data for the 3 event listings
  const [events] = useState<TournamentEvent[]>([
    { 
      id: 1, 
      title: 'Taekwondo Open', 
      type: 'Taekwondo', 
      date: 'April 10-15, 2026', 
      location: 'Cebu City, Philippines', 
      teams: '32 teams', 
      description: 'Annual regional championship for all belt levels held at the Cebu City Sports Center.' 
    },
    { 
      id: 2, 
      title: 'Summer Basketball League', 
      type: 'Basketball', 
      date: 'May 05-20, 2026', 
      location: 'Mandaue City, Philippines', 
      teams: '16 teams', 
      description: 'Open category tournament for local community teams with a focus on sportsmanship.' 
    },
    { 
      id: 3, 
      title: 'Chess Grandmaster Invite', 
      type: 'Chess', 
      date: 'June 12, 2026', 
      location: 'Online / Cebu IT Park', 
      teams: '64 players', 
      description: 'A strategic battle featuring top-rated local players in a single-elimination format.' 
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <header className="bg-[#D32F2F] text-white p-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold tracking-tight">HuddleUp</div>
        
        {/* Clickable name redirects to player's profile page */}
        <div className="flex items-center gap-3">
          <Link 
            href="/player/profile" 
            className="font-medium hover:text-gray-200 transition-colors cursor-pointer"
          >
            Michael Anderson
          </Link>
          <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white overflow-hidden shadow-sm">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <div className="bg-gradient-to-r from-[#E53935] to-[#C62828] p-10 text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Find Tournaments</h1>
          <p className="text-lg opacity-90 mb-6">Discover and join exciting tournaments near you.</p>
          <div className="relative max-w-lg">
            <input 
              type="text" 
              placeholder="Search tournaments, sports, locations..." 
              className="w-full p-4 pl-6 rounded-full text-gray-800 outline-none shadow-lg focus:ring-2 focus:ring-red-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Event Listings Section */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Tournaments</h2>
        
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div 
              key={event.id}
              onClick={() => setPreviewEvent(event)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-red-200 hover:shadow-lg transition-all group"
            >
              {/* Event Icon Placeholder */}
              <div className="bg-red-50 p-5 rounded-full group-hover:bg-red-100 transition-colors">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              {/* Event Details in a Single Row */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-gray-900">{event.title}</span>
                  <span className="text-red-600 text-sm font-bold uppercase tracking-wider">{event.type}</span>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-2 text-red-400">📅</span>
                  {event.date}
                </div>
                
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="mr-2 text-red-400">📍</span>
                  {event.location}
                </div>
                
                <div className="flex items-center justify-end text-gray-700 font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                    👥 {event.teams}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Preview Modal */}
        {previewEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{previewEvent.title}</h2>
                  <p className="text-red-600 font-bold">{previewEvent.type}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-gray-600 leading-relaxed italic border-l-4 border-red-500 pl-4">
                  {previewEvent.description}
                </p>
                <div className="text-sm text-gray-500">
                  <p><strong>Date:</strong> {previewEvent.date}</p>
                  <p><strong>Venue:</strong> {previewEvent.location}</p>
                  <p><strong>Capacity:</strong> {previewEvent.teams}</p>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewEvent(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-[0.98]"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}