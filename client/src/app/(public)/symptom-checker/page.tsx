"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, X, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const commonSymptoms = [
  "Fever", "Headache", "Cough", "Fatigue", "Sore Throat",
  "Nausea", "Chest Pain", "Shortness of Breath", "Body Ache", "Dizziness",
];

const urgencyColors: Record<string, string> = {
  Low: "bg-green-50 text-green-600 border-green-200",
  Medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
  High: "bg-red-50 text-red-600 border-red-200",
};

export default function SymptomCheckerPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [result, setResult] = useState<null | { urgency: string; summary: string }>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (s: string) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setCustom("");
  };

  const handleCheck = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    // Simulate a brief AI delay — replace with real API call
    await new Promise((r) => setTimeout(r, 1500));
    setResult({ urgency: "Medium", summary: "Based on your symptoms, this may indicate a mild infection or viral illness." });
    setLoading(false);
  };

  return (
      <main className="min-h-screen bg-white pt-10 pb-10">
        {/* Header */}
        <section className="max-w-3xl mx-auto px-6 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
          >
            <Bot size={14} /> AI Symptom Checker
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-gray-900"
          >
            What are you feeling?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-gray-500 text-lg"
          >
            Select your symptoms and get AI-powered insights instantly.
          </motion.p>
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-8">
          {/* Common symptoms grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Common Symptoms</p>
            <div className="flex flex-wrap gap-3">
              {commonSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    selected.includes(s)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Custom symptom input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add another symptom..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <button
              onClick={addCustom}
              className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
            >
              <Plus size={18} />
            </button>
          </motion.div>

          {/* Selected symptoms */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-100 rounded-2xl p-5"
              >
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">
                  Selected ({selected.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      {s}
                      <button onClick={() => toggle(s)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={handleCheck}
            disabled={selected.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Analyzing...
              </span>
            ) : (
              <>
                Check Symptoms <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Lite Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-blue-100 rounded-2xl overflow-hidden"
              >
                <div className="bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-gray-900">AI Result (Preview)</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgencyColors[result.urgency]}`}>
                      {result.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{result.summary}</p>
                </div>

                {/* Login gate */}
                <div className="bg-blue-600 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-blue-200 shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Full result requires login</p>
                      <p className="text-blue-200 text-xs">See department recommendations, hospital matches & full AI analysis</p>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className="shrink-0 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
  );
}
