"use client";

import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using HealthNexa ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.

These terms apply to all users of the Platform, including visitors, registered users, hospital partners, and pharmacy partners. HealthNexa reserves the right to update or modify these terms at any time. Continued use of the Platform after changes constitutes your acceptance of the revised terms.`,
  },
  {
    title: "2. Description of Service",
    content: `HealthNexa is a web-based healthcare access platform that provides the following services:

• AI-powered symptom checking and health guidance
• Location-based hospital and clinic discovery
• Online appointment booking and live token management via QR code
• Medicine availability and price comparison across nearby pharmacies
• Emergency alert system with location sharing
• Anonymous mental health chat support and mood tracking
• Community health alerts and educational content

HealthNexa acts as an intermediary platform connecting users with healthcare providers. We do not directly provide medical services, diagnosis, or treatment.`,
  },
  {
    title: "3. Medical Disclaimer",
    content: `HealthNexa is NOT a substitute for professional medical advice, diagnosis, or treatment.

• The AI Symptom Checker provides general health information and guidance only. It is not a diagnostic tool and should not replace consultation with a licensed medical professional.
• Always seek the advice of your physician or qualified health provider with any questions you may have regarding a medical condition.
• Never disregard professional medical advice or delay in seeking it because of information provided on this Platform.
• In case of a medical emergency, call your local emergency services (999) immediately. Do not rely solely on the HealthNexa emergency feature as your primary emergency response.
• HealthNexa and its operators shall not be held liable for any health decisions made based on the information provided through this Platform.`,
  },
  {
    title: "4. User Accounts & Registration",
    content: `To access certain features of HealthNexa, you must create an account. By registering, you agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your password and account credentials
• Accept responsibility for all activities that occur under your account
• Notify us immediately at hello@healthNexa.com.bd of any unauthorized use of your account

You must be at least 13 years of age to create an account. Users under 18 should use the Platform under parental or guardian supervision.

HealthNexa reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`,
  },
  {
    title: "5. Permitted Use",
    content: `You agree to use HealthNexa only for lawful purposes and in a manner that does not infringe the rights of others. You must NOT:

• Use the Platform to provide false or misleading health information
• Attempt to gain unauthorized access to any part of the Platform or its systems
• Use automated bots or scrapers to extract data from the Platform
• Impersonate any person, hospital, pharmacy, or healthcare provider
• Upload or transmit malicious code, viruses, or harmful content
• Use the emergency alert system for non-genuine emergencies or false alarms
• Harass, abuse, or harm other users through the mental health chat feature
• Attempt to manipulate hospital ratings, medicine prices, or review systems

Violation of these terms may result in immediate account termination and legal action where appropriate.`,
  },
  {
    title: "6. Hospital & Pharmacy Partners",
    content: `Hospitals and pharmacies listed on HealthNexa must:

• Provide accurate and up-to-date information regarding services, availability, and pricing
• Maintain valid licenses and regulatory compliance as required by Bangladeshi law
• Honor appointments booked through the Platform
• Keep medicine stock and pricing information current and accurate
• Respond to emergency alerts in a timely and professional manner

HealthNexa verifies partner listings through an admin review process but does not guarantee the accuracy of all third-party information. HealthNexa is not liable for services rendered (or not rendered) by partner hospitals or pharmacies.`,
  },
  {
    title: "7. Appointment & Token System",
    content: `The appointment booking and live token system is subject to the following conditions:

• Appointments are confirmed subject to hospital availability at the time of booking
• Users are responsible for arriving at the hospital with their QR code at the scheduled time
• Hospitals reserve the right to manage token queues and adjust estimated wait times
• HealthNexa is not responsible for delays, cancellations, or changes made by the hospital
• Token positions and estimated wait times are approximate and may vary based on actual patient flow
• Misuse of the QR code system or token queue (e.g., sharing codes, queue manipulation) is strictly prohibited`,
  },
  {
    title: "8. Emergency Alert System",
    content: `The Emergency Alert feature is designed for genuine medical emergencies only.

• By triggering an emergency alert, you consent to sharing your live location with nearby hospitals and designated emergency contacts
• Misuse of the emergency alert for non-emergency situations may result in account suspension and potential legal liability
• HealthNexa does not guarantee response times from hospitals or emergency services
• The emergency alert feature supplements but does not replace official emergency services (999)
• HealthNexa shall not be held liable for any harm resulting from delayed or failed emergency responses`,
  },
  {
    title: "9. Mental Health Services",
    content: `HealthNexa provides mental health support features including anonymous chat and mood tracking. Please note:

• The anonymous AI chat is a supportive tool and NOT a substitute for professional psychiatric or psychological care
• If you are experiencing a mental health crisis or thoughts of self-harm, please contact a licensed professional or call a crisis helpline immediately
• While we offer anonymous chat, we reserve the right to disclose information if we believe there is an imminent risk to life
• Peer support features involve other users and HealthNexa is not responsible for advice given by non-professional peer supporters
• Mood tracking data is stored securely and used only to personalize your wellness experience`,
  },
  {
    title: "10. Intellectual Property",
    content: `All content on the HealthNexa Platform — including but not limited to text, graphics, logos, icons, images, and software — is the property of HealthNexa or its content suppliers and is protected under applicable intellectual property laws.

• You may not reproduce, distribute, or create derivative works from Platform content without express written permission
• User-generated content (such as reviews or chat messages) remains your property, but you grant HealthNexa a non-exclusive license to use it for Platform improvement
• The HealthNexa name, logo, and brand elements are trademarks and may not be used without authorization`,
  },
  {
    title: "11. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, HealthNexa and its operators, directors, employees, and partners shall not be liable for:

• Any indirect, incidental, special, or consequential damages arising from your use of the Platform
• Medical decisions made based on AI symptom checker results
• Loss of data, revenue, or health outcomes related to Platform use
• Service interruptions, technical failures, or delays
• Actions or inactions of partner hospitals, pharmacies, or peer chat users

HealthNexa's total liability for any claim shall not exceed the amount paid by you (if any) for use of the Platform in the 12 months preceding the claim.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any disputes arising from these terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have questions or concerns about these Terms of Service, please contact us:

Email: legal@healthNexa.com.bd
Address: Dhanmondi, Dhaka 1209, Bangladesh
Phone: +880 1800 000 000

We aim to respond to all legal inquiries within 5 business days.`,
  },
];

export default function TermsPage() {
  return (
      <main className="min-h-screen bg-white pb-20">
        {/* Header */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
            >
              <FileText size={14} /> Legal
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold text-white"
            >
              Terms of Service
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-blue-100"
            >
              Last updated: June 2025 · Effective immediately upon use
            </motion.p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-14">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-12 flex items-start gap-3"
          >
            <FileText size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-sm leading-relaxed">
              Please read these Terms of Service carefully before using HealthNexa. By accessing or using our Platform, you agree to be legally bound by these terms. If you disagree with any part, please discontinue use immediately.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="border border-blue-100 rounded-2xl p-6 mb-12"
          >
            <p className="font-bold text-gray-900 mb-4">Table of Contents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronRight size={12} />
                  {s.title}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                id={section.title.toLowerCase().replace(/\s+/g, "-")}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="scroll-mt-24"
              >
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 pb-3 border-b border-blue-50">
                  {section.title}
                </h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
  );
}
