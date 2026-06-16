import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, Mail, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import Footer from './Footer';
import logo from '../assets/logo.svg';



function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

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

    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors([result.error]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cozy-cream p-6 text-cozy-charcoal selection:bg-cozy-sage/25 selection:text-cozy-sage-dark">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-cozy-lg border border-cozy-sand shadow-lg p-8 flex flex-col gap-6 animate-slideUp">
        
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
            <p className="text-xs text-cozy-charcoal/60 mt-1">Manage your business identities, catalogs, and invoices</p>
          </div>
        </div>

        {/* Validation Errors display */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn" role="alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Unable to Log In:</span>
            </div>
            <ul className="list-disc pl-8 mt-1 flex flex-col gap-0.5 text-xs">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label 
              htmlFor="login-email" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="login-email"
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
              htmlFor="login-password" 
              className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-6 py-3 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.01] transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : null}
            <span>Log In</span>
          </button>
        </form>

        <hr className="border-cozy-sand" />

        {/* Register navigation Link */}
        <div className="text-center">
          <Link
            to="/register"
            className="text-xs text-cozy-sage-dark hover:text-cozy-sage font-semibold transition-colors duration-200"
          >
            Don't have an account? Create one for free
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
}

export default Login;
