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

  // ORGANIZER STATES
  const [username, setUsername] = useState("");
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [karateStyle, setKarateStyle] = useState("");
  const [federation, setFederation] = useState("");
  const [position, setPosition] = useState("");
  const [orgCertificate, setOrgCertificate] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // VALIDATION
    if (
      !email ||
      !password ||
      !username ||
      !orgName ||
      !location ||
      !contactNumber ||
      !karateStyle ||
      !federation ||
      !position
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
        console.error("ORG UPLOAD ERROR:", uploadError.message);
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
        username,
        organization_name: orgName, // We use org name as full_name for organizers
        location,
        contact_number: contactNumber,
        karate_style: karateStyle,
        federation,
        position,
        organization_certificate: orgCertificatePath,
        status: "pending",
      });

    if (orgError) {
      console.error("ORG ERROR:", orgError.message);
      alert("Failed to save organizer profile");
      setLoading(false);
      return;
    }

    alert("Account created! Please check your email to confirm.");
    router.push("/organizer/profile");
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-md border">
        
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Organizer Portal
        </h1>

        <p className="text-center text-sm text-gray-500 mt-1 mb-6">
          Registering as an{" "}
          <span className="font-bold text-red-600 capitalize">
            Organizer
          </span>
        </p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">

          {/* CREDENTIALS */}
          <input
            type="email"
            placeholder="Work Email"
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

          <input 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputStyle}
            required
          /> 

          {/* ORGANIZATION DETAILS */}
          <input
            placeholder="Organization / Dojo Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className={inputStyle}
            required
          />

          <input
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className={inputStyle}
            required
          />

          <input
            placeholder="Location / City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputStyle}
            required
          />

          <select
            value={karateStyle}
            onChange={(e) => setKarateStyle(e.target.value)}
            className={inputStyle}
            required
          >
            <option value="">Karate Style</option>
            <option>Shorin-Ryu</option>
            <option>Goju-Ryu</option>
            <option>Shotokan</option>
            <option>Shito-Ryu</option>
            <option>Wado-Ryu</option>
            <option>Others</option>
          </select>

          <select
            value={federation}
            onChange={(e) => setFederation(e.target.value)}
            className={inputStyle}
            required
          >
            <option value="">Federation / Association</option>
            <option>OSSA</option>
            <option>PKF</option>
            <option>Independent</option>
          </select>

          <input
            placeholder="Your Role / Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={inputStyle}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 px-1">
              Organization Certificate (Proof of Authority)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                setOrgCertificate(e.target.files?.[0] || null)
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
            {loading ? "Processing..." : "Submit for Verification"}
          </button>

        </form>
      </div>
    </main>
  );
}