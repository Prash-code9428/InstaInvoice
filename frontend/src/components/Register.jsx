import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, User, Mail, KeyRound, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Footer from './Footer';
import logo from '../assets/logo.svg';
import LegalModal from './LegalModal';
import BackgroundEffects from './BackgroundEffects';
import { motion } from 'framer-motion';
import { BorderBeam } from './magicui/BorderBeam';




const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "In which city were you born?",
  "What was the name of your primary school?",
  "What is your favorite book or movie?"
];

function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('terms');

  const openLegalModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Auto redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors([]);
  };

  const validateForm = () => {
    const tempErrors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      tempErrors.push('Full Name is required.');
    }

    if (!formData.email.trim()) {
      tempErrors.push('Email address is required.');
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.push('Please enter a valid email address.');
    }

    if (!formData.password) {
      tempErrors.push('Password is required.');
    } else if (formData.password.length < 6) {
      tempErrors.push('Password must be at least 6 characters long.');
    }

    if (!formData.securityAnswer.trim()) {
      tempErrors.push('Security question answer is required.');
    }

    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!agreed) {
      setErrors(['You must read and agree to the Terms & Conditions and Privacy Policy to create an account.']);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.securityQuestion,
      formData.securityAnswer
    );
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors(result.errors || ['Registration failed.']);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent p-6 text-cozy-charcoal selection:bg-cozy-sage/25 selection:text-cozy-sage-dark relative">
      <BackgroundEffects />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-cozy-lg border border-cozy-sand shadow-lg p-8 flex flex-col gap-6 border-beam-container"
        >
          <BorderBeam size={180} duration={8} />




        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/">
            <img 
              src={logo} 
              alt="InstaInvoice: Simple, accessible invoicing for small businesses." 
              className="h-10 object-contain hover:scale-105 transition-transform duration-200"
            />
          </Link>
          <div>
            <p className="text-xs text-cozy-charcoal/60 mt-1">Get started with simple, compliant business billing</p>
          </div>
        </div>

        {/* Validation Errors display */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Unable to Register:</span>
            </div>
            <ul className="list-disc pl-8 mt-1 flex flex-col gap-0.5 text-xs">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="register-name" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alice Cooper"
                className="w-full pl-10 pr-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="register-email" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200 lowercase"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="register-password" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-charcoal/40 hover:text-cozy-charcoal transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Security Question dropdown */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="register-question" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Security Question <span className="text-red-500">*</span>
            </label>
            <select
              id="register-question"
              name="securityQuestion"
              value={formData.securityQuestion}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200 cursor-pointer font-medium"
              required
            >
              {SECURITY_QUESTIONS.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Security Answer input */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="register-answer" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Security Answer <span className="text-red-500">*</span>
            </label>
            <input
              id="register-answer"
              type="text"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
              placeholder="Your answer (case-insensitive)"
              className="w-full px-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
              required
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 mt-1">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setErrors([]);
              }}
              className="mt-1 h-4 w-4 rounded border-cozy-sand text-cozy-sage focus:ring-cozy-sage focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="consent-checkbox" className="text-xs text-cozy-charcoal/85 leading-normal select-none text-left">
              I read and agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('terms');
                }}
                className="underline hover:text-cozy-sage-dark transition-colors font-semibold cursor-pointer"
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openLegalModal('privacy');
                }}
                className="underline hover:text-cozy-sage-dark transition-colors font-semibold cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full mt-2 px-6 py-3 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.01] transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : null}
            <span>Create Free Account</span>
          </button>
        </form>

        <hr className="border-cozy-sand" />

        {/* Login navigation Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-xs text-cozy-sage-dark hover:text-cozy-sage font-semibold transition-colors duration-200"
          >
            Already have an account? Log In
          </Link>
        </div>
      </motion.div>
    </div>
    <Footer />


    <LegalModal 
      isOpen={isModalOpen} 
      closeModal={() => setIsModalOpen(false)} 
      contentType={modalType} 
    />
  </div>
  );
}

export default Register;
