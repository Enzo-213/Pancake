"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const role = searchParams.get("role") || "player";

  // 🔥 COMMON
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 PLAYER STATES
  const [fullName, setFullName] = useState("");
  const [dojo, setDojo] = useState("");
  const [beltRank, setBeltRank] = useState("");
  const [dob, setDob] = useState("");
  const [instructor, setInstructor] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);

  // 🔥 ORGANIZER STATES
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [karateStyle, setKarateStyle] = useState("");
  const [federation, setFederation] = useState("");
  const [position, setPosition] = useState("");
  const [orgCertificate, setOrgCertificate] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-900";

  const sectionTitle =
    "text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-3";

  const handleSignUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 PLAYER VALIDATION
    if (role === "player") {
      if (
        !email ||
        !password ||
        !fullName ||
        !dob ||
        !instructor ||
        !beltRank
      ) {
        alert(
          "Please fill in all required player fields."
        );
        setLoading(false);
        return;
      }

      if (!certificate) {
        alert(
          "Please upload your belt certification."
        );
        setLoading(false);
        return;
      }
    }

    // 🔥 ORGANIZER VALIDATION
    if (role === "organizer") {
      if (
        !email ||
        !password ||
        !orgName ||
        !location ||
        !contactNumber ||
        !karateStyle ||
        !federation ||
        !position
      ) {
        alert(
          "Please fill in all required organizer fields."
        );
        setLoading(false);
        return;
      }

      if (!orgCertificate) {
        alert(
          "Please upload your organization certificate."
        );
        setLoading(false);
        return;
      }
    }

    // 🔥 CREATE AUTH USER
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
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
      const { data: existing } =
        await supabase.auth.getUser();

      user = existing?.user;
    }

    if (!user) {
      alert(
        "User not available. Please confirm your email."
      );
      setLoading(false);
      return;
    }

    // 🔥 PLAYER CERTIFICATE
    let certificatePath = null;

    if (role === "player" && certificate) {
      const fileExt =
        certificate.name.split(".").pop();

      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("certificates")
          .upload(filePath, certificate, {
            upsert: true,
          });

      if (uploadError) {
        console.error(
          "UPLOAD ERROR:",
          uploadError.message
        );

        alert(uploadError.message);
        setLoading(false);
        return;
      }

      certificatePath = filePath;
    }

    // 🔥 ORGANIZER CERTIFICATE
    let orgCertificatePath = null;

    if (role === "organizer" && orgCertificate) {
      const fileExt =
        orgCertificate.name.split(".").pop();

      const filePath = `${user.id}/org-${Date.now()}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("certificates")
          .upload(filePath, orgCertificate, {
            upsert: true,
          });

      if (uploadError) {
        console.error(
          "ORG UPLOAD ERROR:",
          uploadError.message
        );

        alert(uploadError.message);
        setLoading(false);
        return;
      }

      orgCertificatePath = filePath;
    }

    // 🔥 SAVE PLAYER PROFILE
    if (role === "player") {
      const { error: profileError } =
        await (supabase as any)
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: fullName,
            dojo,
            belt_rank: beltRank,
            dob,
            instructor,
            certificate_url: certificatePath,
            role: "player",
            status: "pending",
          });

      if (profileError) {
        console.error(
          "PROFILE ERROR:",
          profileError.message
        );

        alert("Failed to save player profile");

        setLoading(false);
        return;
      }
    }

    // 🔥 SAVE ORGANIZER PROFILE
    if (role === "organizer") {
      const { error: orgError } =
        await (supabase as any)
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: orgName,
            dojo: location,
            instructor: position,
            contact_number: contactNumber,
            karate_style: karateStyle,
            federation,
            certificate_url: orgCertificatePath,
            role: "organizer",
            status: "pending",
          });

      if (orgError) {
        console.error(
          "ORG ERROR:",
          orgError.message
        );

        alert("Failed to save organizer profile");

        setLoading(false);
        return;
      }
    }

    alert(
      "Application submitted successfully!"
    );

    // 🔥 REDIRECTS
    if (role === "organizer") {
      router.push("/organizer/pending");
    } else {
      router.push("/player/profile");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

        {/* 🔥 HEADER */}
        <div className="border-b-4 border-red-600 bg-gray-950 px-8 py-8 text-white">

          {role === "organizer" ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                Tournament Management System
              </p>

              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">
                Organizer Verification Portal
              </h1>

              <p className="mt-3 text-sm text-gray-300 max-w-lg">
                Apply for tournament management
                access. Organizer accounts require
                approval before tournament tools are
                unlocked.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black tracking-tight">
                Player Registration
              </h1>

              <p className="mt-2 text-sm text-gray-300">
                Submit your karate credentials and
                player information.
              </p>
            </>
          )}

        </div>

        {/* 🔥 FORM */}
        <form
          onSubmit={handleSignUp}
          className="p-8 space-y-8"
        >

          {/* COMMON */}
          <section>
            <p className={sectionTitle}>
              Account Credentials
            </p>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className={inputStyle}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className={inputStyle}
                required
              />

            </div>
          </section>

          {/* PLAYER FORM */}
          {role === "player" && (
            <>
              <section>
                <p className={sectionTitle}>
                  Player Information
                </p>

                <div className="grid gap-4 md:grid-cols-2">

                  <input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    className={inputStyle}
                    required
                  />

                  <input
                    placeholder="Dojo / Club"
                    value={dojo}
                    onChange={(e) =>
                      setDojo(e.target.value)
                    }
                    className={inputStyle}
                  />

                  <input
                    type="date"
                    value={dob}
                    onChange={(e) =>
                      setDob(e.target.value)
                    }
                    className={inputStyle}
                    required
                  />

                  <input
                    placeholder="Instructor"
                    value={instructor}
                    onChange={(e) =>
                      setInstructor(e.target.value)
                    }
                    className={inputStyle}
                    required
                  />

                  <select
                    value={beltRank}
                    onChange={(e) =>
                      setBeltRank(e.target.value)
                    }
                    className={inputStyle}
                    required
                  >
                    <option value="">
                      Belt Rank
                    </option>

                    <option>White</option>
                    <option>Yellow</option>
                    <option>Green</option>
                    <option>Blue</option>
                    <option>Purple</option>
                    <option>Brown</option>
                    <option>Black</option>
                  </select>

                </div>
              </section>

              <section>
                <p className={sectionTitle}>
                  Verification Documents
                </p>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setCertificate(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-700"
                  required
                />
              </section>
            </>
          )}

          {/* ORGANIZER FORM */}
          {role === "organizer" && (
            <>
              {/* ORGANIZER IDENTITY */}
              <section>
                <p className={sectionTitle}>
                  Organizer Identity
                </p>

                <div className="grid gap-4 md:grid-cols-2">

                  <input
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) =>
                      setContactNumber(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  />

                  <input
                    placeholder="Role / Position"
                    value={position}
                    onChange={(e) =>
                      setPosition(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  />

                </div>
              </section>

              {/* ORGANIZATION DETAILS */}
              <section>
                <p className={sectionTitle}>
                  Organization Details
                </p>

                <div className="grid gap-4 md:grid-cols-2">

                  <input
                    placeholder="Organization / Dojo Name"
                    value={orgName}
                    onChange={(e) =>
                      setOrgName(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  />

                  <input
                    placeholder="Location / City"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  />

                  <select
                    value={karateStyle}
                    onChange={(e) =>
                      setKarateStyle(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  >
                    <option value="">
                      Karate Style
                    </option>

                    <option>
                      Shorin-Ryu
                    </option>

                    <option>
                      Goju-Ryu
                    </option>

                    <option>
                      Shotokan
                    </option>

                    <option>
                      Shito-Ryu
                    </option>

                    <option>
                      Wado-Ryu
                    </option>

                    <option>
                      Others
                    </option>
                  </select>

                  <select
                    value={federation}
                    onChange={(e) =>
                      setFederation(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    required
                  >
                    <option value="">
                      Federation / Association
                    </option>

                    <option>OSSA</option>
                    <option>PKF</option>
                    <option>
                      Independent
                    </option>
                  </select>

                </div>
              </section>

              {/* VERIFICATION */}
              <section>
                <p className={sectionTitle}>
                  Verification Documents
                </p>

                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">

                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Upload Organization Certificate
                  </p>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setOrgCertificate(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full border border-gray-300 p-3 rounded-xl bg-white text-gray-700"
                    required
                  />

                </div>
              </section>
            </>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-black uppercase tracking-wide py-4 rounded-2xl hover:bg-red-700 transition"
          >
            {loading
              ? "Submitting..."
              : role === "organizer"
              ? "Submit for Verification"
              : "Create Player Account"}
          </button>

        </form>
      </div>
    </main>
  );
}

