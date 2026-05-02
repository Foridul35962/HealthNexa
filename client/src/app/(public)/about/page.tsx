"use client";

import { motion } from "framer-motion";
import { Activity, Target, Users, Globe } from "lucide-react";

const values = [
  { icon: Target, title: "Our Mission", description: "Make quality healthcare accessible to every person — regardless of location, income, or literacy." },
  { icon: Users, title: "Community First", description: "Built for underserved and rural communities who need healthcare access the most." },
  { icon: Globe, title: "Tech for Good", description: "Combining AI, real-time data, and location intelligence to close the healthcare gap." },
];

const team = [
  { name: "Foridul Ibne Qauser", role: "Founder & CEO", initials: "FIQ" },
  { name: "Mahmud", role: "CTO", initials: "MM" },
  { name: "Shahadat Hossain", role: "Lead Designer", initials: "SH" },
  { name: "Sara Khan", role: "AI Engineer", initials: "SK" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Activity size={32} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold text-white"
          >
            About HealthNexa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-blue-100 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            We're on a mission to bridge the gap between people and quality healthcare — using technology to make every step faster, smarter, and more accessible.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Our Story</span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 mb-5">Why we built HealthNexa</h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>
              In Bangladesh and across South Asia, millions of people struggle to identify symptoms early, find the right hospital, or deal with long waiting times. These delays cost lives.
            </p>
            <p>
              HealthNexa was built to solve this — by combining AI-powered symptom checking, real-time hospital data, and location-based services in a single, accessible platform.
            </p>
            <p>
              Whether you're in a city or a remote village, HealthNexa helps you make faster, more informed healthcare decisions.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">What We Stand For</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-blue-50 border border-blue-100 rounded-2xl p-6"
                >
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">The People</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Our Team</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-3">
                  {member.initials}
                </div>
                <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                <p className="text-gray-400 text-xs">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
