import React from 'react';
import { API_BASE_URL } from '../config';
import { formatINR } from '../utils/format';

function InvoicePreview({ id, preview }) {
  const profile = preview.profile;
  const registrationType = profile?.registrationType || 'Unregistered / Small Business';
  const isRegular = registrationType === 'Regular Taxpayer';
  const isComposition = registrationType === 'Composition Scheme';

  // Calculate dynamic totals details based on payment status
  const isPaid = preview.status === 'Paid';
  const amountPaid = isPaid ? preview.grandTotal : 0;
  const balanceDue = isPaid ? 0 : preview.grandTotal;

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div 
      id={id || "print-area"} 
      className="w-[210mm] max-w-full min-h-[297mm] mx-auto bg-white p-12 shadow-lg border border-zinc-200/60 rounded-xl flex flex-col justify-between font-poppins select-none relative print:shadow-none print:p-0 print:border-none print:rounded-none print:w-full print:block"
      style={{ backgroundColor: '#ffffff', boxSizing: 'border-box' }}
    >
      <div>
        {/* Top Header Block Grid */}
        <div className="grid grid-cols-2 gap-8 items-start mb-8 pb-6 border-b border-zinc-200/60" style={{ borderBottomColor: '#e4e4e7' }}>
          
          {/* Top Left: Enterprise Credentials */}
          <div className="flex flex-col gap-1.5">
            {profile?.logoUrl ? (
              <img 
                src={getLogoUrl(profile.logoUrl)} 
                alt="Company Logo" 
                className="max-h-16 max-w-[180px] w-auto h-auto object-contain mb-3"
                style={{ maxHeight: '64px', maxWidth: '180px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = 'none'; // hide broken link icon
                }}
              />
            ) : (
              <div 
                className="w-16 h-16 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center mb-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider"
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }}
              >
                Logo
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: '#94a3b8' }}>From</span>
            <span className="text-lg font-bold text-slate-800 leading-tight block" style={{ color: '#1e293b' }}>{profile?.name || 'My Enterprise'}</span>
            <span className="text-xs text-zinc-650 leading-relaxed max-w-sm block" style={{ color: '#52525b' }}>
              {profile?.address || 'Street address line, State, ZIP'}
            </span>
            {profile?.contactNumber && (
              <span className="text-xs text-zinc-650 block" style={{ color: '#52525b' }}>Phone: {profile.contactNumber}</span>
            )}
            {profile?.gstin && (
              <span 
                className="inline-block text-xs bg-cozy-sand/85 px-2 py-0.5 rounded text-cozy-charcoal/80 mt-1 font-semibold border border-cozy-sand w-max"
                style={{ backgroundColor: '#f2ece4', borderColor: '#e5dec9', color: '#1d2421' }}
              >
                GSTIN: {profile.gstin}
              </span>
            )}
          </div>

          {/* Top Right: Title & Invoice Meta Data */}
          <div className="text-right flex flex-col items-end">
            <h4 
              className="text-4xl font-extrabold text-slate-850 tracking-tight uppercase leading-none mb-4"
              style={{ color: '#0f172a', fontWeight: 800 }}
            >
              {isComposition ? 'Bill of Supply' : 'Tax Invoice'}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-650 max-w-xs" style={{ color: '#52525b' }}>
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center" style={{ color: '#94a3b8' }}>Invoice No:</span>
              <span className="font-mono font-bold text-slate-800 text-right" style={{ color: '#1e293b' }}>{preview.number}</span>

              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center" style={{ color: '#94a3b8' }}>Date:</span>
              <span className="font-semibold text-slate-800 text-right" style={{ color: '#1e293b' }}>{preview.date}</span>

              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center" style={{ color: '#94a3b8' }}>Due Date:</span>
              <span className="font-semibold text-slate-800 text-right" style={{ color: '#1e293b' }}>{preview.dueDate}</span>

              {profile?.registrationType && (
                <>
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center" style={{ color: '#94a3b8' }}>Tax Type:</span>
                  <span className="text-[10px] text-cozy-sage-dark font-bold uppercase text-right" style={{ color: '#1e4d3b' }}>{profile.registrationType}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Billing & Shipping Destination Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
          
          {/* Bill To Column */}
          <div 
            className="bg-zinc-50/50 border border-zinc-200/50 p-5 rounded-lg flex flex-col gap-1.5"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: '#94a3b8' }}>Bill To</span>
            <span className="text-sm font-bold text-slate-850 block" style={{ color: '#0f172a' }}>{preview.clientName}</span>
            <span className="text-zinc-650 leading-relaxed block max-w-xs" style={{ color: '#52525b' }}>{preview.clientAddress}</span>
          </div>

          {/* Ship To Column */}
          <div 
            className="bg-zinc-50/50 border border-zinc-200/50 p-5 rounded-lg flex flex-col gap-1.5"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: '#94a3b8' }}>Ship To</span>
            <span className="text-sm font-bold text-slate-850 block" style={{ color: '#0f172a' }}>{preview.clientName}</span>
            <span className="text-zinc-650 leading-relaxed block max-w-xs" style={{ color: '#52525b' }}>{preview.clientAddress}</span>
          </div>
        </div>

        {/* Ledger Items Table */}
        <table className="w-full text-left border-collapse text-xs mb-8">
          <thead>
            <tr className="bg-slate-900 border-none font-bold text-white print-force-bg" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <th className="py-3 px-5 rounded-l-lg text-left" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Item Details</th>
              <th className="py-3 px-5 text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Qty</th>
              <th className="py-3 px-5 text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Rate</th>
              {isRegular && (
                <>
                  <th className="py-3 px-5 text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>GST</th>
                  <th className="py-3 px-5 text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>CGST</th>
                  <th className="py-3 px-5 text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>SGST</th>
                </>
              )}
              <th className="py-3 px-5 text-right rounded-r-lg" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200" style={{ borderColor: '#e4e4e7' }}>
            {preview.lines.map((item, i) => (
              <tr key={i} className="text-slate-750 even:bg-zinc-50/45 hover:bg-zinc-50/80 transition-colors">
                <td className="py-3.5 px-5 text-left">
                  <span className="font-semibold block text-slate-800" style={{ color: '#1e293b' }}>{item.name || '—'}</span>
                  {item.productId && (
                    <span className="text-[9px] text-zinc-400 block mt-0.5 font-mono" style={{ color: '#94a3b8' }}>
                      HSN: {item.hsnSacCode || '—'} | SKU: {item.productId}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-center font-semibold" style={{ color: '#1e293b' }}>{item.quantity || 0}</td>
                <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.basePrice)}</td>
                {isRegular && (
                  <>
                    <td className="py-3.5 px-5 text-center font-mono">{item.gstRate || 18}%</td>
                    <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.cgst)}</td>
                    <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.sgst)}</td>
                  </>
                )}
                <td className="py-3.5 px-5 text-right font-bold font-mono text-slate-800" style={{ color: '#0f172a' }}>
                  {formatINR(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        {/* Bottom Totals Area and Signature Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-10 pt-4">
          
          {/* Signature Line block */}
          <div 
            className="flex flex-col items-center justify-center p-6 border border-zinc-100/50 rounded-lg max-w-sm"
            style={{ borderColor: '#e4e4e7' }}
          >
            {profile?.signatureUrl ? (
              <img 
                src={profile.signatureUrl} 
                alt="Authorized Signature" 
                className="max-h-16 max-w-[180px] w-auto h-auto object-contain mx-auto mb-1.5" 
                style={{ maxHeight: '64px', maxWidth: '180px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-48 h-10 border-b border-dashed border-zinc-300 mb-2" style={{ borderBottomColor: '#cbd5e1' }}></div>
            )}
            <span className="text-xs font-bold text-slate-800" style={{ color: '#1e293b' }}>Authorized Signature</span>
            <span className="text-[9px] text-zinc-400 uppercase mt-0.5 tracking-wider" style={{ color: '#94a3b8' }}>For {profile?.name || 'My Enterprise'}</span>
          </div>

          {/* Unified Summary Totals card */}
          <div 
            className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-6 flex flex-col gap-2.5 text-xs shadow-sm"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <div className="flex justify-between text-zinc-500 font-medium">
              <span style={{ color: '#64748b' }}>Subtotal:</span>
              <span className="font-mono text-slate-800" style={{ color: '#1e293b' }}>{formatINR(preview.taxableSum)}</span>
            </div>
            
            {isRegular && (
              <>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span style={{ color: '#64748b' }}>CGST:</span>
                  <span className="font-mono text-slate-800" style={{ color: '#1e293b' }}>{formatINR(preview.cgstSum)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span style={{ color: '#64748b' }}>SGST:</span>
                  <span className="font-mono text-slate-800" style={{ color: '#1e293b' }}>{formatINR(preview.sgstSum)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-zinc-500 font-medium">
              <span style={{ color: '#64748b' }}>Amount Paid:</span>
              <span className="font-mono text-slate-800" style={{ color: '#1e293b' }}>{formatINR(amountPaid)}</span>
            </div>

            <div 
              className="flex justify-between items-center text-sm font-bold text-white bg-slate-900 px-4 py-3 rounded-lg mt-2 print-force-bg"
              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
            >
              <span style={{ color: '#ffffff' }}>Balance Due (INR):</span>
              <span className="font-mono text-lg" style={{ color: '#ffffff' }}>{formatINR(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Statutory disclaimers */}
        {isComposition && (
          <div 
            className="mb-8 p-3 bg-cozy-sand/80 text-[10px] text-cozy-charcoal/70 rounded-lg text-center border border-zinc-200 leading-normal font-semibold font-serif"
            style={{ backgroundColor: '#f2ece4', borderColor: '#e5dec9', color: '#1d2421' }}
          >
            Composition taxable person, not eligible to collect tax on supplies
          </div>
        )}

        {/* Stylized Invoice Footer Details */}
        <div className="border-t border-zinc-200/60 pt-6 grid grid-cols-2 gap-8 text-[11px] text-zinc-650 leading-relaxed" style={{ borderTopColor: '#e4e4e7', color: '#52525b' }}>
          
          {/* Notes column */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400" style={{ color: '#94a3b8' }}>Notes & Terms</span>
            <p>
              Payment is due within 15 days from the issue date. Please quote the invoice number on your payment reference. GST system aggregates are verified at time of billing.
            </p>
          </div>

          {/* Payment details column */}
          {(() => {
            const preferred = profile?.preferredPaymentMethod || 'BANK';
            const showUPI = preferred === 'UPI' && profile?.upiId;
            const showBank = (preferred === 'BANK' && (profile?.bankName || profile?.accountNumber || profile?.ifscCode)) || 
                             (!profile?.upiId && (profile?.bankName || profile?.accountNumber || profile?.ifscCode));

            if (showUPI) {
              const upiString = `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(profile.name || '')}&cu=INR`;
              return (
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400" style={{ color: '#94a3b8' }}>Pay Via UPI</span>
                  <div className="grid grid-cols-3 gap-y-1 text-zinc-650" style={{ color: '#52525b' }}>
                    <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>UPI ID:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800 break-all" style={{ color: '#1e293b' }}>{profile.upiId}</span>
                    <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>Payment URI:</span>
                    <span className="col-span-2 font-mono text-[9px] bg-zinc-50 border border-zinc-200/60 p-1.5 rounded text-zinc-500 select-all break-all leading-normal" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>{upiString}</span>
                  </div>
                </div>
              );
            }

            if (showBank) {
              return (
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400" style={{ color: '#94a3b8' }}>ACCOUNT DETAILS (BANK/IFSC)</span>
                  <div className="grid grid-cols-3 gap-y-0.5 text-zinc-650" style={{ color: '#52525b' }}>
                    {profile.bankName && (
                      <>
                        <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>Bank:</span>
                        <span className="col-span-2 font-semibold text-slate-800" style={{ color: '#1e293b' }}>{profile.bankName}</span>
                      </>
                    )}
                    {profile.branchName && (
                      <>
                        <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>Branch:</span>
                        <span className="col-span-2 font-semibold text-slate-800" style={{ color: '#1e293b' }}>{profile.branchName}</span>
                      </>
                    )}
                    {profile.accountNumber && (
                      <>
                        <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>Account:</span>
                        <span className="col-span-2 font-mono font-bold text-slate-800" style={{ color: '#1e293b' }}>{profile.accountNumber}</span>
                      </>
                    )}
                    {profile.ifscCode && (
                      <>
                        <span className="font-medium text-zinc-400" style={{ color: '#94a3b8' }}>IFSC:</span>
                        <span className="col-span-2 font-mono font-bold text-slate-800" style={{ color: '#1e293b' }}>{profile.ifscCode}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            return <div></div>;
          })()}
        </div>

        {/* centered elegant thank you message */}
        <div className="mt-8 text-center text-xs italic font-serif text-zinc-450 tracking-wider" style={{ color: '#71717a' }}>
          We appreciate your business!
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;
