"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Navigation, Siren } from "lucide-react";

const hotlines = [
  { label: "National Emergency", number: "999", color: "text-red-600 bg-red-50 border-red-200" },
  { label: "Ambulance", number: "199", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { label: "Fire Service", number: "102", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  { label: "Health Helpline", number: "16000", color: "text-blue-600 bg-blue-50 border-blue-200" },
];

const nearestHospitals = [
  { name: "Dhaka Medical College Hospital", distance: "1.2 km", emergency: true, phone: "+880-2-55165088" },
  { name: "Square Hospital", distance: "2.8 km", emergency: true, phone: "+880-2-8159457" },
  { name: "Apollo Hospital", distance: "4.1 km", emergency: true, phone: "+880-2-8401661" },
];

export default function EmergencyPage() {
  const [alertSent, setAlertSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAlert = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAlertSent(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Hero */}
      <section className="bg-red-600 py-14">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
          >
            <Siren size={14} /> Emergency Response
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white">Need Emergency Help?</h1>
          <p className="mt-3 text-red-100 text-lg">We'll alert the nearest hospitals with your location immediately.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* SOS Button */}
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!alertSent ? (
              <motion.button
                key="sos"
                onClick={handleAlert}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-48 h-48 rounded-full bg-red-600 text-white font-black text-2xl shadow-2xl shadow-red-300 flex flex-col items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <AlertTriangle size={36} />
                    <span>SOS</span>
                    <span className="text-sm font-medium text-red-200">Tap to Alert</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div
                key="sent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-48 h-48 rounded-full bg-green-500 text-white font-black text-xl shadow-2xl shadow-green-200 flex flex-col items-center justify-center gap-2"
              >
                <span className="text-4xl">✓</span>
                <span>Alert Sent!</span>
                <span className="text-sm font-medium text-green-100">Help is coming</span>
              </motion.div>
            )}
          </AnimatePresence>

          {alertSent && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 text-gray-500 text-sm text-center max-w-xs"
            >
              Nearest hospitals have been notified with your location. Stay calm and stay on the line.
            </motion.p>
          )}
        </div>

        {/* Hotlines */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Emergency Hotlines</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {hotlines.map((h, i) => (
              <motion.a
                key={h.number}
                href={`tel:${h.number}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                className={`flex flex-col items-center justify-center gap-2 border rounded-2xl p-5 font-bold transition-all ${h.color}`}
              >
                <Phone size={20} />
                <span className="text-2xl">{h.number}</span>
                <span className="text-xs font-medium opacity-70 text-center">{h.label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Nearest hospitals */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Nearest Emergency Facilities</p>
          <div className="space-y-3">
            {nearestHospitals.map((h, i) => (
              <motion.div
                key={h.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-red-100 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{h.name}</p>
                    <p className="text-xs text-gray-400">{h.distance} · <span className="text-green-500 font-medium">Emergency Open</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${h.phone}`} className="p-2 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors">
                    <Phone size={14} />
                  </a>
                  <button className="p-2 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 transition-colors">
                    <Navigation size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
