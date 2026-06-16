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
    >
      <div>
        {/* Top Header Block Grid */}
        <div className="grid grid-cols-2 gap-8 items-start mb-8 pb-6 border-b border-zinc-200/60">
          
          {/* Top Left: Enterprise Credentials */}
          <div className="flex flex-col gap-1.5">
            {profile?.logoUrl ? (
              <img 
                src={getLogoUrl(profile.logoUrl)} 
                alt="Company Logo" 
                className="max-h-16 max-w-[180px] object-contain mb-3 no-print"
                onError={(e) => {
                  e.target.style.display = 'none'; // hide broken link icon
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center mb-3 no-print text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Logo
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">From</span>
            <span className="text-lg font-bold text-slate-800 leading-tight block">{profile?.name || 'My Enterprise'}</span>
            <span className="text-xs text-zinc-650 leading-relaxed max-w-sm block">
              {profile?.address || 'Street address line, State, ZIP'}
            </span>
            {profile?.contactNumber && (
              <span className="text-xs text-zinc-650 block">Phone: {profile.contactNumber}</span>
            )}
            {profile?.gstin && (
              <span className="inline-block text-xs bg-cozy-sand/85 px-2 py-0.5 rounded text-cozy-charcoal/80 mt-1 font-semibold border border-cozy-sand w-max">
                GSTIN: {profile.gstin}
              </span>
            )}
          </div>

          {/* Top Right: Title & Invoice Meta Data */}
          <div className="text-right flex flex-col items-end">
            <h4 className="text-4xl font-extrabold text-slate-850 tracking-tight uppercase leading-none mb-4">
              {isComposition ? 'Bill of Supply' : 'Tax Invoice'}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-650 max-w-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center">Invoice No:</span>
              <span className="font-mono font-bold text-slate-800 text-right">{preview.number}</span>

              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center">Date:</span>
              <span className="font-semibold text-slate-800 text-right">{preview.date}</span>

              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center">Due Date:</span>
              <span className="font-semibold text-slate-800 text-right">{preview.dueDate}</span>

              {profile?.registrationType && (
                <>
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] self-center">Tax Type:</span>
                  <span className="text-[10px] text-cozy-sage-dark font-bold uppercase text-right">{profile.registrationType}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Billing & Shipping Destination Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs">
          
          {/* Bill To Column */}
          <div className="bg-zinc-50/50 border border-zinc-200/50 p-5 rounded-lg flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Bill To</span>
            <span className="text-sm font-bold text-slate-850 block">{preview.clientName}</span>
            <span className="text-zinc-650 leading-relaxed block max-w-xs">{preview.clientAddress}</span>
          </div>

          {/* Ship To Column */}
          <div className="bg-zinc-50/50 border border-zinc-200/50 p-5 rounded-lg flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ship To</span>
            <span className="text-sm font-bold text-slate-850 block">{preview.clientName}</span>
            <span className="text-zinc-650 leading-relaxed block max-w-xs">{preview.clientAddress}</span>
          </div>
        </div>

        {/* Ledger Items Table */}
        <table className="w-full text-left border-collapse text-xs mb-8">
          <thead>
            <tr className="bg-slate-900 border-none font-bold text-white print-force-bg">
              <th className="py-3 px-5 rounded-l-lg text-left">Item Details</th>
              <th className="py-3 px-5 text-center">Qty</th>
              <th className="py-3 px-5 text-center">Rate</th>
              {isRegular && (
                <>
                  <th className="py-3 px-5 text-center">GST</th>
                  <th className="py-3 px-5 text-center">CGST</th>
                  <th className="py-3 px-5 text-center">SGST</th>
                </>
              )}
              <th className="py-3 px-5 text-right rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {preview.lines.map((item, i) => (
              <tr key={i} className="text-slate-750 even:bg-zinc-50/45 hover:bg-zinc-50/80 transition-colors">
                <td className="py-3.5 px-5 text-left">
                  <span className="font-semibold block text-slate-800">{item.name || '—'}</span>
                  {item.productId && (
                    <span className="text-[9px] text-zinc-400 block mt-0.5 font-mono">
                      HSN: {item.hsnSacCode || '—'} | SKU: {item.productId}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-center font-semibold">{item.quantity || 0}</td>
                <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.basePrice)}</td>
                {isRegular && (
                  <>
                    <td className="py-3.5 px-5 text-center font-mono">{item.gstRate || 18}%</td>
                    <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.cgst)}</td>
                    <td className="py-3.5 px-5 text-center font-mono">{formatINR(item.sgst)}</td>
                  </>
                )}
                <td className="py-3.5 px-5 text-right font-bold font-mono text-slate-800">
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
          <div className="flex flex-col items-center justify-center p-6 border border-zinc-100/50 rounded-lg max-w-sm">
            {profile?.signatureUrl ? (
              <img 
                src={profile.signatureUrl} 
                alt="Authorized Signature" 
                className="max-h-16 object-contain mx-auto mb-1.5" 
              />
            ) : (
              <div className="w-48 h-10 border-b border-dashed border-zinc-300 mb-2"></div>
            )}
            <span className="text-xs font-bold text-slate-800">Authorized Signature</span>
            <span className="text-[9px] text-zinc-400 uppercase mt-0.5 tracking-wider">For {profile?.name || 'My Enterprise'}</span>
          </div>

          {/* Unified Summary Totals card */}
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-6 flex flex-col gap-2.5 text-xs shadow-sm">
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-800">{formatINR(preview.taxableSum)}</span>
            </div>
            
            {isRegular && (
              <>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>CGST:</span>
                  <span className="font-mono text-slate-800">{formatINR(preview.cgstSum)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>SGST:</span>
                  <span className="font-mono text-slate-800">{formatINR(preview.sgstSum)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Amount Paid:</span>
              <span className="font-mono text-slate-800">{formatINR(amountPaid)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white bg-slate-900 px-4 py-3 rounded-lg mt-2 print-force-bg">
              <span>Balance Due (INR):</span>
              <span className="font-mono text-lg">{formatINR(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Statutory disclaimers */}
        {isComposition && (
          <div className="mb-8 p-3 bg-cozy-sand/80 text-[10px] text-cozy-charcoal/70 rounded-lg text-center border border-zinc-200 leading-normal font-semibold font-serif">
            Composition taxable person, not eligible to collect tax on supplies
          </div>
        )}

        {/* Stylized Invoice Footer Details */}
        <div className="border-t border-zinc-200/60 pt-6 grid grid-cols-2 gap-8 text-[11px] text-zinc-650 leading-relaxed">
          
          {/* Notes column */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400">Notes & Terms</span>
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
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400">Pay Via UPI</span>
                  <div className="grid grid-cols-3 gap-y-1 text-zinc-650">
                    <span className="font-medium text-zinc-400">UPI ID:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800 break-all">{profile.upiId}</span>
                    <span className="font-medium text-zinc-400">Payment URI:</span>
                    <span className="col-span-2 font-mono text-[9px] bg-zinc-50 border border-zinc-200/60 p-1.5 rounded text-zinc-500 select-all break-all leading-normal">{upiString}</span>
                  </div>
                </div>
              );
            }

            if (showBank) {
              return (
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-[9px] text-zinc-400">ACCOUNT DETAILS (BANK/IFSC)</span>
                  <div className="grid grid-cols-3 gap-y-0.5 text-zinc-650">
                    {profile.bankName && (
                      <>
                        <span className="font-medium text-zinc-400">Bank:</span>
                        <span className="col-span-2 font-semibold text-slate-800">{profile.bankName}</span>
                      </>
                    )}
                    {profile.branchName && (
                      <>
                        <span className="font-medium text-zinc-400">Branch:</span>
                        <span className="col-span-2 font-semibold text-slate-800">{profile.branchName}</span>
                      </>
                    )}
                    {profile.accountNumber && (
                      <>
                        <span className="font-medium text-zinc-400">Account:</span>
                        <span className="col-span-2 font-mono font-bold text-slate-800">{profile.accountNumber}</span>
                      </>
                    )}
                    {profile.ifscCode && (
                      <>
                        <span className="font-medium text-zinc-400">IFSC:</span>
                        <span className="col-span-2 font-mono font-bold text-slate-800">{profile.ifscCode}</span>
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
        <div className="mt-8 text-center text-xs italic font-serif text-zinc-450 tracking-wider">
          We appreciate your business!
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;
