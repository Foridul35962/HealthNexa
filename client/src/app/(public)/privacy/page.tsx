"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content: `HealthNexa ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use our Platform.

We understand that healthcare data is among the most sensitive personal information. We have built our systems with privacy as a core principle — not an afterthought. Please read this policy carefully. If you have questions or concerns, contact us at privacy@healthNexa.com.bd.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect different types of information depending on how you use the Platform:

A. Information You Provide Directly
• Name, email address, and password when you register
• Phone number and date of birth (optional, for profile)
• Symptoms you enter into the AI Symptom Checker
• Appointment details and hospital preferences
• Mood entries and notes in the mental health tracker
• Messages sent through the anonymous chat (stored anonymously)
• Contact form submissions

B. Information Collected Automatically
• Device type, browser, and operating system
• IP address and approximate location (city/region level)
• Pages visited and time spent on the Platform
• QR code scan events and token activity logs

C. Location Information
• Precise location data (with your explicit permission) for hospital finding, emergency alerts, and medicine search
• You may deny location access; some features will have limited functionality as a result

D. Information from Third Parties
• If you use Google sign-in, we receive your name and email from Google
• Hospital and pharmacy partners may share appointment or transaction data with us`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use your information only for the purposes listed below:

• To create and manage your account
• To operate the AI Symptom Checker and provide health guidance
• To show you nearby hospitals, clinics, and pharmacies based on your location
• To process appointment bookings and generate QR codes
• To power the live token and queue management system
• To send emergency alerts and notify your designated emergency contacts
• To personalize your mental health support experience
• To deliver community health alerts relevant to your area
• To improve the Platform through analytics and user feedback
• To communicate important service updates or security notices
• To comply with legal obligations

We do NOT use your health data for advertising. We do NOT sell your personal information to any third party.`,
  },
  {
    title: "4. How We Store & Protect Your Data",
    content: `We take data security seriously and implement the following measures:

• All data is encrypted in transit using TLS (HTTPS)
• Sensitive data including passwords and health records is encrypted at rest
• Our database uses MongoDB with GeoJSON indexing, hosted on secure, access-controlled infrastructure
• Access to user data is restricted to authorized personnel only, on a need-to-know basis
• We conduct regular security audits and vulnerability assessments
• Anonymous mental health chat data is stored without any personally identifiable information

Despite our best efforts, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password and to log out of shared devices.`,
  },
  {
    title: "5. Location Data",
    content: `Location is a core feature of HealthNexa. Here is how we handle it:

• We request location access only when needed (hospital search, medicine finder, emergency alert)
• Your precise location is never stored permanently — it is used in real-time and discarded after the request
• For emergency alerts, your live location is temporarily shared with nearby hospitals and your emergency contacts only for the duration of the alert
• We store only approximate location (city/area level) for analytics and community alert targeting
• You can revoke location access at any time through your browser or device settings`,
  },
  {
    title: "6. Mental Health Data",
    content: `We apply additional protections to mental health data given its sensitive nature:

• Mood tracking data is stored only under your account and is never shared with hospitals, pharmacies, or third parties
• Anonymous chat sessions do not store your name, email, or account ID — sessions are linked to a temporary anonymous token only
• We do not use mental health data for advertising, profiling, or insurance-related purposes
• Mental health data will not be disclosed to employers, family members, or insurance companies
• In exceptional circumstances where there is a credible, imminent risk to life, we may share minimal information with emergency services as required by law`,
  },
  {
    title: "7. Sharing Your Information",
    content: `We do not sell your personal data. We share information only in the following limited circumstances:

A. With Healthcare Partners
• When you book an appointment, your name, contact, and appointment details are shared with the relevant hospital
• In an emergency alert, your location and basic profile are shared with nearby hospitals you have alerted

B. With Service Providers
• We work with third-party providers for cloud hosting, email delivery, and analytics. These providers are bound by data processing agreements and cannot use your data for their own purposes.

C. With Your Consent
• We will share your data in any other way only with your explicit, informed consent

D. For Legal Reasons
• We may disclose your information if required by law, court order, or government authority in Bangladesh
• We will notify you of such requests unless legally prohibited from doing so`,
  },
  {
    title: "8. Cookies & Tracking",
    content: `HealthNexa uses cookies and similar technologies to:

• Keep you logged in across sessions (authentication cookies)
• Remember your preferences such as language and location consent
• Understand how users navigate the Platform (analytics cookies)
• Detect and prevent fraudulent activity (security cookies)

We do NOT use advertising cookies or cross-site tracking cookies.

You can manage cookie preferences through your browser settings. Disabling cookies may affect login functionality and some Platform features.`,
  },
  {
    title: "9. Data Retention",
    content: `We retain your data for as long as your account is active or as needed to provide services:

• Account data is retained for the lifetime of your account plus 30 days after deletion
• Appointment and token records are retained for 2 years for legal and audit purposes
• Mood tracking data is retained until you delete it or close your account
• Anonymous chat logs are retained for 90 days in anonymized form only
• Emergency alert logs are retained for 1 year
• You may request deletion of your personal data at any time (see Section 11)`,
  },
  {
    title: "10. Children's Privacy",
    content: `HealthNexa is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.

Users between 13 and 18 years of age should use the Platform under parental or guardian supervision. If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us at privacy@healthNexa.com.bd and we will delete the information promptly.`,
  },
  {
    title: "11. Your Rights",
    content: `You have the following rights regarding your personal data:

• Right to Access — Request a copy of all personal data we hold about you
• Right to Correction — Request correction of inaccurate or incomplete data
• Right to Deletion — Request deletion of your personal data ("right to be forgotten")
• Right to Portability — Request your data in a machine-readable format
• Right to Restrict Processing — Request that we limit how we use your data
• Right to Withdraw Consent — Withdraw consent for location access or data processing at any time
• Right to Lodge a Complaint — File a complaint with the relevant data protection authority in Bangladesh

To exercise any of these rights, email us at privacy@healthNexa.com.bd with the subject line "Privacy Request". We will respond within 14 business days.`,
  },
  {
    title: "12. Third-Party Links",
    content: `The Platform may contain links to third-party websites such as hospital websites, government health portals, or pharmacy platforms. We are not responsible for the privacy practices or content of these third-party sites.

We encourage you to read the privacy policy of every site you visit. This Privacy Policy applies solely to information collected by HealthNexa.`,
  },
  {
    title: "13. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When we make significant changes, we will:
• Update the "Last Updated" date at the top of this page
• Send a notification to your registered email address
• Display a notice on the Platform for 30 days after the change

Your continued use of HealthNexa after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: "14. Contact & Data Controller",
    content: `HealthNexa is the data controller for personal information processed on this Platform.

For all privacy-related inquiries, requests, or complaints:

Email: privacy@healthNexa.com.bd
Address: Dhanmondi, Dhaka 1209, Bangladesh
Phone: +880 1800 000 000

We aim to respond to all privacy requests within 14 business days.`,
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck size={14} /> Legal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-white"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-blue-100"
          >
            Last updated: January 2026 · We do not sell your data — ever.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Intro banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-12 flex items-start gap-3"
        >
          <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm leading-relaxed">
            Your health data is among the most personal information you can share. HealthNexa collects only what is necessary to provide our services, stores it securely, and never sells it to third parties. This policy explains exactly what we collect and why.
          </p>
        </motion.div>

        {/* Key highlights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {[
            { emoji: "🔒", title: "Encrypted Storage", desc: "All health data encrypted at rest and in transit" },
            { emoji: "🚫", title: "No Data Selling", desc: "We never sell your personal or health data to anyone" },
            { emoji: "👁️", title: "You're in Control", desc: "Access, correct, or delete your data anytime" },
          ].map((h) => (
            <div key={h.title} className="bg-white border border-blue-100 rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl mb-2">{h.emoji}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{h.title}</p>
              <p className="text-gray-400 text-xs">{h.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
