"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Activity, Menu, X, ChevronRight, LayoutDashboard, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const EASE = [0.22, 1, 0.36, 1] as const;

const navLinks = [
  { label: "Symptom Checker", href: "/symptom-checker", patientOnly: true },
  { label: "Hospitals", href: "/hospitals", patientOnly: false },
  { label: "Medicines", href: "/medicines", patientOnly: false },
  { label: "Mental Health", href: "/mental-health", patientOnly: false },
];

const DASHBOARD_HREF: Record<string, string> = {
  patient: "/dashboard",
  admin: "/admin",
  doctor: "/doctor",
  hospitalAdmin: "/hospital-admin",
  pharmacyOwner: "/pharmacy",
  receptionist: "/receptionist",
};

const ROLE_LABEL: Record<string, string> = {
  patient: "Patient",
  admin: "Admin",
  doctor: "Doctor",
  hospitalAdmin: "Hospital Admin",
  pharmacyOwner: "Pharmacy Owner",
  receptionist: "Receptionist",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { user, fetchLoading } = useSelector((state: RootState) => state.auth);

  // scroll listener
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const role = user?.role ?? "";
  const staffRole = user?.staffRole ?? "";
  // hospitalAdmin is a staffRole, not a top-level role
  const effectiveRole = role === "hospitalStaff" && staffRole === "hospitalAdmin"
    ? "hospitalAdmin"
    : role === "hospitalStaff"
      ? staffRole
      : role;

  const dashboardHref = DASHBOARD_HREF[effectiveRole] ?? "/dashboard";
  const roleLabel = ROLE_LABEL[effectiveRole] ?? role;

  const visibleLinks = navLinks.filter((link) => {
    if (!link.patientOnly) return true;
    
    if (!user) return true;
    return effectiveRole === "patient";
  });

  // ── auth area (desktop) ──────────────────────────────────────────────────
  const AuthArea = () => {
    // still fetching (false means loading) — show skeleton
    if (!fetchLoading) {
      return (
        <div className="w-28 h-9 rounded-xl bg-blue-100 animate-pulse" />
      );
    }

    // not logged in
    if (!user) {
      return (
        <Link
          href="/login"
          className="text-sm font-bold bg-blue-100 text-blue-600 border border-blue-100 transition-all duration-300 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl active:scale-[0.98] shadow-sm shadow-blue-50/50"
        >
          Sign In
        </Link>
      );
    }

    // logged in — avatar + dropdown
    const initials = user.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-2 focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl cursor-pointer overflow-hidden border-2 border-blue-200 group-hover:border-blue-500 transition-colors shadow-sm shrink-0">
            {user.image?.url ? (
              <img
                src={user.image.url}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 cursor-pointer flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
        </button>

        <AnimatePresence>
          {dropOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden z-50"
            >
              {/* user info */}
              <div className="px-4 py-3.5 border-b border-blue-50">
                <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                <p className="text-xs text-blue-500 font-medium mt-0.5">{roleLabel}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>

              {/* dashboard link */}
              <Link
                href={dashboardHref}
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-100 bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <LayoutDashboard size={15} className="text-blue-500" />
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${scrolled
        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-50"
        : "bg-blue-50/80 backdrop-blur-md border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-xl tracking-tight">HealthNexa</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-4">
          <AuthArea />
          <Link
            href="/emergency"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-100 hover:scale-105 active:scale-95"
          >
            Emergency
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-blue-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen
            ? <X size={24} className="text-gray-700" />
            : <Menu size={24} className="text-gray-700" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-b border-blue-100 overflow-hidden shadow-xl"
          >
            <div className="px-6 py-6 space-y-2">

              {/* user info strip (mobile) — show pulse while loading */}
              {!fetchLoading && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 mb-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-blue-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-blue-200 rounded w-24" />
                    <div className="h-2.5 bg-blue-100 rounded w-16" />
                  </div>
                </div>
              )}

              {/* FIXED: show profile when data is successfully fetched */}
              {fetchLoading && user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-200 shrink-0">
                    {user.image?.url ? (
                      <img src={user.image.url} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                    <p className="text-xs text-blue-500 font-medium">{roleLabel}</p>
                  </div>
                </div>
              )}

              {/* nav links */}
              <nav className="flex flex-col gap-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-4 px-4 rounded-xl text-slate-700 font-bold hover:bg-blue-100 bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                  >
                    {link.label}
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                ))}
              </nav>

              {/* bottom actions */}
              <div className="pt-4 border-t border-blue-50 flex flex-col gap-3">
                {!fetchLoading ? (
                  <div className="h-12 rounded-xl bg-blue-100 animate-pulse" />
                ) : user ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors"
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-center py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/emergency"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-colors"
                >
                  Emergency
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}