import Link from "next/link";
import { Activity } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Symptom Checker", href: "/symptom-checker" },
    { label: "Find Hospitals", href: "/hospitals" },
    { label: "Medicine Search", href: "/medicines" },
    { label: "Emergency", href: "/emergency" },
    { label: "Mental Health", href: "/mental-health" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Community", href: "/community" },
    { label: "For Hospitals", href: "/registration/hospital" },
    { label: "For Pharmacies", href: "/registration/pharmacy" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-white font-extrabold text-lg">HealthNexa</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Smart healthcare access for everyone — AI-powered, location-aware, and built for underserved communities.
            </p>
            <p className="mt-6 text-xs text-gray-600">
              ⚠️ AI tools on this platform are assistive only. Always consult a licensed physician.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} HealthNexa. All rights reserved.</p>
          <p>Made with ❤️ for better healthcare access</p>
        </div>
      </div>
    </footer>
  );
}
