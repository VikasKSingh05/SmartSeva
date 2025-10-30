import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full mt-40 text-white dark:text-white font-epilogue">
      <div className=" mx-auto px-4">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10">
          <div className="bg-gradient-to-br from-[#181824]/90 via-[#22223f]/90 to-[#13131a]/95">
            <div className="px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
              <div>
                <div className="text-2xl font-extrabold bg-gradient-to-r from-[#6F01Ec] via-[#9b5cf6] to-[#03dac5] bg-clip-text text-transparent">SmartSeva</div>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  Empower change with transparency. Create, fund, and track campaigns
                  with on-chain visibility and trust.
                </p>
              </div>      
              <div>
                <div className="text-sm font-semibold text-[#03dac5] tracking-wide uppercase">Quick Links</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><Link className="hover:text-white transition" to="/">Home</Link></li>
                  <li><Link className="hover:text-white transition" to="/campaigns">Campaigns</Link></li>
                  <li><Link className="hover:text-white transition" to="/profile">Profile</Link></li>
                  <li><Link className="hover:text-white transition" to="/about">About</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#03dac5] tracking-wide uppercase">Stay Connected</div>
                <p className="mt-3 text-sm text-gray-400">Have a question or feedback?</p>
                <div className="mt-3 flex items-center gap-4">
                  <a href="https://github.com/VikasKSingh05" target="_blank" aria-label="GitHub" className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-200 transition">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="mailto:vikasianoob@gmail.com" target="_blank" aria-label="Email" className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-200 transition">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10" />
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
              <div>© {year} SmartSeva. All rights reserved.</div>
              <div className="mt-2 sm:mt-0 flex items-center gap-4">
                <Link className="hover:text-white transition" to="/terms">Terms</Link>
                <Link className="hover:text-white transition" to="/privacy">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
