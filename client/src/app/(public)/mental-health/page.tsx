"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Wind, Sun, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

const articles = [
  {
    icon: Wind,
    tag: "Stress",
    title: "5 Breathing Techniques to Calm Anxiety Fast",
    description: "Simple, science-backed breathing exercises that activate your parasympathetic nervous system within minutes.",
    readTime: "3 min read",
  },
  {
    icon: Sun,
    tag: "Daily Habits",
    title: "How Morning Routines Improve Mental Resilience",
    description: "Consistent morning habits that build emotional strength and reduce the impact of daily stressors.",
    readTime: "4 min read",
  },
  {
    icon: Heart,
    tag: "Relationships",
    title: "Setting Healthy Boundaries Without Guilt",
    description: "Learn to communicate your needs clearly while maintaining strong, supportive relationships.",
    readTime: "5 min read",
  },
  {
    icon: Brain,
    tag: "Mindfulness",
    title: "Beginner's Guide to 10-Minute Daily Meditation",
    description: "A practical, no-fluff approach to starting a meditation habit that actually sticks.",
    readTime: "3 min read",
  },
];

const tips = [
  "Get 7–9 hours of sleep every night",
  "Limit social media to 30 min/day",
  "Connect with a friend or family member today",
  "Take a 10-minute walk outside",
  "Write down 3 things you're grateful for",
  "Drink enough water throughout the day",
];

export default function MentalHealthPage() {
  return (
    <main className="min-h-screen bg-white pb-10">
      {/* Header */}
      <section className="bg-linear-to-br from-indigo-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
          >
            <Brain size={14} /> Mental Wellbeing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-white"
          >
            Your Mental Health Matters
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-blue-100 text-lg max-w-lg mx-auto"
          >
            Resources, tips, and anonymous support — because mental health is healthcare too.
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
        {/* Articles */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">Articles & Tips</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {a.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{a.description}</p>
                  <p className="text-xs text-gray-400">{a.readTime}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick tips */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">Quick Daily Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, i) => (
              <motion.div
                key={tip}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4"
              >
                <span className="text-blue-400 font-black text-lg leading-none mt-0.5">✓</span>
                <p className="text-gray-700 text-sm font-medium leading-snug">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat CTA (login required) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Lock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-xl">Anonymous AI Chat Support</h3>
              <p className="text-blue-100 text-sm mt-1">
                Talk to an AI counselor or peer supporter — completely anonymous. Login required.
              </p>
            </div>
          </div>
          <Link
            href="/registration"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Start Chat <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
