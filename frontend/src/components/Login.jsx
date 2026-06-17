import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Receipt, Mail, KeyRound, AlertCircle, RefreshCw, Eye, EyeOff, HelpCircle, X } from 'lucide-react';
import Footer from './Footer';
import logo from '../assets/logo.svg';
import { API_BASE_URL } from '../config';



function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Forgot password states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Q&A + Reset, 3: Success
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErrors, setForgotErrors] = useState([]);

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setForgotErrors([]);

    if (!forgotEmail.trim()) {
      setForgotErrors(['Please enter your email address.']);
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/security-question?email=${encodeURIComponent(forgotEmail.trim())}`);
      const data = await response.json();
      if (response.ok) {
        setForgotQuestion(data.question);
        setForgotStep(2);
      } else {
        setForgotErrors([data.error || 'Failed to fetch security question.']);
      }
    } catch (err) {
      console.error(err);
      setForgotErrors(['Could not connect to the server. Please try again.']);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleExecuteReset = async (e) => {
    e.preventDefault();
    setForgotErrors([]);

    if (!forgotAnswer.trim()) {
      setForgotErrors(['Please enter the security answer.']);
      return;
    }
    if (!newPassword) {
      setForgotErrors(['Please enter a new password.']);
      return;
    }
    if (newPassword.length < 6) {
      setForgotErrors(['New password must be at least 6 characters long.']);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotErrors(['Passwords do not match. Please verify that the "Create new password" and "Confirm new password" inputs are identical.']);
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          answer: forgotAnswer,
          newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStep(3);
      } else {
        setForgotErrors([data.error || 'Failed to reset password.']);
      }
    } catch (err) {
      console.error(err);
      setForgotErrors(['Could not connect to the server. Please try again.']);
    } finally {
      setForgotLoading(false);
    }
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
            <div className="flex justify-between items-center">
              <label 
                htmlFor="login-password" 
                className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotStep(1);
                  setForgotEmail(formData.email);
                  setForgotErrors([]);
                  setForgotAnswer('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setShowNewPassword(false);
                  setShowConfirmNewPassword(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-cozy-sage-dark hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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

    {/* Forgot Password Modal */}
    {isForgotModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozy-charcoal/40 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-cozy-lg border border-cozy-sand shadow-2xl p-6 flex flex-col gap-5 relative animate-scaleUp text-left">
          <button
            onClick={() => setIsForgotModalOpen(false)}
            className="absolute top-4 right-4 text-cozy-charcoal/40 hover:text-cozy-charcoal transition-colors cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Reset Password</h3>
              <p className="text-xs text-cozy-charcoal/60">Recover access via your security question</p>
            </div>
          </div>

          {forgotErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-cozy flex items-start gap-2.5 text-red-700 text-xs animate-fadeIn" role="alert">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>{forgotErrors.map((err, i) => <p key={i}>{err}</p>)}</div>
            </div>
          )}

          {forgotStep === 1 && (
            <form onSubmit={handleFetchQuestion} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotErrors([]);
                    }}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all lowercase"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full px-5 py-2.5 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {forgotLoading && <RefreshCw className="animate-spin" size={14} />}
                <span>Find Security Question</span>
              </button>
            </form>
          )}

          {forgotStep === 2 && (
            <form onSubmit={handleExecuteReset} className="flex flex-col gap-4 text-left">
              <div className="bg-cozy-sand/20 border border-cozy-sand/65 rounded-cozy p-3.5 text-sm">
                <p className="text-xs text-cozy-charcoal/60 uppercase font-bold tracking-wider mb-1">Your Security Question:</p>
                <p className="font-semibold text-cozy-charcoal">{forgotQuestion}</p>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="forgot-answer" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Security Answer
                </label>
                <input
                  id="forgot-answer"
                  type="text"
                  value={forgotAnswer}
                  onChange={(e) => {
                    setForgotAnswer(e.target.value);
                    setForgotErrors([]);
                  }}
                  placeholder="Provide your answer"
                  className="w-full px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="forgot-new-password" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Create New Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
                  <input
                    id="forgot-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setForgotErrors([]);
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-charcoal/40 hover:text-cozy-charcoal transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="forgot-confirm-new-password" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
                  <input
                    id="forgot-confirm-new-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setForgotErrors([]);
                    }}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-10 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-charcoal/40 hover:text-cozy-charcoal transition-colors cursor-pointer"
                  >
                    {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setForgotErrors([]);
                  }}
                  className="flex-1 px-4 py-2.5 bg-cozy-sand hover:bg-cozy-sand/80 text-cozy-charcoal rounded-cozy text-sm font-semibold transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 px-4 py-2.5 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading && <RefreshCw className="animate-spin" size={14} />}
                  <span>Reset Password</span>
                </button>
              </div>
            </form>
          )}

          {forgotStep === 3 && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-cozy-sage/20 text-cozy-sage-dark flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-cozy-charcoal">Password Reset Complete</h4>
                <p className="text-xs text-cozy-charcoal/60 mt-1">Your password has been successfully updated. You can now log in using your new credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setFormData(prev => ({ ...prev, email: forgotEmail, password: '' }));
                }}
                className="mt-2 w-full px-5 py-2.5 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark text-sm font-semibold transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}

export default Login;
