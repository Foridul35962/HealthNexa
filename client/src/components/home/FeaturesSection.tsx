"use client";

import { motion } from "framer-motion";
import { Bot, MapPin, QrCode, AlertTriangle, Pill, Brain } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Symptom Checker",
    description: "Input your symptoms and get AI-powered condition insights, urgency levels, and next steps instantly.",
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    icon: MapPin,
    title: "Smart Hospital Finder",
    description: "Location-based search to find nearby hospitals & clinics with distance, contact, and real-time availability.",
    color: "bg-sky-50 text-sky-600",
    border: "border-sky-100",
  },
  {
    icon: QrCode,
    title: "QR Appointment & Live Token",
    description: "Book online, get a QR code, scan at reception — then track your token and estimated wait time live.",
    color: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Alert",
    description: "One-click emergency button sends your live location to nearest hospitals and emergency contacts.",
    color: "bg-red-50 text-red-500",
    border: "border-red-100",
  },
  {
    icon: Pill,
    title: "Medicine Tracker",
    description: "Search medicines, view nearby pharmacy stock in real-time, and compare prices to find the best option.",
    color: "bg-green-50 text-green-600",
    border: "border-green-100",
  },
  {
    icon: Brain,
    title: "Mental Health Support",
    description: "Anonymous AI chat, mood tracking, and personalized wellness suggestions for your mental wellbeing.",
    color: "bg-purple-50 text-purple-600",
    border: "border-purple-100",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Platform Features</span>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Everything healthcare in one place</h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            From symptom checking to emergency alerts — HealthNexa has every step covered.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white border ${feature.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
