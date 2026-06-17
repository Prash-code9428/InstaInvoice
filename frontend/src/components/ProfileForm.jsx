import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, RefreshCw, Building, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

function ProfileForm() {
  const { apiFetch } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    registrationType: 'Unregistered / Small Business',
    gstin: '',
    logoUrl: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    signatureUrl: '',
    upiId: '',
    preferredPaymentMethod: 'BANK'
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState([]);
  
  // States to track active asset uploads
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Asset upload pipeline to Supabase Storage
  const uploadAsset = async (file, type) => {
    const isLogo = type === 'logo';
    const setUploading = isLogo ? setUploadingLogo : setUploadingSignature;
    setUploading(true);
    setErrors([]);
    setSuccess(null);

    try {
      const ext = file.name.split('.').pop() || 'png';
      const timestamp = Date.now();
      const filePath = isLogo ? `logos/logo_${timestamp}.${ext}` : `signatures/sig_${timestamp}.${ext}`;

      const { data, error } = await supabase.storage
        .from('invoice-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('invoice-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        [isLogo ? 'logoUrl' : 'signatureUrl']: publicUrl
      }));
    } catch (err) {
      console.error(`Error uploading ${type} to Supabase:`, err);
      setErrors([`Failed to upload ${type}: ${err.message || err}`]);
    } finally {
      setUploading(false);
    }
  };

  // Fetch current profile configuration
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setFormData({
              name: data.name || '',
              address: data.address || '',
              contactNumber: data.contactNumber || '',
              registrationType: data.registrationType || 'Unregistered / Small Business',
              gstin: data.gstin || '',
              logoUrl: data.logoUrl || '',
              bankName: data.bankName || '',
              branchName: data.branchName || '',
              accountNumber: data.accountNumber || '',
              ifscCode: data.ifscCode || '',
              signatureUrl: data.signatureUrl || '',
              upiId: data.upiId || '',
              preferredPaymentMethod: data.preferredPaymentMethod || 'BANK'
            });
          }
        }
      } catch (err) {
        console.error('Error loading enterprise profile:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear alerts on change
    setSuccess(null);
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setErrors([]);

    // Client-side validation for GSTIN
    const showGstin = formData.registrationType === 'Regular Taxpayer' || formData.registrationType === 'Composition Scheme';
    if (showGstin) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!formData.gstin) {
        setErrors(['GSTIN number is required for taxpayers.']);
        setLoading(false);
        return;
      }
      if (!gstinRegex.test(formData.gstin)) {
        setErrors(['Please enter a valid 15-character GSTIN. Format: 22AAAAA1111A1Z1']);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Enterprise profile saved successfully.');
        setFormData({
          name: result.name || '',
          address: result.address || '',
          contactNumber: result.contactNumber || '',
          registrationType: result.registrationType || 'Unregistered / Small Business',
          gstin: result.gstin || '',
          logoUrl: result.logoUrl || '',
          bankName: result.bankName || '',
          branchName: result.branchName || '',
          accountNumber: result.accountNumber || '',
          ifscCode: result.ifscCode || '',
          signatureUrl: result.signatureUrl || '',
          upiId: result.upiId || '',
          preferredPaymentMethod: result.preferredPaymentMethod || 'BANK'
        });
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors([result.error || 'Failed to save configuration.']);
        }
      }
    } catch (err) {
      setErrors(['Could not connect to the server. Please ensure the backend is running.']);
    } finally {
      setLoading(false);
    }
  };

  const showGstinField = formData.registrationType === 'Regular Taxpayer' || formData.registrationType === 'Composition Scheme';

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-cozy-lg border border-cozy-sand shadow-sm">
        <RefreshCw className="animate-spin text-cozy-sage mb-4" size={32} />
        <p className="text-sm text-cozy-charcoal/60">Loading business identity configuration...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-cozy-lg border border-cozy-sand shadow-sm overflow-hidden">
      <div className="bg-cozy-sand/50 p-6 border-b border-cozy-sand flex items-center gap-4">
        <div className="w-12 h-12 rounded-cozy bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
          <Building size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif text-cozy-charcoal">Enterprise Profile</h2>
          <p className="text-xs text-cozy-charcoal/60">Define your public business identity and tax registration terms</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-cozy-sage/15 border border-cozy-sage/30 rounded-cozy flex items-start gap-3 text-cozy-sage-dark text-sm animate-fadeIn">
            <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Unable to save:</span>
            </div>
            <ul className="list-disc pl-10 mt-1 flex flex-col gap-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Text Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="company-name" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              Business / Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="company-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Acme Creative Studio"
              className="px-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-number" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              Contact Number / Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-number"
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g., +91 98765 43210"
              className="px-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              Physical / Billing Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full mailing address..."
              rows="3"
              className="px-4 py-2.5 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Logo & Signature Drag-and-Drop Uploader Blocks */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Logo Uploader */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Company Logo
              </span>
              <div 
                className={`h-40 border-2 border-dashed rounded-cozy flex flex-col items-center justify-center p-4 text-center transition-all relative ${
                  formData.logoUrl 
                    ? 'border-cozy-sage/40 bg-cozy-sage/5' 
                    : 'border-cozy-sand bg-cozy-cream/30 hover:border-cozy-sage/60 hover:bg-cozy-sand/10'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    uploadAsset(file, 'logo');
                  }
                }}
              >
                {uploadingLogo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-cozy-sage" size={24} />
                    <span className="text-xs text-cozy-charcoal/60">Uploading Logo...</span>
                  </div>
                ) : formData.logoUrl ? (
                  <div className="w-full h-full flex items-center justify-center relative group">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="max-h-32 max-w-full object-contain rounded" 
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors shadow-sm cursor-pointer"
                      title="Remove Logo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          uploadAsset(file, 'logo');
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-cozy-charcoal/80">+ Add Company Logo</span>
                    <span className="text-[10px] text-cozy-charcoal/40">Drag & drop or click to browse</span>
                  </label>
                )}
              </div>
            </div>

            {/* Signature Uploader */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Authorized Signature
              </span>
              <div 
                className={`h-40 border-2 border-dashed rounded-cozy flex flex-col items-center justify-center p-4 text-center transition-all relative ${
                  formData.signatureUrl 
                    ? 'border-cozy-sage/40 bg-cozy-sage/5' 
                    : 'border-cozy-sand bg-cozy-cream/30 hover:border-cozy-sage/60 hover:bg-cozy-sand/10'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    uploadAsset(file, 'signature');
                  }
                }}
              >
                {uploadingSignature ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-cozy-sage" size={24} />
                    <span className="text-xs text-cozy-charcoal/60">Uploading Signature...</span>
                  </div>
                ) : formData.signatureUrl ? (
                  <div className="w-full h-full flex items-center justify-center relative group">
                    <img 
                      src={formData.signatureUrl} 
                      alt="Signature Preview" 
                      className="max-h-32 max-w-full object-contain rounded" 
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, signatureUrl: '' }))}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors shadow-sm cursor-pointer"
                      title="Remove Signature"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          uploadAsset(file, 'signature');
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-cozy-sage/10 text-cozy-sage-dark flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-cozy-charcoal/80">+ Add Authorized Signature</span>
                    <span className="text-[10px] text-cozy-charcoal/40">Drag & drop or click to browse</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-cozy-sand" />

        {/* Bank Details Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/70">Settlement Bank Details</h3>
            <p className="text-xs text-cozy-charcoal/50 mt-1">Provide bank credentials to automatically show customer payment info on invoices</p>
          </div>

          <div className="bg-cozy-sand/20 border border-cozy-sand/85 rounded-cozy p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="bank-name" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Bank Name
              </label>
              <input
                id="bank-name"
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. Cozy Cooperative Bank"
                className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="branch-name" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Branch Name
              </label>
              <input
                id="branch-name"
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="e.g. Downtown Branch"
                className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="account-number" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                Account Number
              </label>
              <input
                id="account-number"
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm font-mono transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="ifsc-code" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                IFSC Code
              </label>
              <input
                id="ifsc-code"
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. COZY0001234"
                className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm font-mono uppercase transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <hr className="border-cozy-sand" />

        {/* UPI Details Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/70">UPI Payment Details</h3>
            <p className="text-xs text-cozy-charcoal/50 mt-1">Provide UPI credentials to allow instant mobile app scans</p>
          </div>

          <div className="bg-cozy-sand/20 border border-cozy-sand/85 rounded-cozy p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="upi-id" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
                UPI ID
              </label>
              <input
                id="upi-id"
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="e.g. cozystore@okaxis"
                className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm font-mono transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <hr className="border-cozy-sand" />

        {/* Default Invoice Payment Display */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/70">Default Invoice Payment Display</h3>
            <p className="text-xs text-cozy-charcoal/50 mt-1">Select which payment details are highlighted by default on generated customer invoices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'BANK', label: 'Show Bank Details', desc: 'Default to displaying settlement bank, account, branch, and IFSC details.' },
              { value: 'UPI', label: 'Show UPI ID', desc: 'Default to displaying the enterprise UPI identification handle.' }
            ].map(method => (
              <label 
                key={method.value}
                className={`p-4 rounded-cozy border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                  formData.preferredPaymentMethod === method.value
                    ? 'border-cozy-sage bg-cozy-sage/5 shadow-sm'
                    : 'border-cozy-sand hover:border-cozy-sage/40 hover:bg-cozy-sand/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="preferredPaymentMethod"
                    value={method.value}
                    checked={formData.preferredPaymentMethod === method.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-cozy-sage focus:ring-cozy-sage border-cozy-sand"
                  />
                  <span className="text-sm font-bold text-cozy-charcoal">{method.label}</span>
                </div>
                <p className="text-xs text-cozy-charcoal/60 mt-2 pl-7 leading-relaxed">{method.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-cozy-sand" />

        {/* Tax Registration Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/70">Tax Registration Status</h3>
            <p className="text-xs text-cozy-charcoal/50 mt-1">Select the classification that fits your legal business operation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                value: 'Unregistered / Small Business', 
                label: 'Unregistered / Micro', 
                desc: 'No tax registration. Generates basic bills completely tax-free.' 
              },
              { 
                value: 'Regular Taxpayer', 
                label: 'Regular Taxpayer', 
                desc: 'Collects CGST/SGST from clients. Requires 15-digit GSTIN.' 
              },
              { 
                value: 'Composition Scheme', 
                label: 'Composition Scheme', 
                desc: 'Pays flat rates. Barred from collecting client tax. Bill of Supply output.' 
              }
            ].map(type => (
              <label 
                key={type.value}
                className={`p-4 rounded-cozy border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                  formData.registrationType === type.value
                    ? 'border-cozy-sage bg-cozy-sage/5 shadow-sm'
                    : 'border-cozy-sand hover:border-cozy-sage/40 hover:bg-cozy-sand/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="registrationType"
                    value={type.value}
                    checked={formData.registrationType === type.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-cozy-sage focus:ring-cozy-sage border-cozy-sand"
                  />
                  <span className="text-sm font-bold text-cozy-charcoal">{type.label}</span>
                </div>
                <p className="text-xs text-cozy-charcoal/60 mt-2 pl-7 leading-relaxed">{type.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional GSTIN Field */}
        {showGstinField && (
          <div className="p-5 bg-cozy-sand/30 rounded-cozy border border-cozy-sand/70 flex flex-col gap-2">
            <label htmlFor="gstin-number" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/70">
              GSTIN Identification Number <span className="text-red-500">*</span>
            </label>
            <input
              id="gstin-number"
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="15-digit GSTIN (e.g. 22AAAAA1111A1Z1)"
              className="px-4 py-2.5 bg-white border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm uppercase transition-all duration-200"
              maxLength="15"
              required={showGstinField}
            />
            <p className="text-[11px] text-cozy-charcoal/50 leading-relaxed mt-1">
              Must match the standard Indian GSTIN configuration (2 state digits, 10 PAN alpha-numerics, entity digit, 'Z', check digit).
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.02] transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            Save Business Configuration
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
