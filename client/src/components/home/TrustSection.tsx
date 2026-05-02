"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, UserCheck, Stethoscope } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Your Data is Secure",
    description: "All personal and health data is encrypted and stored securely. We never sell your information.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Anonymous mental health sessions. Your identity is never revealed during peer or AI chat.",
  },
  {
    icon: UserCheck,
    title: "Verified Partners",
    description: "Every hospital and pharmacy on HealthNexa is verified and approved by our admin team.",
  },
  {
    icon: Stethoscope,
    title: "AI-Assisted, Not a Replacement",
    description:
      "Our AI provides guidance and insights — but always recommends consulting a real doctor for diagnosis.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Trust & Safety</span>
          <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Built with your safety in mind</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center text-sm text-blue-700"
        >
          ⚠️ HealthNexa AI is an assistive tool only. Always consult a licensed medical professional for diagnosis and treatment decisions.
        </motion.div>
      </div>
    </section>
  );
}
