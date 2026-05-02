"use client";

import { motion } from "framer-motion";
import { Building2, Store, ArrowRight } from "lucide-react";
import Link from "next/link";

const cards = [
  {
    icon: Building2,
    title: "Join as Hospital",
    description:
      "Connect your hospital to HealthNexa. Manage appointments, live token queues, and reach more patients effortlessly.",
    cta: "Register Hospital",
    href: "/registration/hospital",
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
  },
  {
    icon: Store,
    title: "Register Pharmacy",
    description:
      "List your pharmacy, update medicine stock and prices in real-time, and get discovered by patients near you.",
    cta: "Register Pharmacy",
    href: "/registration/pharmacy",
    bg: "bg-white",
    hover: "hover:bg-blue-50",
    border: "border border-blue-100",
    textColor: "text-blue-600",
    descColor: "text-gray-500",
  },
];

export default function B2BSection() {
  return (
    <section className="py-24 bg-gray-50 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">For Partners</span>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Are you a hospital or pharmacy?</h2>
          <p className="mt-4 text-gray-500 text-lg max-w-lg mx-auto">
            Join the HealthNexa network and help thousands of patients find you faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const isBlue = card.bg === "bg-blue-600";
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-3xl p-8 ${card.bg} ${card.border ?? ""} ${card.hover} transition-colors`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    isBlue ? "bg-white/20" : "bg-blue-50"
                  }`}
                >
                  <Icon size={22} className={isBlue ? "text-white" : "text-blue-600"} />
                </div>

                <h3 className={`text-xl font-extrabold mb-3 ${isBlue ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isBlue ? "text-blue-100" : "text-gray-500"}`}>
                  {card.description}
                </p>

                <Link
                  href={card.href}
                  className={`inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all ${
                    isBlue
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {card.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
