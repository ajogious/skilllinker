/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import AvatarUpload from "@/components/shared/AvatarUpload";
import SkillTagInput from "@/components/shared/SkillTag";
import { useToast } from "@/hooks/use-toast";
import {
  LoadingSpinner,
  PageLoading,
} from "@/components/shared/LoadingSpinner";

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    skills: [],
    yearsExperience: "",
    avatar: "",
  });

  useEffect(() => {
    fetch("/api/tradesman/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        setFormData({
          name: p.user.name || "",
          location: p.user.location || "",
          bio: p.bio || "",
          skills: p.skills || [],
          yearsExperience: p.yearsExperience?.toString() || "0",
          avatar: p.user.avatar || "",
        });
      })
      .catch(() =>
        toast({
          title: "Load failed",
          description: "Failed to load profile.",
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

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

      toast({
        title: "Profile saved!",
        description: "Your changes have been saved successfully.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err.message || "Failed to save.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">
              Profile Photo
            </h2>
            <AvatarUpload
              currentAvatar={formData.avatar}
              name={formData.name}
              onUpload={(url) => setFormData((p) => ({ ...p, avatar: url }))}
            />
          </div>

          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">
              Skills & Services
            </h2>
            <SkillTagInput
              value={formData.skills}
              onChange={(skills) => setFormData((p) => ({ ...p, skills }))}
            />
          </div>

          {/* Bio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">About Me</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              placeholder="Tell clients about your experience, specialties, and approach to work..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.bio.length}/500
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
