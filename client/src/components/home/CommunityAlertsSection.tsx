"use client";

import { motion } from "framer-motion";
import { AlertCircle, BookOpen, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

const alerts = [
  {
    type: "alert",
    icon: AlertCircle,
    color: "text-red-500 bg-red-50 border-red-100",
    tag: "Health Alert",
    tagColor: "bg-red-50 text-red-500 border-red-100",
    title: "Dengue outbreak reported in Mirpur area",
    time: "2 hours ago",
  },
  {
    type: "tip",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    tag: "Health Tip",
    tagColor: "bg-blue-50 text-blue-600 border-blue-100",
    title: "Stay hydrated — drink 8 glasses of water daily",
    time: "5 hours ago",
  },
  {
    type: "alert",
    icon: ShieldCheck,
    color: "text-green-600 bg-green-50 border-green-100",
    tag: "Advisory",
    tagColor: "bg-green-50 text-green-600 border-green-100",
    title: "Seasonal flu vaccine now available at nearby clinics",
    time: "1 day ago",
  },
];

export default function CommunityAlertsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Community</span>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Health Alerts & Tips</h2>
            <p className="mt-2 text-gray-500">Stay informed about outbreaks and health advisories in your area.</p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
          >
            View all <ChevronRight size={16} />
          </Link>
        </motion.div>

        <div className="space-y-4">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={alert.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 bg-white border ${alert.color.split(" ")[2]} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${alert.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${alert.tagColor}`}>
                      {alert.tag}
                    </span>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                  <p className="text-gray-800 font-semibold text-sm">{alert.title}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
