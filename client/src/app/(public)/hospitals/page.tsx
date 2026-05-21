"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Search, SlidersHorizontal, Loader2, Navigation, AlertTriangle, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

// Redux Imports
import { getNearestHospitals, setLocation } from "@/store/slice/publicSlice";
import { AppDispatch, RootState } from "@/store/store";

const DEPARTMENTS = ["All", "Emergency", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "General"];

export default function NearestHospitalsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const initialFetchExecuted = useRef(false);

  // Selectors from Redux Store
  const { fetchLoading, nearestHospitals, publicLocation } = useSelector((state: RootState) => state.public);

  // Local UI States
  const [search, setSearch] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("All");
  const [isLocating, setIsLocating] = useState(false);

  const executeHospitalSearch = useCallback(
    async (coords: { lat: number; lon: number }, dept: string, nameQuery: string) => {
      try {
        const payload = {
          location: { lat: coords.lat, lon: coords.lon },
        };

        await dispatch(
          getNearestHospitals({
            data: payload,
            department: dept,
            name: nameQuery,
          })
        ).unwrap();
      } catch (err: any) {
        toast.error(err?.message || "Failed to parse neighborhood hospitals.");
      }
    },
    [dispatch]
  );

  const ensureLocationAndFetch = useCallback(
    async (targetDept: string, targetSearch: string, forceHardwareGPS = false) => {
      
      if (!forceHardwareGPS && publicLocation?.location?.lat && publicLocation?.location?.lon) {
        await executeHospitalSearch(
          { lat: publicLocation.location.lat, lon: publicLocation.location.lon },
          targetDept,
          targetSearch
        );
        return;
      }

      if (!navigator.geolocation) {
        toast.error("Geolocation services are not supported by your browser software.");
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          dispatch(setLocation({ lat: latitude, lon: longitude }));

          await executeHospitalSearch({ lat: latitude, lon: longitude }, targetDept, targetSearch);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          toast.error("Location access denied or timeout. Please enable device GPS.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: Infinity }
      );
    },
    [publicLocation, executeHospitalSearch, dispatch]
  );

  useEffect(() => {
    if (!initialFetchExecuted.current) {
      ensureLocationAndFetch("All", "", false);
      initialFetchExecuted.current = true;
    }
  }, [ensureLocationAndFetch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ensureLocationAndFetch(activeDepartment, search, false);
  };

  const handleDepartmentChange = (dept: string) => {
    setActiveDepartment(dept);
    ensureLocationAndFetch(dept, search, false);
  };

  const safeHospitals = Array.isArray(nearestHospitals) ? nearestHospitals : [];

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* Immersive Dynamic Header Section */}
      <section className="bg-linear-to-br from-blue-600 to-blue-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.08] bg-size-[24px_24px]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Find Closest Medical Support
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-blue-100 text-lg max-w-xl mx-auto font-medium opacity-90"
          >
            Real-time proximity matching using hardware geo-location systems.
          </motion.p>

          {/* Core Search Controller Context */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-10 max-w-2xl mx-auto flex gap-3 items-center check-form-scope"
          >
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type hospital names, neighborhoods, or sectors..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all shadow-xl shadow-blue-900/20"
              />
            </div>
            <button
              type="submit"
              disabled={fetchLoading || isLocating}
              className="bg-gray-900 text-white font-semibold text-sm px-6 py-4 rounded-2xl shadow-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {fetchLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Synchronized Sticky Filter Bar Block */}
      <section className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm border-r border-gray-200 pr-4 shrink-0">
              <SlidersHorizontal size={16} />
              <span>Specialties</span>
            </div>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => handleDepartmentChange(dept)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                  activeDepartment === dept
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* GPS Recenter */}
          <button
            onClick={() => ensureLocationAndFetch(activeDepartment, search, true)}
            disabled={isLocating || fetchLoading}
            className="shrink-0 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 px-4 py-2 rounded-xl transition-all disabled:opacity-40"
          >
            {isLocating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} className="fill-blue-600/10" />
            )}
            <span>Recenter GPS</span>
          </button>
        </div>
      </section>

      {/* Main Aggregator Listing Wrapper Context */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Proximity Results</h2>
            <p className="text-xs text-gray-400 mt-1">Sorted dynamically by physical driving distance matrix arrays</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">
            {safeHospitals.length} Facilities Found
          </span>
        </div>

        {/* Global Action State Switch Panels */}
        <AnimatePresence mode="wait">
          {fetchLoading || isLocating ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-4"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <Building2 className="absolute text-blue-600 animate-pulse" size={24} />
              </div>
              <p className="text-sm text-gray-500 font-medium animate-pulse">
                {isLocating ? "Acquiring precision GPS coordinate states..." : "Executing localized vector spatial queries..."}
              </p>
            </motion.div>
          ) : safeHospitals.length > 0 ? (
            <motion.div
              key="grid-state"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {safeHospitals.map((hospital, index) => {
                const uniqueKey = hospital._id || index
                
                return (
                  <motion.div
                    key={uniqueKey}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-blue-100 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Image Block */}
                      <div className="relative w-full h-44 rounded-2xl bg-slate-100 mb-5 overflow-hidden flex items-center justify-center border border-gray-50">
                        {hospital?.image && typeof hospital.image === 'object' && 'url' in hospital.image && hospital.image.url ? (
                          <img
                            src={hospital.image.url}
                            alt={hospital.name || "Hospital"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <Building2 size={40} className="stroke-[1.5]" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Photo Unavailable</span>
                          </div>
                        )}
                        
                        {/* Distance Tag */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-md rounded-xl px-3 py-1.5 border border-gray-100/50 flex items-center gap-1">
                          <Navigation size={11} className="text-blue-600 fill-blue-600/10" />
                          <span className="text-xs font-extrabold text-gray-800">
                            {hospital?.distanceInKm !== undefined && hospital?.distanceInKm !== null
                              ? `${hospital.distanceInKm} km`
                              : "Nearby"}
                          </span>
                        </div>
                      </div>

                      {/* Hospital Name */}
                      <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                        {hospital?.name || "Unnamed Facility"}
                      </h3>

                      {/* Address Matrix */}
                      <p className="text-gray-400 text-xs mt-2 mb-4 flex items-start gap-1.5 leading-relaxed">
                        <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>
                          {hospital?.address?.house ? `${hospital.address.house}, ` : ""}
                          {hospital?.address?.street ? `${hospital.address.street}, ` : ""}
                          {hospital?.address?.city ? hospital.address.city : ""}
                          {hospital?.address?.postalCode ? ` - ${hospital.address.postalCode}` : ""}
                          {!hospital?.address?.house && !hospital?.address?.street && !hospital?.address?.city && "Address status pending"}
                        </span>
                      </p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {hospital?.specialties && hospital.specialties.length > 0 ? (
                          hospital.specialties.map((sp: string) => (
                            <span
                              key={sp}
                              className="text-[11px] bg-blue-50/60 text-blue-600 px-2.5 py-1 rounded-lg font-semibold capitalize tracking-wide"
                            >
                              {sp}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] bg-gray-50 text-gray-400 px-2.5 py-1 rounded-lg font-medium">
                            General Services
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                        <Phone size={12} className="text-blue-500" />
                        <span className="font-medium tracking-wide">{hospital?.contactNumber || "Contact details unavailable"}</span>
                      </div>

                      <Link
                        href={`/hospitals/${hospital._id}`}
                        className="w-full text-center block bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/10 transition-all hover:shadow-xl active:scale-[0.99]"
                      >
                        View Hospital
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto px-6"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <h4 className="text-base font-bold text-gray-800">No Hospitals Found Nearby</h4>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Try widening your department filters or clearing your current location search term fields.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}