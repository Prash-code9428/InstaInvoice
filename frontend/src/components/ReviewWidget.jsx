import React, { useState } from 'react';
import axios from 'axios';
import { Star, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ReviewWidget() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hide, setHide] = useState(false);

  const handleReviewSubmit = async () => {
    try {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('jwt');
      
      const payload = {
        userName: user?.name || user?.businessName || 'Verified Business Owner',
        rating: Number(rating),
        comment: comment
      };

      await axios.post('/api/reviews', payload, {
        headers: { 
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Switch UI state to success view
      setSubmitted(true);
      
      // Smoothly hide the widget after 3 seconds
      setTimeout(() => {
        setHide(true);
      }, 3000);
    } catch (err) {
      console.error("Frontend review error:", err.response?.data || err.message);
      let errorMsg = '';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.join(', ');
      } else {
        errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      }
      setError(errorMsg || 'Failed to submit review. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating first.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a brief comment.');
      return;
    }

    setLoading(true);
    setError(null);
    await handleReviewSubmit();
    setLoading(false);
  };

  if (hide) return null;

  return (
    <div className={`bg-white rounded-cozy-lg border border-cozy-sand p-6 shadow-sm transition-all duration-500 ease-in-out ${
      submitted ? 'bg-cozy-sage/5 border-cozy-sage/30 scale-95 opacity-90' : 'hover:shadow-md'
    }`}>
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn">
          <CheckCircle className="text-cozy-sage-dark mb-3" size={36} />
          <h4 className="text-sm font-bold text-cozy-charcoal font-serif">Thank You for Your Feedback!</h4>
          <p className="text-xs text-cozy-charcoal/60 mt-1 max-w-xs leading-relaxed">
            Your review has been saved in our database. It helps small business owners discover InstaInvoice!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-cozy-charcoal/75">Enjoying InstaInvoice?</h4>
            <p className="text-xs text-cozy-charcoal/45 mt-0.5">Let us know how your invoicing and compliance experience has been!</p>
          </div>

          {error && (
            <div className="text-[11px] text-red-650 bg-red-50 border border-red-100 p-2.5 rounded-cozy leading-snug font-medium">
              {error}
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isActive = (hoverRating || rating) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  title={`${starValue} Stars`}
                >
                  <Star
                    size={24}
                    className={`transition-colors duration-150 ${
                      isActive 
                        ? 'fill-cozy-amber text-cozy-amber' 
                        : 'text-cozy-sand fill-transparent hover:text-cozy-amber/50'
                    }`}
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="text-xs text-cozy-charcoal/60 font-semibold ml-2">
                ({rating} / 5)
              </span>
            )}
          </div>

          {/* Comments Textarea */}
          <div className="flex flex-col gap-1.5">
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(null);
              }}
              maxLength={250}
              placeholder="Tell us what you like or how we can improve..."
              rows={3}
              className="w-full p-3 bg-cozy-cream/35 border border-cozy-sand rounded-cozy text-xs focus:outline-none focus:ring-2 focus:ring-cozy-sage focus:border-transparent text-cozy-charcoal transition-all resize-none leading-relaxed"
            />
            <div className="text-right text-[10px] text-cozy-charcoal/40 font-medium">
              {comment.length} / 250 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-max px-4 py-2 bg-cozy-sage hover:bg-cozy-sage-dark text-white rounded-cozy text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="animate-spin" size={12} /> : null}
            <span>Submit Review</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default ReviewWidget;
