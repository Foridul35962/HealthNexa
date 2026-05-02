"use client";

import { motion } from "framer-motion";
import { AlertCircle, BookOpen, ShieldCheck, TrendingUp, Bell } from "lucide-react";

const alerts = [
  { type: "danger", icon: AlertCircle, tag: "Outbreak Alert", title: "Dengue cases rising in Mirpur — take precautions", time: "2 hours ago", detail: "The health ministry has reported a 40% spike in dengue cases this week. Use mosquito repellents, wear full sleeves, and remove standing water around your home." },
  { type: "info", icon: ShieldCheck, tag: "Advisory", title: "Seasonal flu vaccine now available at nearby clinics", time: "1 day ago", detail: "Get your annual flu shot before the peak season. Most participating HealthNexa clinics offer it free for children under 5." },
  { type: "tip", icon: BookOpen, tag: "Health Tip", title: "Stay hydrated — drink 8+ glasses of water daily", time: "2 days ago", detail: "Dehydration can mimic symptoms of fatigue, headaches, and even anxiety. Aim for 2–3 litres of water daily, especially in warm weather." },
  { type: "info", icon: TrendingUp, tag: "Update", title: "Air quality in Dhaka classified as 'Unhealthy' today", time: "3 days ago", detail: "AQI has reached 160. People with asthma or respiratory conditions should limit outdoor activities. Wear masks when going outside." },
];

const tagStyles: Record<string, string> = {
  danger: "bg-red-50 text-red-600 border-red-100",
  info: "bg-blue-50 text-blue-600 border-blue-100",
  tip: "bg-green-50 text-green-600 border-green-100",
};

const iconBg: Record<string, string> = {
  danger: "bg-red-50 text-red-500",
  info: "bg-blue-50 text-blue-600",
  tip: "bg-green-50 text-green-600",
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white pb-10">
      {/* Header */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
          >
            <Bell size={14} /> Community Health Dashboard
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-white"
          >
            Health Alerts & Awareness
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-blue-100 text-lg"
          >
            Stay informed about outbreaks, advisories, and health tips in your community.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-5">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={alert.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg[alert.type]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tagStyles[alert.type]}`}>
                        {alert.tag}
                      </span>
                      <span className="text-xs text-gray-400">{alert.time}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">{alert.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{alert.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
