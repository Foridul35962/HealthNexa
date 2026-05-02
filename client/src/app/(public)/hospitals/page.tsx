"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const specialties = ["All", "Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General"];

const hospitals = [
  { name: "Dhaka Medical College Hospital", distance: "1.2 km", specialty: ["Emergency", "General"], isOpen: true, phone: "+880-2-55165088", address: "Bakshibazar, Dhaka" },
  { name: "Square Hospital Ltd.", distance: "2.8 km", specialty: ["Cardiology", "Neurology"], isOpen: true, phone: "+880-2-8159457", address: "Panthapath, Dhaka" },
  { name: "Ibn Sina Hospital", distance: "3.5 km", specialty: ["Orthopedics", "Pediatrics"], isOpen: false, phone: "+880-2-8189522", address: "Dhanmondi, Dhaka" },
  { name: "Apollo Hospital Dhaka", distance: "4.1 km", specialty: ["Cardiology", "Neurology", "Emergency"], isOpen: true, phone: "+880-2-8401661", address: "Bashundhara, Dhaka" },
  { name: "Labaid Specialized Hospital", distance: "5.0 km", specialty: ["General", "Orthopedics"], isOpen: true, phone: "+880-2-9129013", address: "Dhanmondi, Dhaka" },
  { name: "United Hospital", distance: "6.3 km", specialty: ["Cardiology", "Pediatrics", "Emergency"], isOpen: false, phone: "+880-2-8836000", address: "Gulshan, Dhaka" },
];

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const {user} = useSelector((state:RootState)=>state.auth)

  const filtered = hospitals.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = activeSpecialty === "All" || h.specialty.includes(activeSpecialty);
    const matchOpen = !openOnly || h.isOpen;
    return matchSearch && matchSpecialty && matchOpen;
  });

  return (
    <main className="min-h-screen bg-white pb-10">
      {/* Header */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white"
          >
            Find Hospitals Near You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-blue-100 text-lg"
          >
            Search by name, location, or specialty
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital name or area..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-white border-b border-blue-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <SlidersHorizontal size={16} className="text-gray-400 shrink-0" />
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSpecialty(s)}
              className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-all ${activeSpecialty === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
            >
              {s}
            </button>
          ))}
          <label className="shrink-0 flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="accent-blue-600"
            />
            Open Now
          </label>
        </div>
      </section>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <p className="text-sm text-gray-400 mb-6">{filtered.length} hospitals found</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${h.isOpen ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}>
                  {h.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{h.name}</h3>
              <p className="text-blue-600 font-semibold text-sm mb-1">{h.distance}</p>
              <p className="text-gray-400 text-xs mb-3 flex items-center gap-1"><MapPin size={10} /> {h.address}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {h.specialty.map((sp) => (
                  <span key={sp} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                    {sp}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Phone size={11} /> {h.phone}
              </div>

              <Link
                href={`${user && user?.role==="patient" ? "/appointment" : "/login"}`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Book Appointment
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p>No hospitals match your search.</p>
          </div>
        )}
      </div>
    </main>
  );
}
