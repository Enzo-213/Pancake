"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [orgName, setOrg] = useState("");
  const [position, setPos] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLoc] = useState("");

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500";

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1 ml-1";

  // 🔥 FETCH EXISTING PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("player_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error.message);
        return;
      }

      setUsername(data.username || "");
      setOrg(data.orgName || "");
      setPos(data.position || "");
      setDob(data.dob || "");
      setLoc(data.location || "");
    };

    fetchProfile();
  }, []);


  // 🔥 SAVE TO DATABASE
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("User not found");
      return;
    }

    const { error } = await (supabase as any)
      .from("organizer_profiles")
      .update({
        username,
        organization_name: orgName,
        dob,
        position,
        location,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error.message);
      alert("Failed to update profile");
      setLoading(false);
      return;
    }

    alert("Profile updated successfully!");

    // 🔥 Redirect back to profile (will refetch updated data)
    router.push("/organizer/profile");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border">

        <h1 className="text-2xl font-bold text-center mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          <div>
            <label className={labelStyle}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Organization</label>
            <input
              value={orgName}
              onChange={(e) => setOrg(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Position</label>
            <input
              value={position}
              onChange={(e) => setPos(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Location</label>
            <input
              value={location}
              onChange={(e) => setLoc(e.target.value)}
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </form>
      </div>
    </main>
  );
}

