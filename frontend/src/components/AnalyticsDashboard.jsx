import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  ShoppingBag, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';
import ReviewWidget from './ReviewWidget';
import { getInvoiceTotals } from '../utils/math';

function AnalyticsDashboard({ onViewChange }) {
  const { apiFetch } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // 1. Fetch Aggregation summary
      const analyticsRes = await apiFetch('/api/analytics/summary');
      if (!analyticsRes.ok) {
        throw new Error('Failed to load summary statistics');
      }
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // 2. Fetch Recent Invoices list
      const invoicesRes = await apiFetch('/api/invoices');
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.slice(0, 5)); // Show top 5 recent invoices
      }

      // 3. Fetch Active Profile Config
      try {
        const profileRes = await apiFetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (profileErr) {
        console.error('Failed to load active profile settings:', profileErr);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to communicate with the billing databases. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleStatus = async (invoiceId, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    setActionLoading(invoiceId);
    try {
      const response = await apiFetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        // Refresh calculations
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Row 1 Skeletons: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-cozy-lg border border-cozy-sand p-6 flex flex-col justify-between">
              <div className="h-4 bg-cozy-sand/50 rounded w-2/3"></div>
              <div className="h-6 bg-cozy-sand/50 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </div>

        {/* Row 2 Skeletons: Chart & Top items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-cozy-lg border border-cozy-sand p-6">
            <div className="h-5 bg-cozy-sand/50 rounded w-1/3 mb-6"></div>
            <div className="h-48 bg-cozy-sand/20 rounded"></div>
          </div>
          <div className="h-80 bg-white rounded-cozy-lg border border-cozy-sand p-6">
            <div className="h-5 bg-cozy-sand/50 rounded w-1/2 mb-6"></div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-cozy-sand/30 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-cozy-lg border border-cozy-sand shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center">
        <Clock size={40} className="text-red-500 mb-3 animate-pulse" />
        <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Analytics System Offline</h3>
        <p className="text-xs text-cozy-charcoal/70 mt-2 leading-relaxed">{error}</p>
        <button 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="mt-4 px-4 py-2 bg-cozy-sand hover:bg-cozy-sand/80 text-cozy-charcoal rounded-cozy text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} /> Retry Connection
        </button>
      </div>
    );
  }

  const { summary, topProducts, monthlySales } = analytics;

  // Find max monthly revenue for SVG bar chart scaling
  const maxRevenue = monthlySales.reduce((max, cur) => cur.revenue > max ? cur.revenue : max, 0) || 1000;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Onboarding Banner if Profile is not configured */}
      {!profile && (
        <div className="bg-cozy-sand/30 border border-cozy-sand p-6 rounded-cozy-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn text-left">
          <div className="flex items-center gap-3.5">
            <span className="text-2xl">👋</span>
            <div className="text-left">
              <h4 className="text-sm font-bold text-cozy-charcoal font-serif">Welcome to InstaInvoice!</h4>
              <p className="text-xs text-cozy-charcoal/60 mt-0.5">Let's set up your public business identity and tax registration status first to compile invoices.</p>
            </div>
          </div>
          <button
            onClick={() => onViewChange('profile')}
            className="px-4 py-2 bg-cozy-sage hover:bg-cozy-sage-dark text-white text-xs font-bold rounded-cozy transition-colors cursor-pointer shadow-sm"
          >
            Configure Tax Profile
          </button>
        </div>
      )}

      {/* 1. Core KPIs Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales KPI */}
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cozy-sage/5 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-cozy-charcoal/60 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Revenue</span>
              <TrendingUp size={16} className="text-cozy-sage" />
            </div>
            <span className="text-2xl font-bold font-serif text-cozy-charcoal block tracking-tight">
              {formatINR(summary.totalRevenue)}
            </span>
          </div>
          <p className="text-[10px] text-cozy-charcoal/40 mt-4 leading-normal">
            Accumulated gross value of all business documents.
          </p>
        </div>

        {/* GST Liabilities CGST / SGST splits */}
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cozy-amber/5 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-cozy-charcoal/60 text-xs font-bold uppercase tracking-wider mb-2">
              <span>GST Liabilities</span>
              <Percent size={16} className="text-cozy-amber" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-cozy-charcoal/70">
                CGST: <strong className="font-mono text-cozy-charcoal">{formatINR(summary.totalCgst)}</strong>
              </span>
              <span className="text-xs font-semibold text-cozy-charcoal/70">
                SGST: <strong className="font-mono text-cozy-charcoal">{formatINR(summary.totalSgst)}</strong>
              </span>
            </div>
          </div>
          <p className="text-[10px] text-cozy-charcoal/40 mt-3 leading-normal border-t border-cozy-sand/40 pt-2">
            Tax aggregate collected: <strong className="text-cozy-charcoal/70 font-semibold">{formatINR(summary.totalCgst + summary.totalSgst)}</strong>
          </p>
        </div>

        {/* Paid Invoices KPI */}
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cozy-sage/10 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-cozy-charcoal/60 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Collected Revenue</span>
              <CheckCircle size={16} className="text-cozy-sage-dark" />
            </div>
            <span className="text-2xl font-bold font-serif text-cozy-sage-dark block tracking-tight">
              {formatINR(summary.paidAmount)}
            </span>
          </div>
          <p className="text-[10px] text-cozy-charcoal/45 mt-4 leading-normal">
            Cleared: <strong className="font-semibold text-cozy-charcoal/70">{summary.paidCount}</strong> of <strong className="font-semibold text-cozy-charcoal/70">{summary.invoiceCount}</strong> invoices total.
          </p>
        </div>

        {/* Pending Invoices KPI */}
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-xl -mr-6 -mt-6"></div>
          <div>
            <div className="flex items-center justify-between text-cozy-charcoal/60 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Outstanding Dues</span>
              <Clock size={16} className="text-red-500" />
            </div>
            <span className="text-2xl font-bold font-serif text-red-650 block tracking-tight">
              {formatINR(summary.pendingAmount)}
            </span>
          </div>
          <p className="text-[10px] text-cozy-charcoal/45 mt-4 leading-normal">
            Pending: <strong className="font-semibold text-red-500">{summary.pendingCount}</strong> accounts.
          </p>
        </div>

      </div>

      {/* 2. Visual Charts & Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales trend bar chart (SVG layout) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/65">Monthly Sales Trends</h3>
            <p className="text-xs text-cozy-charcoal/45">Visual aggregate metrics computed over time</p>
          </div>

          {monthlySales.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12 text-cozy-charcoal/40 text-xs border border-dashed border-cozy-sand rounded-cozy min-h-[220px]">
              No transactions recorded. Generate invoices to populate sales graphs.
            </div>
          ) : (
            <div className="flex-1 min-h-[220px] flex items-end justify-center w-full">
              {/* Responsive Styled SVG bar layout */}
              <svg className="w-full h-48" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cozy-sage-dark, #4a6b5d)" />
                    <stop offset="100%" stopColor="var(--color-cozy-sage, #789f8a)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                
                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1ece4" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1ece4" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1ece4" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="190" x2="500" y2="190" stroke="#d5cebd" strokeWidth="1" />

                {/* Bars map */}
                {monthlySales.map((trend, idx) => {
                  const barWidth = 40;
                  const totalBars = monthlySales.length;
                  const spacing = (500 - (barWidth * totalBars)) / (totalBars + 1);
                  const x = spacing + idx * (barWidth + spacing);
                  
                  // Compute bar heights
                  const maxBarHeight = 160;
                  const barHeight = (trend.revenue / maxRevenue) * maxBarHeight || 10;
                  const y = 190 - barHeight;

                  return (
                    <g key={trend.month} className="group cursor-pointer">
                      {/* Tooltip trigger hover bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="url(#barGradient)" 
                        rx="4" 
                        className="transition-all duration-300 hover:opacity-90 hover:brightness-95"
                      />
                      
                      {/* Price label on top */}
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 8} 
                        textAnchor="middle" 
                        fill="#5c5346" 
                        fontSize="9" 
                        fontWeight="bold"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ₹{trend.revenue}
                      </text>

                      {/* Month tag below */}
                      <text 
                        x={x + barWidth / 2} 
                        y="204" 
                        textAnchor="middle" 
                        fill="#8c8273" 
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {trend.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Top items ledger */}
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/65">Top Products & Services</h3>
              <p className="text-xs text-cozy-charcoal/45">Highest-revenue items in your invoice entries</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-cozy-charcoal/40 text-xs border border-dashed border-cozy-sand rounded-cozy flex flex-col items-center gap-2">
                <span>No products recorded. Compile invoices to calculate top products.</span>
                {onViewChange && (
                  <button
                    onClick={() => onViewChange('inventory')}
                    className="text-[10px] font-bold text-cozy-sage-dark hover:underline cursor-pointer"
                  >
                    Add Products →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-cozy-cream/35 border border-cozy-sand/50 rounded-cozy hover:bg-cozy-cream transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-cozy bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center font-bold text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-cozy-charcoal block">{prod.name}</span>
                        <span className="text-[10px] text-cozy-charcoal/40 block mt-0.5">Sold: {prod.quantity} units</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cozy-sage-dark font-mono">
                      {formatINR(prod.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-cozy-sand/20 border border-cozy-sand/50 p-4 rounded-cozy flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-[10px] text-cozy-charcoal/60 font-semibold uppercase">
              <ShoppingBag size={14} className="text-cozy-sage" />
              <span>Full inventory ledger ready</span>
            </div>
            {onViewChange && (
              <button
                onClick={() => onViewChange('inventory')}
                className="text-[10px] font-bold text-cozy-sage-dark hover:underline cursor-pointer"
              >
                Manage Catalog →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Invoices status toggle board */}
      <div className="bg-white rounded-cozy-lg border border-cozy-sand shadow-sm overflow-hidden">
        <div className="bg-cozy-sand/50 p-6 border-b border-cozy-sand flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Recent Invoices Overview</h3>
            <p className="text-xs text-cozy-charcoal/60">Toggle invoice payment status directly to trigger recalculations</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center text-cozy-charcoal/40 text-sm flex flex-col items-center gap-2.5">
            <span>No invoices generated yet. Compile your first invoice to view calculations.</span>
            {onViewChange && (
              <button
                onClick={() => onViewChange('billing')}
                className="px-4 py-2 bg-cozy-sand hover:bg-cozy-sand/80 text-cozy-charcoal text-xs font-semibold rounded-cozy cursor-pointer active:scale-95 transition-transform"
              >
                Compile Invoice →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cozy-sand/20 border-b border-cozy-sand text-xs uppercase font-bold text-cozy-charcoal/60">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cozy-sand/40">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-cozy-cream/35 transition-colors duration-150">
                    <td className="p-4 font-mono font-bold text-cozy-sage-dark">{inv.invoiceNumber}</td>
                    <td className="p-4 text-cozy-charcoal">{inv.clientName}</td>
                    <td className="p-4 text-cozy-charcoal/70">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-bold text-cozy-charcoal">
                      {formatINR(getInvoiceTotals(inv).grandTotal)}
                    </td>
                    <td className="p-4 text-center">
                      {inv.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-cozy-sage/15 text-cozy-sage-dark rounded-full text-xs font-bold">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-cozy-amber/15 text-cozy-amber rounded-full text-xs font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        disabled={actionLoading === inv._id}
                        onClick={() => handleToggleStatus(inv._id, inv.status)}
                        className={`px-3 py-1.5 rounded-cozy text-xs font-semibold cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 mx-auto ${
                          inv.status === 'Paid'
                            ? 'bg-cozy-sand text-cozy-charcoal/80 hover:bg-cozy-sand/80'
                            : 'bg-cozy-sage text-white hover:bg-cozy-sage-dark'
                        }`}
                      >
                        {actionLoading === inv._id ? (
                          <RefreshCw className="animate-spin" size={12} />
                        ) : inv.status === 'Paid' ? (
                          'Mark Pending'
                        ) : (
                          'Mark Paid'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Feedback / Review Widget */}
      <div className="max-w-xl mx-auto w-full mt-4">
        <ReviewWidget />
      </div>

    </div>
  );
}

export default AnalyticsDashboard;
