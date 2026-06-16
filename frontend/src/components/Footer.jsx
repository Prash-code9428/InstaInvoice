import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalModal from './LegalModal';

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('terms');

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  return (
    <footer className="w-full bg-[#18181B] text-zinc-400 print:hidden border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 md:px-12">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 50" className="h-10 w-auto" width="220" height="50">
                {/* Notebook Icon */}
                <g transform="translate(5, 5)">
                  <rect x="2" y="2" width="32" height="38" rx="5" fill="#5D6C58" opacity="0.15" />
                  <rect x="0" y="0" width="32" height="38" rx="5" fill="#7D8C77" />
                  <rect x="28" y="2" width="3" height="34" rx="1" fill="#F4F1EA" />
                  <circle cx="16" cy="12" r="3" fill="#FDFBF7" />
                  <rect x="14" y="17" width="4" height="11" rx="1.5" fill="#FDFBF7" />
                  <rect x="-3" y="6" width="5" height="3" rx="1" fill="#5D6C58" />
                  <rect x="-3" y="14" width="5" height="3" rx="1" fill="#5D6C58" />
                  <rect x="-3" y="22" width="5" height="3" rx="1" fill="#5D6C58" />
                  <rect x="-3" y="30" width="5" height="3" rx="1" fill="#5D6C58" />
                </g>
                {/* Typography Text - White for Dark Theme */}
                <text x="50" y="33" fontFamily="'Poppins', 'Outfit', 'sans-serif'" fontSize="22" fontWeight="800" fill="#FFFFFF">
                  Insta<tspan fill="#7D8C77" fontWeight="500">Invoice</tspan>
                </text>
              </svg>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Simple, warm, and highly accessible invoicing tailored for small businesses and micro-operations.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
            <nav className="flex flex-col gap-2.5 text-sm">
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors duration-200">
                Create Invoice
              </Link>
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors duration-200">
                Inventory Ledger
              </Link>
            </nav>
          </div>

          {/* Column 3: Support & Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
            <div className="flex flex-col gap-2.5 text-sm items-start">
              <span className="text-zinc-400">Get in touch via email:</span>
              <a
                href="mailto:dev.prashisalive@gmail.com"
                className="text-zinc-355 hover:text-white font-medium transition-colors duration-200 break-all"
              >
                dev.prashisalive@gmail.com
              </a>
              <a
                href="/#testimonials"
                onClick={(e) => {
                  const el = document.getElementById('testimonials');
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer mt-2"
              >
                Testimonials
              </a>
            </div>
          </div>

          {/* Column 4: Legal & Documentation */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-sans">Legal & Documentation</h4>
            <nav className="flex flex-col gap-2.5 text-sm items-start">
              <button
                onClick={() => openModal('terms')}
                className="text-left text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => openModal('privacy')}
                className="text-left text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openModal('gst')}
                className="text-left text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                GST Guidelines
              </button>
            </nav>
          </div>

        </div>

        {/* Divider horizontal line */}
        <div className="border-t border-zinc-800 my-8"></div>

        {/* Bottom Sub-bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          {/* Left copyright block */}
          <p>© 2026 InstaInvoice. All rights reserved.</p>

          {/* Right designer signature */}
          <p className="font-semibold text-zinc-400 tracking-wide">
            Designed and Developed with ❤️ by <span className="text-zinc-350 font-bold">Prashant</span>
          </p>
        </div>

      </div>

      <LegalModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        contentType={modalType}
      />
    </footer>
  );
}

export default Footer;
