/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";

export default function AvatarUpload({ currentAvatar, name, onUpload }) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    setUploading(true);

    // Preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        onUpload(data.url);
      } catch (err) {
        setError("Upload failed. Try again.");
        setPreview(currentAvatar || null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar preview */}
      <div className="relative w-20 h-20 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-indigo-400">
            {name?.[0]?.toUpperCase() || "U"}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
            <svg
              className="animate-spin w-5 h-5 text-indigo-400"
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
          </div>
        )}
      </div>

      {/* Upload button */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </button>
        <p className="text-xs text-slate-500 mt-1.5">JPG, PNG up to 5MB</p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    </div>
  );
}
