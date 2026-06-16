import React from 'react';
import { 
  TERMS_AND_CONDITIONS, 
  PRIVACY_POLICY, 
  GST_GUIDELINES 
} from '../constants/legalContent';

function LegalModal({ isOpen, closeModal, contentType }) {
  if (!isOpen) return null;

  let title = '';
  let content = '';

  switch (contentType) {
    case 'terms':
      title = 'Terms & Conditions';
      content = TERMS_AND_CONDITIONS;
      break;
    case 'privacy':
      title = 'Privacy Policy';
      content = PRIVACY_POLICY;
      break;
    case 'gst':
      title = 'GST Guidelines';
      content = GST_GUIDELINES;
      break;
    default:
      title = 'Legal Information';
      content = '';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Scrollable Content Card */}
      <div className="max-w-2xl w-full max-h-[80vh] flex flex-col bg-[#FDFBF7] rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="text-lg font-bold font-serif text-stone-900">{title}</h3>
          <button 
            onClick={closeModal}
            className="text-stone-400 hover:text-stone-600 transition-colors text-xl font-bold cursor-pointer"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="whitespace-pre-line text-stone-700 leading-relaxed tracking-wide text-sm font-sans text-left">
            {content}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 border-t border-stone-200 flex justify-end bg-stone-50">
          <button
            onClick={closeModal}
            className="px-5 py-2 bg-cozy-sage hover:bg-cozy-sage-dark text-white rounded-cozy text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
