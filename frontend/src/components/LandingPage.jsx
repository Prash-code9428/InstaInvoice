import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  ArrowRight, 
  CheckCircle, 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Coins,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  IndianRupee,
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatINR } from '../utils/format';
import Footer from './Footer';
import logo from '../assets/logo.svg';


function LandingPage() {
  // Navigation scrolling state
  const [isScrolled, setIsScrolled] = useState(false);

  // FAQ Accordion open states
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Calculator States
  const [calcProfile, setCalcProfile] = useState('Regular'); // 'Unregistered', 'Regular', 'Composition'
  const [calcPrice, setCalcPrice] = useState(5000);
  const [calcQty, setCalcQty] = useState(1);
  const [calcGst, setCalcGst] = useState(18);

  // Testimonials States
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const handleNextTestimonial = () => {
    if (testimonials.length <= 1) return;
    setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    if (testimonials.length <= 1) return;
    setActiveTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto transition testimonials carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      handleNextTestimonial();
    }, 4500); // stays for ~4.5 seconds before moving
    return () => clearInterval(interval);
  }, [testimonials, activeTestimonialIdx]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/featured`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error('Error fetching featured testimonials:', err);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Monitor scroll for sticky navbar blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to #testimonials if URL contains the hash on mount or when testimonials finish loading
  useEffect(() => {
    if (!loadingTestimonials && window.location.hash === '#testimonials') {
      const el = document.getElementById('testimonials');
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [loadingTestimonials]);

  // Compute live tax values for Simulator
  const calcSubtotal = calcPrice * calcQty;
  const calcTax = calcProfile === 'Regular' ? calcSubtotal * (calcGst / 100) : 0;
  const calcGrandTotal = calcSubtotal + calcTax;

  // FAQ Data List
  const faqs = [
    {
      question: "What if I don't have a GSTIN?",
      answer: "No problem at all! You can set up your business identity under the 'Unregistered / Micro' profile tier. This completely hides GST input boxes, skips validations, and lets you generate standard, professional tax-free bills instantly."
    },
    {
      question: "Can I print these invoices on standard A4 paper?",
      answer: "Yes, absolutely! InstaInvoice includes dedicated print style queries (@media print) that automatically hide side side-panels, headers, and dashboard buttons, letting you print physical documents that format perfectly to A4 dimensions."
    },
    {
      question: "How does the Composition Scheme work inside the app?",
      answer: "For Composition Scheme operators, CGST and SGST splits are legally omitted from calculation fields. The engine displays a clean Bill of Supply sheet and automatically appends the statutory disclaimer footer required by GST laws."
    },
    {
      question: "Is my business database data secure and isolated?",
      answer: "Yes. InstaInvoice is built with custom JWT authentication and isolated MongoDB schema scoping. Every invoice record, business profile, and catalog entry is tied to your account, preventing other users from reading or writing your records."
    }
  ];

  return (
    <div className="min-h-screen bg-cozy-cream text-cozy-charcoal font-sans antialiased selection:bg-cozy-sage/25 selection:text-cozy-sage-dark">
      
      {/* Sticky Blurred Navbar Header */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-cozy-cream/80 backdrop-blur-md border-b border-cozy-sand/70 shadow-sm py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="InstaInvoice: Simple, accessible invoicing for small businesses." 
              className="h-10 object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold hover:text-cozy-sage-dark transition-colors duration-200"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-cozy-sage text-white hover:bg-cozy-sage-dark text-sm font-semibold rounded-cozy shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center gap-8 relative overflow-hidden">
        {/* Soft Background Blur Circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-cozy-sage/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cozy-amber/5 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cozy-sand text-cozy-charcoal/80 rounded-full text-xs font-semibold tracking-wide border border-cozy-charcoal/5 shadow-sm animate-pulse">
          <Sparkles size={14} className="text-cozy-amber" />
          <span>Multi-Tenant Invoicing Made Cozy</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight leading-[1.15] max-w-4xl text-cozy-charcoal">
          Simple, stress-free billing for <span className="text-cozy-sage-dark italic underline decoration-cozy-amber decoration-wavy decoration-2 underline-offset-8">small businesses</span>
        </h1>

        <p className="text-base md:text-lg text-cozy-charcoal/70 max-w-2xl leading-relaxed">
          InstaInvoice automatically handles complex Indian GST configurations, tax exemptions, and digital outputs. Beautiful invoices, structured catalog ledgers, and zero setup stress.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
          <Link 
            to="/register" 
            className="px-8 py-3.5 bg-cozy-sage text-white hover:bg-cozy-sage-dark rounded-cozy font-medium text-base shadow-md transition-all duration-200 hover:scale-[1.02] transform active:scale-95 flex items-center justify-center gap-2"
          >
            Create a Free Account <ArrowRight size={18} />
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3.5 bg-white hover:bg-cozy-sand/20 border border-cozy-sand text-cozy-charcoal rounded-cozy font-medium text-base transition-all duration-200 hover:scale-[1.02] transform active:scale-95 text-center"
          >
            Access Your Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid (GST Registration Tiers) */}
        <section className="w-full mt-24 flex flex-col gap-10">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-cozy-charcoal">Tailored Tax Tiers for Compliance</h2>
            <p className="text-sm text-cozy-charcoal/60 max-w-md">Instantly snaps tax formulas and layouts based on your profile status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Regular Taxpayer */}
            <div className="bg-white p-8 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-cozy bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
                <Scale size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Regular Taxpayer</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cozy-sage-dark bg-cozy-sage/15 px-2 py-0.5 rounded-full inline-block mt-1">18% Default GST</span>
                <p className="text-xs text-cozy-charcoal/65 leading-relaxed mt-3">
                  Designed for registered GST businesses. Automatically computes taxable value, splits CGST & SGST taxes per item row, and verifies 15-digit GSTIN formats on legal invoices.
                </p>
              </div>
              <ul className="text-xs text-cozy-charcoal/70 flex flex-col gap-2 pt-2 mt-auto border-t border-cozy-sand/50">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-sage" /> Real-time CGST/SGST calculations</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-sage" /> Strict GSTIN validation regex</li>
              </ul>
            </div>

            {/* Composition Scheme */}
            <div className="bg-white p-8 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-cozy bg-cozy-amber/10 text-cozy-amber flex items-center justify-center">
                <Coins size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Composition Scheme</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cozy-amber bg-cozy-amber/15 px-2 py-0.5 rounded-full inline-block mt-1">Bill of Supply</span>
                <p className="text-xs text-cozy-charcoal/65 leading-relaxed mt-3">
                  For businesses paying a flat rate. Legally bars collection of tax from clients. Automatically strips tax calculations from client bills and appends the mandatory statutory footnote disclaimer.
                </p>
              </div>
              <ul className="text-xs text-cozy-charcoal/70 flex flex-col gap-2 pt-2 mt-auto border-t border-cozy-sand/50">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-amber" /> Legal "Bill of Supply" titling</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-amber" /> Mandatory footnotes appended</li>
              </ul>
            </div>

            {/* Unregistered Business */}
            <div className="bg-white p-8 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-cozy bg-cozy-charcoal/5 text-cozy-charcoal/70 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Unregistered / Micro</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cozy-charcoal/60 bg-cozy-sand px-2 py-0.5 rounded-full inline-block mt-1">Tax-Free Invoices</span>
                <p className="text-xs text-cozy-charcoal/65 leading-relaxed mt-3">
                  Tailored for micro-entrepreneurs, consultants, and side hustles. Completely eliminates tax structures and GSTIN validations, generating clean, clutter-free billing documents.
                </p>
              </div>
              <ul className="text-xs text-cozy-charcoal/70 flex flex-col gap-2 pt-2 mt-auto border-t border-cozy-sand/50">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-charcoal/60" /> Standard billing format</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-cozy-charcoal/60" /> Zero GST fields displayed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Pricing Calculator Widget Section */}
        <section className="w-full mt-28 max-w-4xl mx-auto bg-white border border-cozy-sand rounded-cozy-lg shadow-md overflow-hidden text-left hover:shadow-lg transition-all duration-300">
          <div className="bg-cozy-sand/50 p-6 border-b border-cozy-sand flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-cozy bg-cozy-sage text-white flex items-center justify-center shadow-sm">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-cozy-charcoal">Interactive Invoice Simulator</h2>
              <p className="text-xs text-cozy-charcoal/60">Choose taxpayer profiles and modify values to see GST splits live</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Interactive Controls */}
            <div className="flex flex-col gap-6">
              
              {/* Profile Tier Select pills */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">Select Profile Tier</span>
                <div className="grid grid-cols-3 gap-2 bg-cozy-cream p-1 rounded-cozy border border-cozy-sand">
                  {[
                    { key: 'Unregistered', label: 'Micro' },
                    { key: 'Regular', label: 'Regular' },
                    { key: 'Composition', label: 'Composition' }
                  ].map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setCalcProfile(tier.key)}
                      className={`py-2 text-xs font-bold rounded-cozy transition-all duration-200 cursor-pointer ${
                        calcProfile === tier.key
                          ? 'bg-white text-cozy-charcoal shadow-sm'
                          : 'text-cozy-charcoal/50 hover:text-cozy-charcoal'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Price Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">Item Base Price</span>
                  <span className="text-sm font-bold text-cozy-sage-dark font-mono">{formatINR(calcPrice)}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full accent-cozy-sage cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-cozy-charcoal/40 font-mono">
                  <span>₹100</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Quantity and GST grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Quantity */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">Quantity</span>
                  <div className="flex items-center justify-between border border-cozy-sand rounded-cozy bg-cozy-cream px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setCalcQty(Math.max(1, calcQty - 1))}
                      className="w-8 h-8 rounded-cozy bg-white border border-cozy-sand hover:bg-cozy-sand flex items-center justify-center text-cozy-charcoal/70 font-bold active:scale-95 transition-transform cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-cozy-charcoal font-mono">{calcQty}</span>
                    <button
                      type="button"
                      onClick={() => setCalcQty(calcQty + 1)}
                      className="w-8 h-8 rounded-cozy bg-white border border-cozy-sand hover:bg-cozy-sand flex items-center justify-center text-cozy-charcoal/70 font-bold active:scale-95 transition-transform cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* GST selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">GST Rate</span>
                  <select
                    disabled={calcProfile !== 'Regular'}
                    value={calcGst}
                    onChange={(e) => setCalcGst(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Mock Invoice Slip */}
            <div className="bg-cozy-cream/35 border border-cozy-sand/80 rounded-cozy-lg p-5 flex flex-col justify-between min-h-[300px] shadow-inner font-sans relative">
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-cozy-sand/65 text-[9px] uppercase tracking-wider text-cozy-charcoal/50 font-bold">
                Live Preview
              </div>
              
              <div>
                {/* Visualizer header */}
                <div className="pb-3 border-b border-cozy-sand/50 mb-4 text-left">
                  <h3 className="text-xs font-bold tracking-wide text-cozy-charcoal font-serif uppercase">
                    {calcProfile === 'Regular' ? 'Tax Invoice' : calcProfile === 'Composition' ? 'Bill of Supply' : 'Invoice / Bill'}
                  </h3>
                  <span className="text-[9px] font-mono text-cozy-charcoal/40 block mt-0.5">No: DRAFT-SIM-001</span>
                </div>

                {/* Line Item list */}
                <div className="flex flex-col gap-2.5 text-xs text-cozy-charcoal/80">
                  <div className="flex justify-between border-b border-cozy-sand/30 pb-1.5 font-semibold text-cozy-charcoal/50 text-[10px] uppercase text-left">
                    <span>Description</span>
                    <div className="flex gap-6">
                      <span>Qty</span>
                      <span className="w-20 text-right">Total</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start font-medium py-1 text-left">
                    <div>
                      <span className="block font-semibold">Mock Service / Item</span>
                      {calcProfile === 'Regular' && (
                        <span className="text-[9px] text-cozy-charcoal/50 block">GST Rate: {calcGst}%</span>
                      )}
                    </div>
                    <div className="flex gap-6 items-center">
                      <span className="font-mono text-cozy-charcoal/60">{calcQty}</span>
                      <span className="w-20 text-right font-mono font-semibold">{formatINR(calcPrice * calcQty)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* calculations splits */}
              <div className="border-t border-cozy-sand/65 pt-4 mt-6">
                <div className="flex flex-col gap-1.5 w-full text-xs text-cozy-charcoal/70">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono">{formatINR(calcSubtotal)}</span>
                  </div>
                  {calcProfile === 'Regular' && (
                    <>
                      <div className="flex justify-between text-cozy-charcoal/50">
                        <span>CGST ({calcGst / 2}%):</span>
                        <span className="font-mono">{formatINR(calcTax / 2)}</span>
                      </div>
                      <div className="flex justify-between text-cozy-charcoal/50">
                        <span>SGST ({calcGst / 2}%):</span>
                        <span className="font-mono">{formatINR(calcTax / 2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm font-bold text-cozy-charcoal border-t border-cozy-sand/50 pt-2 mt-1">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatINR(calcGrandTotal)}</span>
                  </div>
                </div>

                {/* Footnote statement */}
                {calcProfile === 'Composition' && (
                  <div className="mt-4 p-2 bg-cozy-sand/40 border border-cozy-sand text-[9px] text-cozy-charcoal/60 rounded text-center leading-normal font-semibold font-serif animate-fadeIn">
                    Composition taxable person, not eligible to collect tax on supplies
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic FAQ Accordion Section */}
        <section className="w-full mt-28 max-w-3xl mx-auto flex flex-col gap-8 text-left">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-cozy-charcoal">Frequently Asked Questions</h2>
            <p className="text-sm text-cozy-charcoal/60">Quick answers about GST compliance, paper printing, and accounts</p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-cozy-sand rounded-cozy-lg shadow-sm overflow-hidden transition-all duration-300 hover:border-cozy-sage/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm md:text-base text-cozy-charcoal hover:bg-cozy-cream/35 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-cozy-charcoal/40">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  
                  <div className={`px-6 overflow-hidden transition-all duration-300 ${
                    isOpen ? 'py-4 border-t border-cozy-sand/50 max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <p className="text-xs md:text-sm text-cozy-charcoal/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 bg-cozy-sand/20 rounded-cozy-xl border border-cozy-sand/60 scroll-mt-24 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="text-3xl font-bold font-serif text-cozy-charcoal tracking-tight">
              What Small Businesses Say
            </h2>
            <p className="text-sm text-cozy-charcoal/65 leading-relaxed">
              Real stories and direct ratings from micro-operations and small enterprise owners who run on InstaInvoice.
            </p>
          </div>

          {loadingTestimonials ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw size={24} className="animate-spin text-cozy-sage" />
            </div>
          ) : testimonials.length === 0 ? (
            /* Empty state fallback banner */
            <div className="max-w-xl mx-auto text-center bg-white border border-cozy-sand p-8 md:p-10 rounded-cozy-lg shadow-sm flex flex-col items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center font-bold text-lg">
                ✨
              </div>
              <p className="text-sm text-cozy-charcoal/70 leading-relaxed font-serif italic">
                "We are fresh out of the kitchen! Are you a small business owner using InstaInvoice? Log into your dashboard to leave us our very first review and help us grow!"
              </p>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-cozy-sage text-white hover:bg-cozy-sage-dark text-xs font-bold rounded-cozy shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                Get Started & Leave a Review
              </Link>
            </div>
          ) : (
            /* Premium Sliding Scroll Carousel */
            <div className="relative w-full max-w-2xl mx-auto py-4 flex flex-col items-center gap-6">
              
              {/* Outer Slider Wrapper containing Arrow buttons and the Track */}
              <div className="w-full flex items-center justify-between gap-4">
                {/* Left Arrow Button (Only if there are multiple testimonials) */}
                {testimonials.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevTestimonial}
                    className="p-3 rounded-full bg-white border border-cozy-sand/80 text-cozy-charcoal/60 hover:text-cozy-charcoal hover:shadow-md transition-all active:scale-90 cursor-pointer flex-shrink-0"
                    title="Previous testimonial"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Overflow hidden viewport */}
                <div className="w-full overflow-hidden py-2 px-1">
                  {/* Sliding Track */}
                  <div 
                    className="flex transition-transform duration-700 ease-in-out gap-6"
                    style={{ transform: `translateX(calc(-${activeTestimonialIdx * 100}% - ${activeTestimonialIdx * 24}px))` }}
                  >
                    {testimonials.map((t) => (
                      /* Testimonial Card */
                      <div 
                        key={t._id} 
                        className="w-full flex-shrink-0 bg-white border border-cozy-sand/70 p-6 md:p-8 rounded-cozy-lg shadow-sm flex flex-col justify-between relative overflow-hidden text-left min-h-[200px]"
                      >
                        {/* Premium Quote Mark Decoration */}
                        <div className="absolute top-2 right-4 text-7xl font-serif text-cozy-sage/10 select-none pointer-events-none">
                          ”
                        </div>

                        <div className="flex flex-col gap-3.5 text-left">
                          {/* Star Rating list */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < t.rating ? "fill-cozy-amber text-cozy-amber" : "text-cozy-sand fill-transparent"} 
                              />
                            ))}
                          </div>
                          {/* Comment */}
                          <p className="text-xs md:text-sm text-cozy-charcoal/85 font-sans italic leading-relaxed">
                            "{t.comment}"
                          </p>
                        </div>

                        {/* User details */}
                        <div className="mt-6 pt-4 border-t border-cozy-sand/40 flex items-center justify-between text-left">
                          <div>
                            <span className="text-xs font-bold text-cozy-charcoal block">{t.userName}</span>
                            <span className="text-[9px] text-cozy-charcoal/40 block mt-0.5">Verified Business Owner</span>
                          </div>
                          <span className="text-[9px] text-cozy-charcoal/40 font-mono">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow Button (Only if there are multiple testimonials) */}
                {testimonials.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextTestimonial}
                    className="p-3 rounded-full bg-white border border-cozy-sand/80 text-cozy-charcoal/60 hover:text-cozy-charcoal hover:shadow-md transition-all active:scale-90 cursor-pointer flex-shrink-0"
                    title="Next testimonial"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* Dots indicator (Only if there are multiple testimonials) */}
              {testimonials.length > 1 && (
                <div className="flex items-center gap-2 mt-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTestimonialIdx(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeTestimonialIdx 
                          ? 'w-6 bg-cozy-sage' 
                          : 'w-2.5 bg-cozy-sand hover:bg-cozy-charcoal/20'
                      }`}
                      title={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* Footer copyright */}
      <Footer />
    </div>
  );
}

export default LandingPage;
