"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // AUTH STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // UI Addition for validation

  // ORGANIZER STATES (All original states preserved)
  const [username, setUsername] = useState("");
  const [orgName, setOrgName] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [karateStyle, setKarateStyle] = useState("");
  const [federation, setFederation] = useState("");
  const [position, setPosition] = useState("");
  const [orgCertificate, setOrgCertificate] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Updated styles to match UI image
  const inputWrapperStyle = "relative flex items-center w-full";
  const inputStyle = "w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 bg-[#f4f4f4] text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all";
  const labelStyle = "text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    // ORIGINAL VALIDATION LOGIC
    if (
      !email || !password || !username || !dob || !orgName || 
      !location || !contactNumber || !karateStyle || !federation || !position
    ) {
      alert("Please fill in all required organizer fields.");
      setLoading(false);
      return;
    }

    if (!orgCertificate) {
      alert("Please upload your organization certificate.");
      setLoading(false);
      return;
    }

    // 1. CREATE AUTH USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "organizer" },
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

    // 2. ORGANIZER CERTIFICATE UPLOAD
    let orgCertificatePath = null;
    if (orgCertificate) {
      const fileExt = orgCertificate.name.split(".").pop();
      const filePath = `${user.id}/org-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, orgCertificate, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }
      orgCertificatePath = filePath;
    }

    // 3. SAVE ORGANIZER PROFILE
    const { error: orgError } = await (supabase as any)
      .from("organizer_profiles")
      .upsert({
        id: user.id,
        email, 
        username,
        dob, 
        organization_name: orgName,
        location,
        contact_number: contactNumber,
        karate_style: karateStyle,
        federation,
        position,
        organization_certificate: orgCertificatePath,
        status: "pending",
      });

    if (orgError) {
      alert("Failed to save organizer profile");
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm.");
    router.push("/organizer/profile");
    setLoading(false);
  };

  return (
    <main 
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url('/images/bg-arena.png')` }} // Use your background asset
    >
      <div className="w-full max-w-[450px] bg-white p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh]">
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">
            Create Organizer Account
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign up to manage and host tournaments
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          
          {/* Section: Basic Info */}
          <div className="flex flex-col gap-3">
            <div className={inputWrapperStyle}>
              <img src="/images/org.png" className="absolute left-4 w-5 opacity-60" alt="" />
              <input 
                placeholder="Organization / Dojo Name" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)} 
                className={inputStyle} required 
              />
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/user.png" className="absolute left-4 w-5 opacity-60" alt="" />
              <input 
                placeholder="Full Name / Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className={inputStyle} required 
              />
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="flex flex-col gap-3">
            <div className={inputWrapperStyle}>
              <img src="/images/email.png" className="absolute left-4 w-5 opacity-60" alt="" />
              <input 
                type="email" placeholder="Work Email" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                className={inputStyle} required 
              />
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/lock.png" className="absolute left-4 w-5 opacity-60" alt="" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                className={inputStyle} required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 opacity-40">
                <img src={showPassword ? "/images/eye.png" : "/images/eye-off.png"} className="w-4" alt="" />
              </button>
            </div>

            <div className={inputWrapperStyle}>
              <img src="/images/lock.png" className="absolute left-4 w-5 opacity-60" alt="" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                className={inputStyle} required 
              />
            </div>
          </div>

          {/* Section: Additional Details (Preserved from original code) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className={labelStyle}>Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputStyle.replace('pl-12', 'pl-4')} required />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Contact Number</label>
              <input placeholder="Contact #" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className={inputStyle.replace('pl-12', 'pl-4')} required />
            </div>
          </div>

          <div className={inputWrapperStyle}>
            <img src="/images/location.png" className="absolute left-4 w-5 opacity-60" alt="" />
            <input placeholder="Location / City" value={location} onChange={(e) => setLocation(e.target.value)} className={inputStyle} required />
            <img src="/images/chevron.png" className="absolute right-4 w-3 opacity-30" alt="" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select value={karateStyle} onChange={(e) => setKarateStyle(e.target.value)} className={inputStyle.replace('pl-12', 'pl-4')} required>
              <option value="">Karate Style</option>
              <option>Shorin-Ryu</option><option>Goju-Ryu</option><option>Shotokan</option>
              <option>Shito-Ryu</option><option>Wado-Ryu</option><option>Others</option>
            </select>

            <select value={federation} onChange={(e) => setFederation(e.target.value)} className={inputStyle.replace('pl-12', 'pl-4')} required>
              <option value="">Federation</option>
              <option>OSSA</option><option>PKF</option><option>Independent</option>
            </select>
          </div>

          <input placeholder="Your Role / Position" value={position} onChange={(e) => setPosition(e.target.value)} className={inputStyle.replace('pl-12', 'pl-4')} required />

          <div className="bg-[#f4f4f4] p-3 rounded-lg border border-dashed border-gray-300">
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Organization Certificate</label>
            <input 
              type="file" accept="image/*,.pdf" 
              onChange={(e) => setOrgCertificate(e.target.files?.[0] || null)} 
              className="text-xs text-gray-600 w-full" required 
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-2 w-full bg-[#c1272d] text-white font-bold py-4 rounded-xl hover:bg-red-700 transition shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>

          <p className="text-center text-xs text-gray-600">
            Already have an account? <span className="text-[#c1272d] font-bold cursor-pointer hover:underline">Log in</span>
          </p>

          <div className="text-[10px] text-center text-gray-400 mt-2 leading-tight px-4">
            By signing up you agree to our <span className="font-bold text-gray-600">Terms of Service</span> and <span className="font-bold text-gray-600">Privacy Policy</span>.
          </div>
        </form>
      </div>
    </main>
  );
}