import React, { useState } from 'react';
import { createReviewAPI } from '../api/review.api.js';
import { Star, Send, X } from 'lucide-react';

function ReviewForm({ bookingId, onReviewSuccess, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createReviewAPI({
        bookingId,
        rating,
        comment: comment.trim()
      });
      alert('Thank you for your feedback! ⭐');
      if (onReviewSuccess) onReviewSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '15px', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-card)', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={18} /> Write a Review</h4>
      
      {error && <p style={{ color: 'red', fontSize: '14px', margin: '0 0 10px 0' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Rating:</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--color-border)', background: '#fff' }}
          >
            <option value="5">⭐⭐⭐⭐⭐ </option>
            <option value="4">⭐⭐⭐⭐ </option>
            <option value="3">⭐⭐⭐ </option>
            <option value="2">⭐⭐ </option>
            <option value="1">⭐ </option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>Your Review:</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '60px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '8px 16px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={16} /> {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            style={{ padding: '8px 16px', background: '#eee', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;