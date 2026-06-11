import React, { useState } from 'react';
import { createBookingAPI } from '../api/booking.api.js';

function BookingPanel({ teacherId, swapRequestId, skillTitle }) {
  const [sessionDate, setSessionDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const availableSlots = [
    "09:00 AM - 10:00 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "04:00 PM - 05:00 PM",
    "06:00 PM - 07:00 PM"
  ];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!sessionDate || !timeSlot) {
      setError('Please select a date and time slot.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await createBookingAPI({
        swapRequest: swapRequestId,
        teacher: teacherId,
        skillTitle: skillTitle || "General Skill Swap",
        sessionDate,
        timeSlot
      });
      setMessage('Session requested successfully! 🎉');
      setSessionDate('');
      setTimeSlot('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '15px', padding: '15px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-card)', textAlign: 'left' }}>
      <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-text)' }}>Schedule a Session: {skillTitle}</h4>
      
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
      {message && <p style={{ color: 'green', fontSize: '14px' }}>{message}</p>}

      <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Pick a Date:</label>
          <input 
            type="date" 
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Available Hours:</label>
          <select 
            value={timeSlot} 
            onChange={(e) => setTimeSlot(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          >
            <option value="">-- Select Time Window --</option>
            {availableSlots.map((slot, index) => (
              <option key={index} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            background: 'var(--color-accent)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '5px'
          }}
        >
          {loading ? 'Submitting...' : 'Request Booking Slot'}
        </button>
      </form>
    </div>
  );
}

export default BookingPanel;