import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag, 
  IndianRupee, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  FileSpreadsheet
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';

function InventoryList() {
  const { apiFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    productId: '',
    basePrice: '',
    hsnSacCode: '',
    gstRate: 18
  });
  const [modalErrors, setModalErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch Inventory
  const fetchProducts = async () => {
    try {
      const response = await apiFetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setErrors(['Failed to load product catalog.']);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setErrors(['Could not connect to the API server. Please check that the backend is running.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setModalFormData(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? (value === '' ? '' : parseFloat(value)) : name === 'gstRate' ? parseInt(value) : value
    }));
    setModalErrors([]);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setModalFormData({
      name: '',
      productId: '',
      basePrice: '',
      hsnSacCode: '',
      gstRate: 18
    });
    setModalErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingId(product._id);
    setModalFormData({
      name: product.name || '',
      productId: product.productId || '',
      basePrice: product.basePrice !== undefined ? product.basePrice : '',
      hsnSacCode: product.hsnSacCode || '',
      gstRate: product.gstRate !== undefined ? product.gstRate : 18
    });
    setModalErrors([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalErrors([]);
  };

  // Submit Modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalErrors([]);
    setSuccess(null);

    // Simple validations
    if (!modalFormData.name.trim()) {
      setModalErrors(['Item name is required.']);
      setSaving(false);
      return;
    }
    if (!modalFormData.productId.trim()) {
      setModalErrors(['Product ID / Batch Number is required.']);
      setSaving(false);
      return;
    }
    if (modalFormData.basePrice === '' || isNaN(modalFormData.basePrice) || modalFormData.basePrice < 0) {
      setModalErrors(['Base price must be a positive number.']);
      setSaving(false);
      return;
    }
    if (!modalFormData.hsnSacCode.trim()) {
      setModalErrors(['HSN/SAC identification code is required.']);
      setSaving(false);
      return;
    }

    const path = modalMode === 'add' 
      ? '/api/products' 
      : `/api/products/${editingId}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await apiFetch(path, {
        method,
        body: JSON.stringify(modalFormData)
      });
      const result = await response.json();

      if (response.ok) {
        setSuccess(
          modalMode === 'add' 
            ? `Successfully created "${modalFormData.name}" catalog record.` 
            : `Successfully updated "${modalFormData.name}" catalog record.`
        );
        closeModal();
        fetchProducts(); // Refresh list
      } else {
        if (result.errors) {
          setModalErrors(result.errors);
        } else {
          setModalErrors([result.error || 'Failed to save inventory item.']);
        }
      }
    } catch (err) {
      setModalErrors(['Could not communicate with server. Please ensure backend is online.']);
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to remove "${product.name}" from your ledger?`)) {
      return;
    }

    setSuccess(null);
    setErrors([]);

    try {
      const response = await apiFetch(`/api/products/${product._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(`Successfully deleted item "${product.name}".`);
        fetchProducts();
      } else {
        const result = await response.json();
        setErrors([result.error || 'Failed to delete product.']);
      }
    } catch (err) {
      setErrors(['Failed to reach server to execute delete.']);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.hsnSacCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Alert Feedbacks */}
      {success && (
        <div className="p-4 bg-cozy-sage/15 border border-cozy-sage/30 rounded-cozy flex items-start gap-3 text-cozy-sage-dark text-sm animate-fadeIn">
          <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex flex-col gap-1 text-red-700 text-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span className="font-semibold">Catalog Error:</span>
          </div>
          <ul className="list-disc pl-10 mt-1 flex flex-col gap-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Control Header Card */}
      <div className="bg-white p-6 rounded-cozy-lg border border-cozy-sand shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-cozy bg-cozy-amber/10 text-cozy-amber flex items-center justify-center">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-cozy-charcoal">Inventory & Services Ledger</h2>
            <p className="text-xs text-cozy-charcoal/60">Save pre-configured line items with default price and tax codes</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cozy-charcoal/40" />
            <input 
              type="text" 
              placeholder="Search catalog items..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
            />
          </div>

          {/* Add button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.02] transform active:scale-95"
          >
            <Plus size={16} /> Add Product/Service
          </button>
        </div>
      </div>

      {/* Main Table Ledger Card */}
      <div className="bg-white rounded-cozy-lg border border-cozy-sand shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <RefreshCw className="animate-spin text-cozy-sage mb-4" size={32} />
            <p className="text-sm text-cozy-charcoal/60">Loading inventory catalog items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Tag size={40} className="text-cozy-charcoal/20 mb-3" />
            <p className="text-sm font-semibold text-cozy-charcoal/70">No catalog items found</p>
            <p className="text-xs text-cozy-charcoal/50 mt-1 max-w-sm">
              {searchTerm ? 'No results match your search term. Try tweaking keywords.' : 'Add your first service fee, hourly charge, or physical item rate to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-cozy-sand hover:bg-cozy-sand/80 text-cozy-charcoal rounded-cozy font-medium text-xs transition-all duration-200"
              >
                Create First Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cozy-sand/40 border-b border-cozy-sand">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60">Product Details</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60">Product ID / Batch</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60 text-right">Base Price</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60">HSN/SAC</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60 text-center">GST Rate</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-cozy-charcoal/60 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cozy-sand/60">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-cozy-cream/35 transition-colors duration-150">
                    <td className="p-5">
                      <span className="font-semibold block text-cozy-charcoal">{product.name}</span>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-mono bg-cozy-sand px-2.5 py-1 rounded-full text-cozy-charcoal/80 font-medium">
                        {product.productId}
                      </span>
                    </td>
                    <td className="p-5 text-right font-semibold text-cozy-charcoal">
                      {formatINR(product.basePrice)}
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-medium text-cozy-charcoal/70">{product.hsnSacCode}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.gstRate === 0 
                          ? 'bg-cozy-sand text-cozy-charcoal/70' 
                          : product.gstRate <= 12 
                          ? 'bg-cozy-sage/15 text-cozy-sage-dark' 
                          : 'bg-cozy-amber/15 text-cozy-amber'
                      }`}>
                        {product.gstRate}%
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-cozy-charcoal/65 hover:text-cozy-charcoal hover:bg-cozy-sand/50 rounded-cozy transition-colors duration-150"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 text-red-650 hover:text-red-700 hover:bg-red-50 rounded-cozy transition-colors duration-150"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
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

      {/* Add / Edit Accessible Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozy-charcoal/40 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-white rounded-cozy-lg border border-cozy-sand shadow-lg max-w-lg w-full overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="bg-cozy-sand/50 px-6 py-4 border-b border-cozy-sand flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-cozy-charcoal">
                {modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-1 rounded-cozy hover:bg-cozy-sand text-cozy-charcoal/60 hover:text-cozy-charcoal transition-colors duration-150"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6 flex flex-col gap-5">
              {modalErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-cozy flex items-start gap-2.5 text-red-700 text-sm">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">Please correct the following:</span>
                    <ul className="list-disc pl-5 mt-1 flex flex-col gap-0.5 text-xs">
                      {modalErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modal-name" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/75">
                  Item / Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-name"
                  type="text"
                  name="name"
                  value={modalFormData.name}
                  onChange={handleModalFormChange}
                  placeholder="e.g., Hourly Business Consulting"
                  className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-productId" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/75">
                    Product ID / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-productId"
                    type="text"
                    name="productId"
                    value={modalFormData.productId}
                    onChange={handleModalFormChange}
                    placeholder="e.g., SRV-CON-01"
                    className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-basePrice" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/75">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cozy-charcoal/40 text-sm">₹</span>
                    <input
                      id="modal-basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      name="basePrice"
                      value={modalFormData.basePrice}
                      onChange={handleModalFormChange}
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-hsnSacCode" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/75">
                    HSN / SAC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-hsnSacCode"
                    type="text"
                    name="hsnSacCode"
                    value={modalFormData.hsnSacCode}
                    onChange={handleModalFormChange}
                    placeholder="e.g., 998311"
                    className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-gstRate" className="text-xs font-bold uppercase tracking-wider text-cozy-charcoal/75">
                    GST Rate Selection <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="modal-gstRate"
                    name="gstRate"
                    value={modalFormData.gstRate}
                    onChange={handleModalFormChange}
                    className="px-4 py-2 bg-cozy-cream border border-cozy-sand rounded-cozy focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-sm transition-all duration-200"
                    required
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-cozy-sand flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-cozy-charcoal/20 text-cozy-charcoal rounded-cozy hover:bg-cozy-charcoal/5 font-medium text-sm transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-cozy-sage text-white rounded-cozy hover:bg-cozy-sage-dark font-medium text-sm flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : null}
                  {modalMode === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryList;
