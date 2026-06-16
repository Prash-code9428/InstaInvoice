import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Receipt,
  User,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';
import InvoicePreview from './InvoicePreview';
import { getInvoiceTotals } from '../utils/math';


function InvoiceEngine() {
  const { apiFetch } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Loading/Error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  // Active preview invoice selection (null means previewing current unsaved form)
  const [selectedHistoricalInvoice, setSelectedHistoricalInvoice] = useState(null);

  // Form State
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    clientName: '',
    clientAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: [
      { productId: '', name: '', basePrice: 0, hsnSacCode: '', gstRate: 18, quantity: 1, discountPercentage: 0 }
    ]
  });

  // Dynamic refs array for keyboard navigation focusing
  const productSelectRefs = useRef([]);

  // Native printing trigger
  const handlePrint = () => {
    window.print();
  };

  // jsPDF and html2canvas digital PDF generator
  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;

    setSaving(true);
    setSuccess(null);
    setErrors([]);
    
    // Wait for layout and paint cycle to fully complete
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // crisp fonts
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 20; // safe top gap
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`invoice-${preview.number}.pdf`);
      setSuccess(`Successfully exported PDF for Invoice ${preview.number}.`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('PDF compilation failed. Use native system print (Save as PDF) option.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch initial configs
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setErrors([]);

      // 1. Fetch Profile
      const profileRes = await apiFetch('/api/profile');
      let profileData = null;
      if (profileRes.ok) {
        profileData = await profileRes.json();
        setProfile(profileData);
      }

      // 2. Fetch Catalog Products
      const productsRes = await apiFetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      // 3. Fetch Invoices History
      const invoicesRes = await apiFetch('/api/invoices');
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }

    } catch (err) {
      console.error('Error loading Billing Engine data:', err);
      setErrors(['Failed to establish server connection. Verify your backend is running.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync auto-generated invoice number on load/reset
  useEffect(() => {
    if (!invoiceForm.invoiceNumber) {
      setInvoiceForm(prev => ({
        ...prev,
        invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    }
  }, [invoiceForm.invoiceNumber]);

  // Form Field change
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({ ...prev, [name]: value }));
    setSelectedHistoricalInvoice(null); // Switch preview back to the current form
    setSuccess(null);
    setErrors([]);
  };

  // Line Item change
  const handleLineItemChange = (index, field, value) => {
    setSelectedHistoricalInvoice(null); // Switch preview to current
    setSuccess(null);
    setErrors([]);

    const updatedLines = [...invoiceForm.lineItems];

    if (field === 'productId') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        updatedLines[index] = {
          ...updatedLines[index],
          productId: selectedProd._id,
          name: selectedProd.name,
          basePrice: selectedProd.basePrice,
          hsnSacCode: selectedProd.hsnSacCode,
          gstRate: selectedProd.gstRate
        };
      } else {
        updatedLines[index] = {
          ...updatedLines[index],
          productId: '',
          name: '',
          basePrice: 0,
          hsnSacCode: '',
          gstRate: 18
        };
      }
    } else {
      updatedLines[index][field] = field === 'quantity' 
        ? parseInt(value) || '' 
        : field === 'discountPercentage' 
        ? parseFloat(value) || 0 
        : field === 'basePrice'
        ? (value === '' ? '' : parseFloat(value))
        : field === 'gstRate'
        ? parseInt(value) || 0
        : value;
    }

    setInvoiceForm(prev => ({ ...prev, lineItems: updatedLines }));
  };

  // Add Row
  const addLineItemRow = () => {
    setSelectedHistoricalInvoice(null);
    setInvoiceForm(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { productId: '', name: '', basePrice: 0, hsnSacCode: '', gstRate: 18, quantity: 1, discountPercentage: 0 }
      ]
    }));

    // Waking up keyboard focus on the newly appended row
    setTimeout(() => {
      const nextIndex = invoiceForm.lineItems.length;
      if (productSelectRefs.current[nextIndex]) {
        productSelectRefs.current[nextIndex].focus();
      }
    }, 50);
  };

  // Remove Row
  const removeLineItemRow = (index) => {
    setSelectedHistoricalInvoice(null);
    if (invoiceForm.lineItems.length === 1) {
      return; // Must hold at least 1 row
    }
    const updatedLines = invoiceForm.lineItems.filter((_, i) => i !== index);
    setInvoiceForm(prev => ({ ...prev, lineItems: updatedLines }));
  };

  // Keyboard Navigation: Enter key on discount fields inserts row and shifts focus
  const handleKeyDownDiscount = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLineItemRow();
    }
  };

  // Math Calculations (State reactive values based on currently configured profile)
  const isRegular = profile?.registrationType === 'Regular Taxpayer';
  const isComposition = profile?.registrationType === 'Composition Scheme';

  const calculateTotals = (items) => {
    let lineTotals = [];
    let taxableValueSum = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const price = parseFloat(item.basePrice) || 0;
      const qty = parseInt(item.quantity) || 0;
      const disc = parseFloat(item.discountPercentage) || 0;
      const gst = parseFloat(item.gstRate) || 0;

      const taxable = (price * qty) - ((price * qty) * (disc / 100));
      let cgstVal = 0;
      let sgstVal = 0;

      if (isRegular) {
        cgstVal = taxable * ((gst / 2) / 100);
        sgstVal = taxable * ((gst / 2) / 100);
      }

      const total = taxable + cgstVal + sgstVal;

      lineTotals.push({
        ...item,
        taxableValue: Math.round(taxable * 100) / 100,
        cgst: Math.round(cgstVal * 100) / 100,
        sgst: Math.round(sgstVal * 100) / 100,
        total: Math.round(total * 100) / 100
      });

      taxableValueSum += taxable;
      cgstSum += cgstVal;
      sgstSum += sgstVal;
      grandTotal += total;
    });

    return {
      lineTotals,
      taxableValueSum: Math.round(taxableValueSum * 100) / 100,
      cgstSum: Math.round(cgstSum * 100) / 100,
      sgstSum: Math.round(sgstSum * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  };

  const currentCalculations = calculateTotals(invoiceForm.lineItems);

  // Submit/Save Invoice
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    setSuccess(null);

    // Dynamic validations
    if (!invoiceForm.clientName.trim()) {
      setErrors(['Client name is required.']);
      setSaving(false);
      return;
    }
    if (!invoiceForm.clientAddress.trim()) {
      setErrors(['Client address is required.']);
      setSaving(false);
      return;
    }
    if (!invoiceForm.dueDate) {
      setErrors(['Invoice due date is required.']);
      setSaving(false);
      return;
    }

    const hasIncompleteLines = invoiceForm.lineItems.some(item => !item.name?.trim() || !item.quantity || item.basePrice === '');
    if (hasIncompleteLines) {
      setErrors(['All line items must have an item name, quantity, and price specified.']);
      setSaving(false);
      return;
    }

    try {
      const response = await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceForm)
      });
      const result = await response.json();

      if (response.ok) {
        setSuccess(`Successfully generated Invoice ${result.invoiceNumber}.`);
        // Reset Form
        setInvoiceForm({
          invoiceNumber: '',
          clientName: '',
          clientAddress: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          lineItems: [
            { productId: '', name: '', basePrice: 0, hsnSacCode: '', gstRate: 18, quantity: 1, discountPercentage: 0 }
          ]
        });
        loadInitialData(); // Refresh histories
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || 'Failed to save invoice.']);
        }
      }
    } catch (err) {
      setErrors(['Failed to communicate with Server. Check network console.']);
    } finally {
      setSaving(false);
    }
  };

  // Preview target data getter (takes historical selection or current form computations)
  const getPreviewData = () => {
    if (selectedHistoricalInvoice) {
      const totals = getInvoiceTotals(selectedHistoricalInvoice);
      return {
        number: selectedHistoricalInvoice.invoiceNumber,
        date: new Date(selectedHistoricalInvoice.invoiceDate).toLocaleDateString(),
        dueDate: new Date(selectedHistoricalInvoice.dueDate).toLocaleDateString(),
        clientName: selectedHistoricalInvoice.clientName,
        clientAddress: selectedHistoricalInvoice.clientAddress,
        lines: totals.lines,
        taxableSum: totals.taxableSum,
        cgstSum: totals.cgstSum,
        sgstSum: totals.sgstSum,
        grandTotal: totals.grandTotal,
        profile: selectedHistoricalInvoice.enterpriseProfileSnapshot,
        status: selectedHistoricalInvoice.status || 'Pending'
      };
    }

    return {
      number: invoiceForm.invoiceNumber,
      date: new Date(invoiceForm.invoiceDate).toLocaleDateString(),
      dueDate: invoiceForm.dueDate ? new Date(invoiceForm.dueDate).toLocaleDateString() : '—',
      clientName: invoiceForm.clientName || 'Draft Client Name',
      clientAddress: invoiceForm.clientAddress || 'Client Billing Address Here',
      lines: currentCalculations.lineTotals,
      taxableSum: currentCalculations.taxableValueSum,
      cgstSum: currentCalculations.cgstSum,
      sgstSum: currentCalculations.sgstSum,
      grandTotal: currentCalculations.grandTotal,
      profile: profile,
      status: 'Pending'
    };
  };

  const preview = getPreviewData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-cozy-lg border border-cozy-sand shadow-sm">
        <RefreshCw className="animate-spin text-cozy-sage mb-4" size={32} />
        <p className="text-sm text-cozy-charcoal/60">Initializing billing engines...</p>
      </div>
    );
  }

  // Profile setup check
  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
        <AlertCircle size={48} className="text-cozy-amber mb-4 animate-pulse" />
        <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Business Profile Required</h3>
        <p className="text-sm text-cozy-charcoal/70 mt-2 leading-relaxed">
          Before creating customer invoices, you must set up your business identity, physical address, and tax registration tier details.
        </p>
        <p className="text-xs text-cozy-charcoal/50 mt-1">
          Please click on the **Business Profile** tab above to configure your settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full items-center print:block print:p-0 print:m-0">
      {/* Visual Alerts */}
      {success && (
        <div className="w-full max-w-4xl mx-auto p-4 bg-cozy-sage/15 border border-cozy-sage/30 rounded-cozy flex items-start gap-3 text-cozy-sage-dark text-sm animate-fadeIn print:hidden">
          <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="w-full max-w-4xl mx-auto p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn print:hidden">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span className="font-semibold">Generation Failed:</span>
          </div>
          <ul className="list-disc pl-10 mt-1 flex flex-col gap-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Invoice Generator Form (Centered) */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 print:hidden">
        <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cozy-sand">
            <div className="w-10 h-10 rounded-cozy bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Compile New Invoice</h3>
              <p className="text-xs text-cozy-charcoal/50">Draft client items and calculate tax structures in real time</p>
            </div>
          </div>

          <form onSubmit={handleSaveInvoice} className="flex flex-col gap-6">
            
            {/* Form Row 1: Invoice Number & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-number" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Invoice Number
                </label>
                <input
                  id="form-number"
                  type="text"
                  name="invoiceNumber"
                  value={invoiceForm.invoiceNumber}
                  onChange={handleFieldChange}
                  placeholder="INV-XXXXXX"
                  className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-date" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-date"
                  type="date"
                  name="invoiceDate"
                  value={invoiceForm.invoiceDate}
                  onChange={handleFieldChange}
                  className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-dueDate" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-dueDate"
                  type="date"
                  name="dueDate"
                  value={invoiceForm.dueDate}
                  onChange={handleFieldChange}
                  className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            {/* Form Row 2: Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-clientName" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
                  <input
                    id="form-clientName"
                    type="text"
                    name="clientName"
                    value={invoiceForm.clientName}
                    onChange={handleFieldChange}
                    placeholder="e.g. Acme Agency LLC"
                    className="w-full pl-10 pr-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-clientAddress" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                  Client Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-clientAddress"
                  type="text"
                  name="clientAddress"
                  value={invoiceForm.clientAddress}
                  onChange={handleFieldChange}
                  placeholder="Full physical billing location..."
                  className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <hr className="border-cozy-sand" />

            {/* Dynamic Line Items Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">Line Item Ledger Summary</span>
                <span className="text-[10px] text-cozy-charcoal/40">Tip: Press **Enter** on discount field to append new row</span>
              </div>

              <div className="flex flex-col gap-3.5">
                {invoiceForm.lineItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-cozy-cream/30 border border-cozy-sand/50 rounded-cozy relative"
                  >
                    {/* Selector Product & Name */}
                    <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                      <label htmlFor={`product-select-${idx}`} className="sr-only">Choose Product</label>
                      <select
                        id={`product-select-${idx}`}
                        ref={el => productSelectRefs.current[idx] = el}
                        value={item.productId || ''}
                        onChange={(e) => handleLineItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs transition-all font-semibold"
                      >
                        <option value="">-- Custom / One-off Item --</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({formatINR(p.basePrice)})</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleLineItemChange(idx, 'name', e.target.value)}
                        placeholder="Enter item or service name..."
                        className="w-full px-3 py-1.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs transition-all"
                        required
                      />
                    </div>

                    {/* Numeric Grid (Price, Quantity, Discount, GST Rate, Subtotal) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center flex-1 sm:flex-[2] min-w-[320px]">
                      {/* Price */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-cozy-charcoal/50 uppercase">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.basePrice === 0 && item.productId === '' ? '' : item.basePrice}
                          onChange={(e) => handleLineItemChange(idx, 'basePrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs text-center font-semibold"
                          required
                        />
                      </div>

                      {/* Quantity */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-cozy-charcoal/50 uppercase">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs text-center font-semibold"
                          required
                        />
                      </div>

                      {/* Discount */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-cozy-charcoal/50 uppercase">Disc%</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercentage}
                          onChange={(e) => handleLineItemChange(idx, 'discountPercentage', e.target.value)}
                          onKeyDown={(e) => handleKeyDownDiscount(e, idx)}
                          className="w-full px-2.5 py-1 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs text-center"
                        />
                      </div>

                      {/* GST Rate */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-cozy-charcoal/50 uppercase">GST%</label>
                        <select
                          disabled={!isRegular}
                          value={isRegular ? item.gstRate : 0}
                          onChange={(e) => handleLineItemChange(idx, 'gstRate', e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-cozy-sand rounded-cozy focus:outline-none text-xs text-center disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>

                      {/* Line total summary */}
                      <div className="flex flex-col gap-1 text-right col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-bold text-cozy-charcoal/50 uppercase">Subtotal</label>
                        <span className="text-xs font-bold text-cozy-charcoal/85 mt-1.5 font-mono">
                          {currentCalculations.lineTotals[idx]
                            ? formatINR(currentCalculations.lineTotals[idx].total)
                            : formatINR(0)}
                        </span>
                      </div>
                    </div>

                    {/* Remove trash trigger */}
                    <button
                      type="button"
                      disabled={invoiceForm.lineItems.length === 1}
                      onClick={() => removeLineItemRow(idx)}
                      className="p-1.5 text-cozy-charcoal/40 hover:text-red-650 disabled:opacity-30 rounded-cozy self-end sm:self-center transition-colors"
                      title="Remove item row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLineItemRow}
                  className="py-2.5 bg-cozy-cream hover:bg-cozy-sand border border-dashed border-cozy-sand text-cozy-charcoal text-xs font-bold rounded-cozy flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Plus size={14} /> Append Line Item Row
                </button>
              </div>
            </div>

            {/* Action Save Buttons */}
            <div className="mt-4 pt-4 border-t border-cozy-sand flex justify-end">
              <button
                type="submit"
                disabled={saving || products.length === 0}
                className="px-6 py-3 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.02] transform active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                Compile & Save Invoice Record
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* LIVE INVOICE PREVIEW PANEL (A4 Stacked Layout) */}
      <div className="w-full flex flex-col gap-6 print:block print:p-0 print:m-0">
        <div className="w-full bg-cozy-sand/30 py-12 border-y border-cozy-sand/80 print:bg-transparent print:p-0 print:border-none print:m-0">
          
          {/* Header control */}
          <div className="w-[210mm] max-w-full mx-auto bg-cozy-charcoal text-white px-6 py-3.5 flex items-center justify-between no-print rounded-t-cozy shadow-sm border-b border-cozy-charcoal/20 print:hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/75">Live Document Preview</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="text-[10px] px-2.5 py-1 bg-cozy-sage hover:bg-cozy-sage-dark text-white rounded font-medium transition-colors cursor-pointer"
              >
                Print
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="text-[10px] px-2.5 py-1 bg-cozy-amber hover:bg-cozy-amber-dark text-white rounded font-medium transition-colors cursor-pointer"
              >
                Download PDF
              </button>
              {selectedHistoricalInvoice && (
                <button 
                  onClick={() => setSelectedHistoricalInvoice(null)}
                  className="text-[10px] px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Document sheet (A4 Dimensions) */}
          <InvoicePreview id="print-area" preview={preview} />
        </div>
      </div>

      {/* Invoice Invoicing Ledger history List (Full Width block at bottom, Centered) */}
      <div className="bg-white rounded-cozy-lg border border-cozy-sand shadow-sm overflow-hidden w-full max-w-4xl mx-auto print:hidden">
        <div className="bg-cozy-sand/50 p-6 border-b border-cozy-sand flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-cozy-charcoal">Billing Ledger History</h3>
            <p className="text-xs text-cozy-charcoal/60">List of compiled client transactions and tax records</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center text-cozy-charcoal/50 text-sm">
            No invoices generated yet. Compile your first invoice above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cozy-sand/30 border-b border-cozy-sand text-xs uppercase font-bold text-cozy-charcoal/60">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Tax System</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cozy-sand/50">
                {invoices.map((inv) => (
                  <tr 
                    key={inv._id}
                    className={`hover:bg-cozy-cream/35 cursor-pointer transition-colors duration-150 ${
                      selectedHistoricalInvoice?._id === inv._id ? 'bg-cozy-sage/5 font-semibold' : ''
                    }`}
                    onClick={() => setSelectedHistoricalInvoice(inv)}
                  >
                    <td className="p-4 font-mono font-bold text-cozy-sage-dark">{inv.invoiceNumber}</td>
                    <td className="p-4 text-cozy-charcoal">{inv.clientName}</td>
                    <td className="p-4 text-cozy-charcoal/70">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-cozy-charcoal/60 block">
                        {inv.enterpriseProfileSnapshot?.registrationType || '—'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-cozy-charcoal">
                      {formatINR(getInvoiceTotals(inv).grandTotal)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-cozy-sage/15 text-cozy-sage-dark'
                          : 'bg-cozy-amber/15 text-cozy-amber'
                      }`}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHistoricalInvoice(inv);
                          }}
                          className="px-2 py-1 bg-cozy-sand hover:bg-cozy-sand/80 text-cozy-charcoal text-xs font-semibold rounded-cozy flex items-center gap-1 cursor-pointer"
                        >
                          Preview <ArrowRight size={10} />
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
                            try {
                              const response = await apiFetch(`/api/invoices/${inv._id}/status`, {
                                method: 'PUT',
                                body: JSON.stringify({ status: nextStatus })
                              });
                              if (response.ok) {
                                loadInitialData();
                              }
                            } catch (err) {
                              console.error('Failed to toggle status:', err);
                            }
                          }}
                          className="px-2 py-1 bg-cozy-cream hover:bg-cozy-sand border border-cozy-sand text-cozy-charcoal text-[10px] font-semibold rounded-cozy cursor-pointer active:scale-95 transition-transform"
                        >
                          {inv.status === 'Paid' ? 'Pending' : 'Paid'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default InvoiceEngine;
