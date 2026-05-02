"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Activity, Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { label: "Symptom Checker", href: "/symptom-checker" },
  { label: "Hospitals", href: "/hospitals" },
  { label: "Medicines", href: "/medicines" },
  { label: "Mental Health", href: "/mental-health" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    // sticky layout logic added here
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-50"
          : "bg-blue-50/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {/* Fixed Height: h-20 (same as your reference) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-xl tracking-tight">HealthNexa</span>
        </Link>

        {/* Desktop Nav: Middle portion */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-4"
          >
            Login
          </Link>
          <Link
            href="/emergency"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 hover:scale-105 active:scale-95"
          >
            Emergency
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-blue-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown with Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-b border-blue-100 overflow-hidden shadow-xl"
          >
            <div className="px-6 py-8 space-y-2">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-4 px-4 rounded-xl text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                  >
                    {link.label}
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-6 border-t border-blue-50 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3.5 rounded-xl border-2 border-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}