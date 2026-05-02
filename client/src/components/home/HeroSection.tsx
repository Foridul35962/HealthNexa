"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e0f0ff 1px, transparent 1px), linear-gradient(to bottom, #e0f0ff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-white via-white/80 to-blue-50/60" />
      </div>

      {/* Decorative blobs */}
      <motion.div
        className="absolute -top-32 -right-32 w-130 h-130 rounded-full bg-blue-100/60 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 -left-24 w-90 h-90 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-28 grid md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
          >
            Smart Healthcare
            <br />
            <span className="text-blue-600">Access</span> for Everyone
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg"
          >
            Check symptoms, find hospitals, book appointments & track waiting time — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              href="/symptom-checker"
              className="inline-flex items-center gap-2 border border-blue-200 hover:border-blue-400 text-blue-600 font-semibold px-6 py-3 rounded-xl bg-white transition-all duration-200"
            >
              Check Symptoms
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MapPin size={14} />
            Auto-detect my location for nearby hospitals
          </motion.button>
        </div>

        {/* Right — visual card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl shadow-blue-100/60 p-6 space-y-4">
            {/* Token card */}
            <div className="bg-blue-600 text-white rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Your Token</p>
                <p className="text-5xl font-black mt-1">A-042</p>
                <p className="text-blue-200 text-sm mt-1">Est. wait: ~12 minutes</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity size={32} className="text-white" />
              </div>
            </div>

            {/* Status steps */}
            {[
              { label: "Symptoms Checked", done: true },
              { label: "Appointment Booked", done: true },
              { label: "QR Scanned at Hospital", done: true },
              { label: "Doctor Consultation", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.done ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium ${step.done ? "text-gray-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 bg-white border border-blue-100 shadow-lg rounded-2xl px-4 py-2 text-sm font-semibold text-blue-700"
          >
            🏥 3 hospitals nearby
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 bg-white border border-blue-100 shadow-lg rounded-2xl px-4 py-2 text-sm font-semibold text-green-600"
          >
            ✅ AI Symptom Result Ready
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
