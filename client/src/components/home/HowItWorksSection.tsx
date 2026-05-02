"use client";

import { motion } from "framer-motion";
import { Stethoscope, Bot, CalendarCheck, QrCode } from "lucide-react";

const steps = [
  {
    icon: Stethoscope,
    step: "01",
    title: "Enter Your Symptoms",
    description: "Describe what you're feeling. Our AI understands natural language — no medical jargon needed.",
  },
  {
    icon: Bot,
    step: "02",
    title: "Get AI Suggestion",
    description: "Receive possible condition insights, urgency level, and the right hospital department to visit.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Book an Appointment",
    description: "Choose a nearby hospital, pick a time slot, and receive a unique QR code instantly.",
  },
  {
    icon: QrCode,
    step: "04",
    title: "Scan & Get Token",
    description: "At the hospital, scan your QR code at reception. Your token is auto-generated — track it live.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-blue-600 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-200 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
          <h2 className="mt-2 text-4xl font-extrabold text-white">How HealthNexa Works</h2>
          <p className="mt-4 text-blue-100 text-lg max-w-lg mx-auto">
            From symptom to treatment in 4 simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-6 h-px bg-white/30 z-10" />
                )}

                <div className="text-5xl font-black text-white/10 leading-none mb-4">{step.step}</div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
