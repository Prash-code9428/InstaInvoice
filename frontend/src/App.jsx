import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Receipt, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight,
  Search,
  Bell,
  LogOut,
  RefreshCw
} from 'lucide-react';

// Context & Route Protection
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { formatINR } from './utils/format';

// Page Views
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';
import InventoryList from './components/InventoryList';
import InvoiceEngine from './components/InvoiceEngine';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Footer from './components/Footer';
import NotificationDropdown from './components/NotificationDropdown';
import logo from './assets/logo.svg';

/**
 * Protected Dashboard Panel Layout
 */
function DashboardLayout() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');


  return (
    <div className="min-h-screen flex flex-col bg-cozy-cream text-cozy-charcoal font-sans antialiased">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-cozy-cream/80 backdrop-blur-md border-b border-cozy-sand px-4 md:px-6 py-3 md:py-4 flex items-center justify-between print:hidden">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="InstaInvoice: Simple, accessible invoicing for small businesses." 
            className="h-8 md:h-10 object-contain"
          />
        </Link>

        {/* Navigation Tabs (Hidden on mobile, visible on desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-cozy-sand p-1 rounded-cozy">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-cozy transition-all duration-200 ${
              activeView === 'dashboard' 
                ? 'bg-white text-cozy-charcoal shadow-sm' 
                : 'text-cozy-charcoal/60 hover:text-cozy-charcoal'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('billing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-cozy transition-all duration-200 ${
              activeView === 'billing' 
                ? 'bg-white text-cozy-charcoal shadow-sm' 
                : 'text-cozy-charcoal/60 hover:text-cozy-charcoal'
            }`}
          >
            Invoice Generator
          </button>
          <button 
            onClick={() => setActiveView('inventory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-cozy transition-all duration-200 ${
              activeView === 'inventory' 
                ? 'bg-white text-cozy-charcoal shadow-sm' 
                : 'text-cozy-charcoal/60 hover:text-cozy-charcoal'
            }`}
          >
            Inventory Ledger
          </button>
          <button 
            onClick={() => setActiveView('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-cozy transition-all duration-200 ${
              activeView === 'profile' 
                ? 'bg-white text-cozy-charcoal shadow-sm' 
                : 'text-cozy-charcoal/60 hover:text-cozy-charcoal'
            }`}
          >
            Business Profile
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationDropdown />
          <button 
            onClick={() => setActiveView(activeView === 'profile' ? 'dashboard' : 'profile')}
            className={`p-2 rounded-cozy transition-all duration-200 ${
              activeView === 'profile' 
                ? 'bg-cozy-sage text-white shadow-sm' 
                : 'text-cozy-charcoal/70 hover:text-cozy-charcoal hover:bg-cozy-sand'
            }`}
            title="Business Profile Settings"
          >
            <Settings size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="h-6 md:h-8 w-px bg-cozy-sand"></div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-cozy-sage/20 text-cozy-sage-dark flex items-center justify-center font-semibold text-xs md:text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UI'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs md:text-sm font-medium hidden sm:inline">{user?.name || 'User'}</span>
              <button 
                onClick={logout}
                className="text-[9px] md:text-[10px] text-red-500 hover:text-red-700 font-semibold underline text-left cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container (Bottom padding adjusted for mobile bottom nav) */}
      <div className="flex-1 flex flex-col justify-between">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8 w-full flex-1">
          {activeView === 'dashboard' ? (
            <div className="animate-fadeIn">
              <AnalyticsDashboard onViewChange={setActiveView} />
            </div>
          ) : activeView === 'inventory' ? (
            <div className="animate-fadeIn">
              <InventoryList />
            </div>
          ) : activeView === 'billing' ? (
            <div className="animate-fadeIn">
              <InvoiceEngine />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <ProfileForm />
            </div>
          )}
        </main>
        
        {/* Footer component */}
        <Footer />
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet, hidden on desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-cozy-sand py-2 px-4 flex items-center justify-around md:hidden print:hidden shadow-lg">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeView === 'dashboard' ? 'text-cozy-sage-dark scale-105 font-bold' : 'text-cozy-charcoal/50 hover:text-cozy-charcoal'
          }`}
        >
          <TrendingUp size={20} className={activeView === 'dashboard' ? 'text-cozy-sage-dark' : 'text-cozy-charcoal/50'} />
          <span>Dashboard</span>
        </button>
        
        <button 
          onClick={() => setActiveView('billing')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeView === 'billing' ? 'text-cozy-sage-dark scale-105 font-bold' : 'text-cozy-charcoal/50 hover:text-cozy-charcoal'
          }`}
        >
          <Receipt size={20} className={activeView === 'billing' ? 'text-cozy-sage-dark' : 'text-cozy-charcoal/50'} />
          <span>Invoice Gen</span>
        </button>

        <button 
          onClick={() => setActiveView('inventory')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeView === 'inventory' ? 'text-cozy-sage-dark scale-105 font-bold' : 'text-cozy-charcoal/50 hover:text-cozy-charcoal'
          }`}
        >
          <FileText size={20} className={activeView === 'inventory' ? 'text-cozy-sage-dark' : 'text-cozy-charcoal/50'} />
          <span>Inventory</span>
        </button>

        <button 
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeView === 'profile' ? 'text-cozy-sage-dark scale-105 font-bold' : 'text-cozy-charcoal/50 hover:text-cozy-charcoal'
          }`}
        >
          <Settings size={20} className={activeView === 'profile' ? 'text-cozy-sage-dark' : 'text-cozy-charcoal/50'} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

/**
 * Root Router Component Wrapper
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
