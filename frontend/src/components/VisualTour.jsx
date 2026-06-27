import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, 
  Briefcase, 
  ListTodo, 
  Receipt, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from './magicui/BorderBeam';



export default function VisualTour() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  // For typing effect in step 1
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  
  // For ledger adding in step 3
  const [ledgerItems, setLedgerItems] = useState([]);

  const steps = [
    {
      title: "Signup",
      subtitle: "Join InstaInvoice in seconds",
      description: "Quick, secure email registration with zero barriers. Instantly sets up your isolated, multi-tenant workspace.",
      icon: UserPlus,
    },
    {
      title: "Business Profile",
      subtitle: "Configure business details",
      description: "Enter your GSTIN, Composition Scheme settings, or register as a micro-business to automatically align calculations.",
      icon: Briefcase,
    },
    {
      title: "Inventory Ledger",
      subtitle: "Build your catalog",
      description: "Create standard service or product lines with predefined tax rates. Makes invoice item lookup lightning fast.",
      icon: ListTodo,
    },
    {
      title: "Generate & Manage",
      subtitle: "Start invoicing instantly",
      description: "Auto-calculate CGST, SGST, IGST, print perfectly formatted A4 PDFs, and track sales performance in real-time.",
      icon: Receipt,
    }
  ];

  // Auto-advance logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 7000); // 7s per step
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Restart inner animations on step change
  useEffect(() => {
    if (activeStep === 0) {
      setSignupName('');
      setSignupEmail('');
      let nameStr = "Jane Doe";
      let emailStr = "jane@cozystudio.in";
      let nameTimer = setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
          if (i < nameStr.length) {
            setSignupName(nameStr.slice(0, i + 1));
            i++;
          } else {
            clearInterval(interval);
            // Start email typing
            let j = 0;
            const emailInterval = setInterval(() => {
              if (j < emailStr.length) {
                setSignupEmail(emailStr.slice(0, j + 1));
                j++;
              } else {
                clearInterval(emailInterval);
              }
            }, 60);
          }
        }, 80);
        return () => clearInterval(interval);
      }, 800);
      return () => clearTimeout(nameTimer);
    }

    if (activeStep === 2) {
      setLedgerItems([]);
      const rawItems = [
        { name: "Handcrafted Clay Mug", price: 850, rate: "12%" },
        { name: "Organic Linen Apron", price: 1450, rate: "18%" },
        { name: "Studio Pottery Class", price: 3200, rate: "Exempt" }
      ];
      
      const timers = rawItems.map((item, index) => {
        return setTimeout(() => {
          setLedgerItems(prev => [...prev, item]);
        }, (index + 1) * 1200);
      });

      return () => timers.forEach(clearTimeout);
    }
  }, [activeStep]);

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 print:hidden">
      <div className="text-center mb-12 flex flex-col items-center gap-2">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-cozy-charcoal">
          How InstaInvoice works
        </h2>
        <p className="text-sm text-cozy-charcoal/60 max-w-md">
          See the transition flow from registration to generating beautiful, compliant receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/40 backdrop-blur-md rounded-cozy-xl p-6 md:p-8 border border-cozy-sand shadow-sm">
        {/* Left Side: Step Stepper Navigation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/40">Steps</span>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full hover:bg-cozy-sand/50 text-cozy-charcoal/60 hover:text-cozy-charcoal transition-colors duration-200"
              title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false); // Pause on manual click
                }}
                className={`w-full text-left p-4 rounded-cozy transition-all duration-300 flex gap-4 items-start ${
                  isActive 
                    ? 'bg-white text-cozy-charcoal shadow-md border-l-4 border-cozy-sage translate-x-2' 
                    : 'hover:bg-white/50 text-cozy-charcoal/70 border-l-4 border-transparent'
                }`}
              >
                <div className={`p-2 rounded-cozy mt-0.5 transition-colors duration-300 ${
                  isActive ? 'bg-cozy-sage text-white' : 'bg-cozy-sand text-cozy-charcoal/60'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-cozy-sage-dark/80">Step {idx + 1}</span>
                    {isActive && isPlaying && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cozy-sage animate-ping" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-cozy-charcoal mt-0.5">{step.title}</h3>
                  <p className="text-xs text-cozy-charcoal/60 mt-1 line-clamp-2">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Interactive Animated Preview Screens with Framer Motion */}
        <div className="lg:col-span-7 h-[420px] md:h-[400px] w-full relative bg-cozy-cream/60 rounded-cozy border border-cozy-sand/80 overflow-hidden shadow-inner flex items-center justify-center p-4 border-beam-container">
          <BorderBeam size={180} duration={8} />
          <AnimatePresence mode="wait">
            {activeStep === 0 && (


              <motion.div 
                key="signup-tour"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 120, damping: 14 }}
                className="absolute inset-0 p-6 flex flex-col justify-center"
              >
                <div className="max-w-sm mx-auto w-full bg-white rounded-cozy p-6 shadow-sm border border-cozy-sand flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-cozy-charcoal border-b border-cozy-sand pb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cozy-sage animate-pulse" />
                    Sign Up Workspace
                  </h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-cozy-charcoal/50">Full Name</label>
                    <div className="px-3 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy text-xs text-cozy-charcoal h-8 flex items-center font-sans">
                      {signupName}
                      <span className="w-0.5 h-3.5 bg-cozy-sage ml-0.5 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-cozy-charcoal/50">Email Address</label>
                    <div className="px-3 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy text-xs text-cozy-charcoal h-8 flex items-center font-sans">
                      {signupEmail}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-cozy-charcoal/50">Password</label>
                    <div className="px-3 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy text-xs text-cozy-charcoal/40 h-8 flex items-center tracking-widest">
                      ••••••••
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-cozy-sage text-white text-xs font-semibold rounded-cozy shadow-sm flex items-center justify-center gap-1 mt-2"
                  >
                    <span>Create Workspace</span> <ArrowRight size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div 
                key="profile-tour"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 120, damping: 14 }}
                className="absolute inset-0 p-6 flex flex-col justify-center"
              >
                <div className="max-w-md mx-auto w-full bg-white rounded-cozy-lg p-5 shadow-md border border-cozy-sand relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cozy-sage/10 rounded-full -mr-8 -mt-8" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2 py-0.5 bg-cozy-amber-light text-cozy-amber-dark text-[9px] font-bold uppercase rounded-full">
                        Regular GST Taxpayer
                      </span>
                      <h4 className="font-serif font-bold text-base text-cozy-charcoal mt-1">Cozy Design Studio</h4>
                      <p className="text-[11px] text-cozy-charcoal/50">Bandra West, Mumbai, MH</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cozy-sage/10 flex items-center justify-center text-cozy-sage-dark font-bold text-sm">
                      CD
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-cozy-cream p-3 rounded-cozy border border-cozy-sand/60">
                    <div>
                      <span className="text-cozy-charcoal/40 uppercase font-bold text-[8px]">GSTIN Registration</span>
                      <p className="font-mono font-semibold text-cozy-charcoal mt-0.5">27AAAAA1111A1Z1</p>
                    </div>
                    <div>
                      <span className="text-cozy-charcoal/40 uppercase font-bold text-[8px]">State Jurisdictions</span>
                      <p className="font-semibold text-cozy-charcoal mt-0.5">Maharashtra (27)</p>
                    </div>
                    <div>
                      <span className="text-cozy-charcoal/40 uppercase font-bold text-[8px]">Primary Currency</span>
                      <p className="font-semibold text-cozy-charcoal mt-0.5">INR (₹)</p>
                    </div>
                    <div>
                      <span className="text-cozy-charcoal/40 uppercase font-bold text-[8px]">Verified Status</span>
                      <p className="font-semibold text-green-600 mt-0.5 flex items-center gap-1">
                        <CheckCircle size={10} /> Active
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] text-cozy-charcoal/40 mt-3 text-center italic">Calculations snap to CGST + SGST automatically based on Maharashtra origin</p>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div 
                key="ledger-tour"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 120, damping: 14 }}
                className="absolute inset-0 p-6 flex flex-col justify-center"
              >
                <div className="max-w-md mx-auto w-full bg-white rounded-cozy p-5 shadow-sm border border-cozy-sand">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-cozy-sand">
                    <h4 className="font-bold text-xs text-cozy-charcoal uppercase tracking-wider">Active Inventory Catalog</h4>
                    <span className="text-[10px] text-cozy-sage-dark font-semibold">Items: {ledgerItems.length}/3</span>
                  </div>
                  <div className="flex flex-col gap-2 min-h-[140px]">
                    <AnimatePresence>
                      {ledgerItems.length === 0 ? (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-cozy-charcoal/40 italic text-center my-auto"
                        >
                          Initializing Catalog List...
                        </motion.p>
                      ) : (
                        ledgerItems.map((item, i) => (
                          <motion.div 
                            key={item.name} 
                            initial={{ opacity: 0, x: -10, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 12 }}
                            className="flex justify-between items-center p-2.5 bg-cozy-cream/60 border border-cozy-sand/80 rounded-cozy hover:border-cozy-sage/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cozy-sage" />
                              <span className="text-xs font-semibold text-cozy-charcoal">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-cozy-charcoal/70">{formatINR(item.price)}</span>
                              <span className="px-1.5 py-0.5 bg-cozy-sand text-[9px] font-bold text-cozy-charcoal/60 rounded">
                                GST: {item.rate}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div 
                key="billing-tour"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 120, damping: 14 }}
                className="absolute inset-0 p-6 flex flex-col justify-center"
              >
                <div className="max-w-md mx-auto w-full bg-white rounded-cozy p-4 shadow-lg border border-cozy-sand relative">
                  <motion.div 
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 12, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 140 }}
                    className="absolute top-2 right-2 border-2 border-green-600/30 text-green-600 font-bold uppercase text-[9px] px-2 py-0.5 rounded select-none"
                  >
                    PAID & SECURED
                  </motion.div>
                  
                  <div className="text-left mb-3">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-cozy-charcoal/40">Invoice #INV-2026-001</span>
                    <p className="text-[10px] text-cozy-charcoal/60">Issued: June 27, 2026</p>
                  </div>

                  {/* Mini Invoice Table */}
                  <table className="w-full text-left text-[10px] mb-3">
                    <thead>
                      <tr className="border-b border-cozy-sand text-cozy-charcoal/50">
                        <th className="py-1">Description</th>
                        <th className="py-1 text-right">Qty</th>
                        <th className="py-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 font-medium">Organic Linen Apron</td>
                        <td className="py-1.5 text-right font-mono">1</td>
                        <td className="py-1.5 text-right font-mono">₹1,450.00</td>
                      </tr>
                      <tr className="border-b border-cozy-sand/50">
                        <td className="py-1.5 font-medium text-cozy-charcoal/50">CGST @ 9% + SGST @ 9%</td>
                        <td className="py-1.5 text-right font-mono"></td>
                        <td className="py-1.5 text-right font-mono">₹261.00</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center pt-2 border-t border-cozy-sand">
                    <span className="text-xs font-bold text-cozy-charcoal">Grand Total:</span>
                    <span className="text-xs font-mono font-bold text-cozy-sage-dark">₹1,711.00</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
