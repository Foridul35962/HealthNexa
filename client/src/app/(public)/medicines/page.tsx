"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Search, MapPin, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

// Mock data — replace with API
const mockResults: Record<string, { pharmacy: string; distance: string; stock: number; price: number }[]> = {
  paracetamol: [
    { pharmacy: "MedPlus Pharmacy", distance: "0.8 km", stock: 200, price: 8 },
    { pharmacy: "HealthCare Pharma", distance: "1.5 km", stock: 50, price: 10 },
    { pharmacy: "City Pharmacy", distance: "2.2 km", stock: 300, price: 7 },
  ],
  amoxicillin: [
    { pharmacy: "City Pharmacy", distance: "2.2 km", stock: 80, price: 45 },
    { pharmacy: "MedPlus Pharmacy", distance: "0.8 km", stock: 30, price: 50 },
  ],
};

export default function MedicinesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof mockResults["paracetamol"] | null>(null);
  const [searched, setSearched] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSearch = () => {
    const key = query.trim().toLowerCase();
    const found = mockResults[key] ?? [];
    setResults(found);
    setSearched(query.trim());
  };

  const sorted = results
    ? [...results].sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price)
    : [];

  const cheapest = sorted[0];

  return (
      <main className="min-h-screen bg-white pb-20">
        {/* Header */}
        <section className="bg-linear-to-br from-blue-600 to-blue-700 py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
            >
              <Pill size={14} /> Medicine Availability Tracker
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold text-white"
            >
              Find Medicine Near You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-blue-100 text-lg"
            >
              Compare prices & stock across nearby pharmacies instantly
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 max-w-xl mx-auto flex gap-3"
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder='e.g. "paracetamol", "amoxicillin"'
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none shadow-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Search
              </button>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {results !== null && (
              <motion.div
                key={searched}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {results.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <Pill size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No pharmacies found with <strong>{searched}</strong> in stock.</p>
                  </div>
                ) : (
                  <>
                    {/* Best deal highlight */}
                    {cheapest && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                          <TrendingDown size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-green-700 font-bold text-sm">Best Price Found</p>
                          <p className="text-green-600 text-sm">
                            <strong>{cheapest.pharmacy}</strong> — ৳{cheapest.price}/unit · {cheapest.distance} away
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sort */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 text-sm">
                        <strong className="text-gray-800">{results.length}</strong> pharmacies have{" "}
                        <strong className="text-blue-600">{searched}</strong>
                      </p>
                      <button
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1 text-sm text-blue-600 font-semibold"
                      >
                        Price {sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {sorted.map((r, i) => (
                        <motion.div
                          key={r.pharmacy}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                              <Pill size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{r.pharmacy}</p>
                              <p className="text-gray-400 text-xs flex items-center gap-1">
                                <MapPin size={10} /> {r.distance} ·{" "}
                                <span className={r.stock > 100 ? "text-green-500" : "text-yellow-500"}>
                                  {r.stock} units in stock
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-blue-600">৳{r.price}</p>
                            <p className="text-xs text-gray-400">per unit</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {results === null && (
            <div className="text-center py-20 text-gray-300">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-gray-400">Search for a medicine to see availability and prices</p>
            </div>
          )}
        </div>
      </main>
  );
}
