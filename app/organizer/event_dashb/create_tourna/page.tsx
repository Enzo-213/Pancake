"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { 
  ChevronLeft, 
  ChevronDown, 
  CalendarDays, 
  MapPin, 
  Search, 
  PlusCircle, 
  Users, 
  Zap, 
  CircleDollarSign 
} from "lucide-react";

type TournamentData = {
  name: string;
  sport: string;
  type: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  location: string;
  regStartDate: string;
  regEndDate: string;
  maxParticipants: string;
  entryFee: string;
  rules: string;
};

const initialData: TournamentData = {
  name: "",
  sport: "",
  type: "",
  category: "",
  description: "",
  startDate: "",
  endDate: "",
  venue: "",
  location: "",
  regStartDate: "",
  regEndDate: "",
  maxParticipants: "",
  entryFee: "",
  rules: "",
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // AUTH & STATE
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TournamentData>(initialData);

  // 1. Fetch User and listen to session updates to prevent "Loading Session..." lock
  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (error || !user) {
          router.push("/login"); // Redirect if token is missing
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) {
          setLoadingAuth(false); // Fixed direct state update
        }
      }
    }

    checkUser();

    // Alternate listener case if cookie sync is slightly delayed on refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        setLoadingAuth(false);
      } else if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("tournaments") 
      .insert({
        tournament_name: formData.name,
        sport: formData.sport,
        tournament_type: formData.type,
        category: formData.category,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        venue: formData.venue,
        location: formData.location,
        reg_start_date: formData.regStartDate,
        reg_end_date: formData.regEndDate,
        max_participants: parseInt(formData.maxParticipants) || 0,
        entry_fee: parseFloat(formData.entryFee) || 0,
        rules_guidelines: formData.rules,
        organizer_id: user.id, // Linking to the authenticated user
        status: "draft"
      });

    if (error) {
      alert("Error: " + error.message);
      setIsSubmitting(false);
    } else {
      alert("Tournament Created Successfully!");
      router.push("/organizer/dashboard");
    }
  };

  // Reusable Components
  const InputField = ({ label, name, type = "text", placeholder, icon }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name as keyof TournamentData]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm"
        />
        {icon && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
      </div>
    </div>
  );

  const PreviewItem = ({ icon, label, value }: any) => (
    <div className="flex justify-between items-center text-sm py-3 border-b border-dashed border-gray-100 last:border-0 group">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className={`font-bold text-sm truncate max-w-[140px] ${value === "Not Specified" ? "text-gray-400 italic font-normal" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-semibold animate-pulse">Loading Session...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-no-repeat bg-top font-sans pb-16 antialiased text-gray-900"
      style={{ backgroundImage: "url('/images/bg-arena.png')" }}
    >
      {/* HERO BANNER BLOCK CONTAINER */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden text-white">
        <div className="max-w-7xl mx-auto flex flex-col relative z-10 gap-2">
          <div>
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-100 hover:text-white mb-2 transition-colors bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
            >
              ← Back to Tournaments
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Create Tournament
            </h1>
            <p className="text-red-100 text-sm mt-1 font-medium">
              Configure and launch a new competitive event tier
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* FORM PANEL */}
          <div className="lg:col-span-3 bg-white/95 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100/50 backdrop-blur-sm space-y-10">
            
            {/* Basic Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField label="Tournament Name" name="name" placeholder="Enter Tournament Name" />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">Sport</label>
                  <div className="relative">
                    <select 
                      name="sport" 
                      onChange={handleInputChange} 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm appearance-none"
                    >
                      <option value="">Select Sport</option>
                      <option value="Shorin-Ryu">Shorin-Ryu Karate</option>
                      <option value="Goju-Ryu">Goju-Ryu Karate</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <InputField label="Tournament Type" name="type" placeholder="e.g. Open Championship" />
                <InputField label="Tournament Category" name="category" placeholder="e.g. Senior Kumite" />
                
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-0.5 ml-1">Description</label>
                  <textarea 
                    name="description" 
                    onChange={handleInputChange} 
                    rows={4} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm text-sm resize-none" 
                    placeholder="Enter tournament details, registration info, or general parameters..." 
                  />
                </div>
              </div>
            </section>

            {/* Date & Location */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight border-b pb-3 border-gray-100">
                Date & Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField label="Start Date" name="startDate" type="date" icon={<CalendarDays size={18}/>} />
                <InputField label="End Date" name="endDate" type="date" icon={<CalendarDays size={18}/>} />
                <InputField label="Venue" name="venue" placeholder="Enter Venue Location" />
                <InputField label="Location" name="location" placeholder="City, Country" icon={<MapPin size={18} />} />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100">
              <button 
                onClick={() => router.back()} 
                className="h-12 px-8 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-bold text-sm tracking-wide active:scale-[0.99]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={isSubmitting}
                className="h-12 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-sm tracking-wide shadow-md shadow-red-600/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Creating Configuration..." : "Create Tournament"}
              </button>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <aside className="bg-white/95 rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 border border-gray-100/50 backdrop-blur-sm h-fit space-y-6 lg:sticky lg:top-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
              Live Registry Preview
            </h2>
            
            <div className="flex flex-col items-center gap-4 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100/50">
                <Zap size={28} />
              </div>
              <div className="text-center w-full px-2">
                <p className={`text-xl font-extrabold tracking-tight truncate ${formData.name ? "text-gray-900" : "text-gray-300 italic font-medium"}`}>
                  {formData.name || "Untitled Tournament"}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                  Draft Stage
                </span>
              </div>
            </div>

            <div className="pt-2">
              <PreviewItem icon={<Search size={15}/>} label="Sport" value={formData.sport || "Not Specified"} />
              <PreviewItem icon={<CalendarDays size={15}/>} label="Date" value={formData.startDate || "Not Specified"} />
              <PreviewItem icon={<PlusCircle size={15}/>} label="Venue" value={formData.venue || "Not Specified"} />
              <PreviewItem icon={<MapPin size={15}/>} label="Location" value={formData.location || "Not Specified"} />
              <PreviewItem icon={<Users size={15}/>} label="Capacity" value={formData.maxParticipants || "Not Specified"} />
              <PreviewItem icon={<CircleDollarSign size={15}/>} label="Fee" value={formData.entryFee ? `$${formData.entryFee}` : "Not Specified"} />
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}