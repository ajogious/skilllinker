"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AvatarUpload from "@/components/shared/AvatarUpload";
import SkillTagInput from "@/components/shared/SkillTag";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    location: "",
    bio: "",
    skills: [],
    yearsExperience: "",
    avatar: "",
  });

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (formData.skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tradesman/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          yearsExperience: parseInt(formData.yearsExperience) || 0,
          avatar: formData.avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      router.push("/tradesman");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-bold text-white">SkillLinker</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Set up your profile
          </h1>
          <p className="text-slate-400 text-sm">
            Help clients find and trust you
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-indigo-500" : "bg-slate-800"}`}
            />
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profile Photo
                </label>
                <AvatarUpload
                  currentAvatar={formData.avatar}
                  name={formData.name}
                  onUpload={(url) =>
                    setFormData((p) => ({ ...p, avatar: url }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Your Skills</h2>
              <p className="text-sm text-slate-400 -mt-3">
                Add the services you offer. This is how clients find you.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Skills & Services
                </label>
                <SkillTagInput
                  value={formData.skills}
                  onChange={(skills) => setFormData((p) => ({ ...p, skills }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Years of Experience
                </label>
                <input
                  name="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.skills.length === 0}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bio */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">About You</h2>
              <p className="text-sm text-slate-400 -mt-3">
                Write a short bio that tells clients about your work.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="e.g. I'm a certified electrician with 8 years of experience in residential and commercial installations. I prioritize safety, quality, and customer satisfaction..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none leading-relaxed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Complete Profile 🎉"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
