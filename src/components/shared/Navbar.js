/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "@/components/shared/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = session?.user?.role;

  const navLinks = {
    CLIENT: [
      { href: "/client", label: "Dashboard" },
      { href: "/client/browse", label: "Find Tradesmen" },
      { href: "/client/jobs", label: "My Jobs" },
    ],
    TRADESMAN: [
      { href: "/tradesman", label: "Dashboard" },
      { href: "/tradesman/jobs", label: "Job Requests" },
      { href: "/tradesman/edit", label: "My Profile" },
    ],
    ADMIN: [{ href: "/admin", label: "Admin Panel" }],
  };

  const links = navLinks[role] || [];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={
              role === "CLIENT"
                ? "/client"
                : role === "TRADESMAN"
                  ? "/tradesman"
                  : "/"
            }
            className="flex items-center gap-2"
          >
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
            <span className="font-bold text-white tracking-tight">
              SkillLinker
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: bell + user */}
          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            {session?.user && <NotificationBell />}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      className="w-7 h-7 rounded-full object-cover"
                      alt="avatar"
                    />
                  ) : (
                    <span className="text-xs font-bold text-indigo-400">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-300 hidden sm:block max-w-24 truncate">
                  {session?.user?.name}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-700">
                    <p className="text-xs font-medium text-white truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {session?.user?.email}
                    </p>
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                        role === "CLIENT"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : role === "TRADESMAN"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {role}
                    </span>
                  </div>

                  {/* Mobile nav links */}
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors md:hidden"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors mt-1 border-t border-slate-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
