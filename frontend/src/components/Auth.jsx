import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { KeyRound, Mail, User, RefreshCw, AlertCircle, Receipt } from 'lucide-react';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const url = isLogin 
      ? `${API_BASE_URL}/api/auth/login` 
      : `${API_BASE_URL}/api/auth/register`;

    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        // Pass token and user details to parent App
        onAuthSuccess(result.token, result.user);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || 'Authentication failed. Please try again.']);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrors(['Could not connect to the authentication server. Ensure backend is running.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cozy-cream flex flex-col items-center justify-center p-6 text-cozy-charcoal select-none">
      <div className="w-full max-w-md bg-white rounded-cozy-lg border border-cozy-sand shadow-lg p-8 flex flex-col gap-6 animate-slideUp">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-cozy bg-cozy-sage text-white flex items-center justify-center shadow-md">
            <Receipt size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-cozy-charcoal tracking-tight">InstaInvoice</h1>
            <p className="text-xs text-cozy-charcoal/60 mt-1">
              {isLogin ? 'Welcome back! Log in to manage invoices.' : 'Create your free account to get started.'}
            </p>
          </div>
        </div>

        {/* Errors Block */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Authentication Error:</span>
            </div>
            <ul className="list-disc pl-8 mt-1 flex flex-col gap-0.5 text-xs">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Register Name Field */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-name" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alice Cooper"
                  className="w-full pl-10 pr-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="auth-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. alice@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200 lowercase"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              Password
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="auth-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-6 py-3 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.01] transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : null}
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <hr className="border-cozy-sand" />

        {/* Toggle between Register/Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors([]);
            }}
            className="text-xs text-cozy-sage-dark hover:text-cozy-sage font-semibold transition-colors duration-200"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
