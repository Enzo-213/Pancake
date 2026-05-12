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

  // 1. Fetch User on Mount to prevent "user is not defined"
  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login"); // Redirect if not logged in
      } else {
        setUser(user);
      }
      setLoadingAuth(false);
    }
    checkUser();
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
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={formData[name as keyof TournamentData]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-400 text-sm"
        />
        {icon && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      </div>
    </div>
  );

  const PreviewItem = ({ icon, label, value }: any) => (
    <div className="flex justify-between items-center text-sm py-2 group">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-200 transition">
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <span className={`font-semibold truncate max-w-[120px] ${value === "Not Specified" ? "text-gray-400" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Session...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER SECTION */}
      <header className="relative h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url('/tournament_banner.png')` }}>
        <div className="absolute inset-0 bg-red-950/60 mix-blend-multiply"></div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <h1 className="text-4xl font-extrabold text-white">Create Tournament</h1>
        </div>
      </header>

      <main className="relative z-10 -mt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FORM PANEL */}
          <div className="lg:col-span-3 bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-12">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-red-500 hover:text-red-700 transition font-medium text-sm">
              <ChevronLeft size={18} /> Back to Tournaments
            </button>

            {/* Basic Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4 border-gray-100">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField label="Tournament Name" name="name" placeholder="Enter Tournament Name" />
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-800">Sport</label>
                    <div className="relative">
                        <select name="sport" onChange={handleInputChange} className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none appearance-none text-sm">
                            <option value="">Select Sport</option>
                            <option value="Shorin-Ryu">Shorin-Ryu Karate</option>
                            <option value="Goju-Ryu">Goju-Ryu Karate</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>
                <InputField label="Tournament Type" name="type" placeholder="e.g. Open Championship" />
                <InputField label="Tournament Category" name="category" placeholder="e.g. Senior Kumite" />
                <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-800">Description</label>
                    <textarea name="description" onChange={handleInputChange} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none text-sm resize-none" placeholder="Enter tournament description..." />
                </div>
              </div>
            </section>

            {/* Date & Location */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4 border-gray-100">Date & Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputField label="Start Date" name="startDate" type="date" icon={<CalendarDays size={18}/>} />
                <InputField label="End Date" name="endDate" type="date" icon={<CalendarDays size={18}/>} />
                <InputField label="Venue" name="venue" placeholder="Enter Venue" />
                <InputField label="Location" name="location" placeholder="Enter Location" icon={<MapPin size={18} />} />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-12 border-t border-gray-100">
                <button onClick={() => router.back()} className="h-14 px-12 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 transition font-bold text-sm">
                    Cancel
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={isSubmitting}
                  className="h-14 px-12 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-bold text-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Tournament"}
                </button>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <aside className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl h-fit space-y-10 lg:sticky lg:top-8">
            <h2 className="text-center text-xl font-bold text-gray-900">Tournament Preview</h2>
            <div className="flex flex-col items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <Zap size={40} />
                </div>
                <div className="text-center">
                    <p className={`text-2xl font-bold ${formData.name ? "text-gray-900" : "text-gray-400"}`}>
                        {formData.name || "Tournament Name"}
                    </p>
                    <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">Draft</span>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                <PreviewItem icon={<Search size={16}/>} label="Sport" value={formData.sport || "Not Specified"} />
                <PreviewItem icon={<CalendarDays size={16}/>} label="Date" value={formData.startDate || "Not Specified"} />
                <PreviewItem icon={<PlusCircle size={16}/>} label="Venue" value={formData.venue || "Not Specified"} />
                <PreviewItem icon={<MapPin size={16}/>} label="Location" value={formData.location || "Not Specified"} />
                <PreviewItem icon={<Users size={16}/>} label="Max Participants" value={formData.maxParticipants || "Not Specified"} />
                <PreviewItem icon={<CircleDollarSign size={16}/>} label="Entry Fee" value={formData.entryFee || "Not Specified"} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}