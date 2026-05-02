"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MentalHealthSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left visual */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                <Heart size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Mental Health Support</p>
                <p className="text-gray-400 text-xs">Anonymous & Confidential</p>
              </div>
            </div>

            {/* Chat bubbles */}
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                  I've been feeling really stressed lately...
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-700 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                  I hear you. Stress can feel overwhelming. Let's talk about what's been going on. 💙
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                  Work and family pressure both at once.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-700 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs">
                  That's a lot to carry. Here are some techniques that may help right now...
                </div>
              </div>
            </div>

            {/* Mood tracker */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Mood</p>
              <div className="flex gap-3 justify-center text-2xl">
                {["😢", "😟", "😐", "😊", "😄"].map((emoji, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      i === 3 ? "bg-blue-200 ring-2 ring-blue-400" : "hover:bg-blue-100"
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-white border border-purple-100 shadow-lg rounded-2xl px-4 py-2 text-sm font-semibold text-purple-600"
          >
            <Sparkles size={12} className="inline mr-1" />
            AI Wellness Tips
          </motion.div>
        </motion.div>

        {/* Right text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Mental Wellbeing</span>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900 leading-tight">
            You don't have to face it alone
          </h2>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            HealthNexa offers anonymous AI-powered chat support, daily mood tracking, and personalized mental wellness suggestions — all in a safe, confidential space.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { icon: MessageCircle, text: "Anonymous AI & peer chat support" },
              { icon: Heart, text: "Daily mood tracking & history" },
              { icon: Sparkles, text: "Personalized stress management tips" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

          <Link
            href="/mental-health"
            className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
          >
            Explore Mental Health Support
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
