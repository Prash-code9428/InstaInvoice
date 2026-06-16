import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, CheckCircle, Tag, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NotificationDropdown() {
  const { apiFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotificationData = async () => {
    try {
      // Fetch Profile
      const profileRes = await apiFetch('/api/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      // Fetch Products
      const productsRes = await apiFetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      // Fetch Invoices
      const invoicesRes = await apiFetch('/api/invoices');
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }
    } catch (err) {
      console.error('Error loading notification stats:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotificationData();
    }
  }, [isOpen]);

  // Compute notifications based on states
  const notifications = [];

  if (!profile) {
    notifications.push({
      id: 'profile-missing',
      type: 'warning',
      message: 'Business Profile required before invoicing. Complete settings in "Business Profile".',
      icon: <Settings className="text-cozy-amber" size={16} />
    });
  } else {
    notifications.push({
      id: 'profile-ok',
      type: 'success',
      message: `Profile active: Registered under "${profile.registrationType}".`,
      icon: <CheckCircle className="text-cozy-sage" size={16} />
    });
  }

  if (products.length === 0) {
    notifications.push({
      id: 'catalog-empty',
      type: 'info',
      message: 'Your inventory is empty. Add products to quick-select them when compiling invoices.',
      icon: <Tag className="text-cozy-charcoal/50" size={16} />
    });
  } else {
    notifications.push({
      id: 'catalog-ok',
      type: 'success',
      message: `Your catalog holds ${products.length} registered products/services.`,
      icon: <CheckCircle className="text-cozy-sage" size={16} />
    });
  }

  if (invoices.length === 0) {
    notifications.push({
      id: 'invoices-empty',
      type: 'info',
      message: 'Start billing by generating your first customer invoice in the "Invoice Generator".',
      icon: <AlertCircle className="text-cozy-charcoal/40" size={16} />
    });
  }

  // Count active warnings or infos
  const badgeCount = notifications.filter(n => n.type !== 'success').length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-cozy-charcoal/70 hover:text-cozy-charcoal hover:bg-cozy-sand rounded-cozy transition-all duration-200 relative cursor-pointer"
        title="View compliance notifications"
      >
        <Bell size={20} />
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cozy-amber rounded-full ring-2 ring-cozy-cream"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-cozy-lg border border-cozy-sand shadow-lg z-50 overflow-hidden animate-fadeIn">
          <div className="bg-cozy-sand/40 px-4 py-3 border-b border-cozy-sand flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/80">Compliance Center</span>
            {badgeCount > 0 && (
              <span className="text-[10px] bg-cozy-amber/15 text-cozy-amber-dark px-1.5 py-0.5 rounded font-bold">
                {badgeCount} Action items
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-cozy-sand/50">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex gap-3 hover:bg-cozy-cream/20 transition-colors">
                <div className="mt-0.5 flex-shrink-0">{n.icon}</div>
                <p className="text-xs text-cozy-charcoal/75 leading-relaxed text-left">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
