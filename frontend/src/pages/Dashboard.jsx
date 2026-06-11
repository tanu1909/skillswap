import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getMyBookingsAPI, updateBookingStatusAPI } from '../api/booking.api.js';
import ReviewForm from '../components/ReviewForm.jsx';

function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);

  // Fetch all bookings associated with the logged in profile
  const fetchBookings = async () => {
    try {
      const data = await getMyBookingsAPI();
      setBookings(data);
    } catch (err) {
      setError('Could not load your scheduled sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle confirming or cancelling an appointment
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatusAPI(bookingId, newStatus);
      alert(`Session ${newStatus}!`);
      fetchBookings(); // Refresh list data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', background:'var(--color-background)' }}>

      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px' }}>
        <div>
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Manage your skill swaps and upcoming lessons.</p>
        </div>
        
        {/* Flex wrap container holding both operational buttons cleanly */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/profile" style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Edit Profile 🛠️
          </Link>
          <button onClick={logout} style={{ padding: '10px 20px', background: 'var(--color-surface)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>    

      {/* Navigation Shortcut Panel */}
      <div style={{ margin: '20px 0', padding: '20px', background: 'var(--color-surface)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: 'var(--color-text)', fontWeight: '500' }}>Looking to learn something new today?</p>
        <Link to="/browse" style={{ padding: '10px 20px', background: 'var(--color-accent)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Search Profiles 🔍
        </Link>
      </div>

      {/* Bookings & Schedules Section */}
      <h3>Your Scheduled Sessions 🗓️</h3>
      {loading && <p>Loading your timeline calendar...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && bookings.length === 0 && (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No upcoming sessions booked yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {bookings.map((b) => {
          const isTeacher = b.teacher._id === user._id;
          const counterpart = isTeacher ? b.learner : b.teacher;
          const dateString = new Date(b.sessionDate).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
          });

          return (
            <div key={b._id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Session Context Information */}
                <div>
                  <span style={{ 
                    background: b.status === 'confirmed' ? '#D4EDDA' : b.status === 'pending' ? '#FFF3CD' : '#F8D7DA',
                    color: b.status === 'confirmed' ? '#155724' : b.status === 'pending' ? '#856404' : '#721C24',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {b.status}
                  </span>
                  <h4 style={{ margin: '10px 0 5px 0' }}>{b.skillTitle}</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>
                    <strong>{isTeacher ? 'Teaching:' : 'Learning from:'}</strong> {counterpart.name} ({counterpart.email})
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#777' }}>
                    📅 {dateString} | ⏰ {b.timeSlot}
                  </p>
                </div>

                {/* Context-Driven Action Buttons Container */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  
                  {/* Live Instant Messaging Room Route Link */}
                  <Link
                    to="/chat"
                    state={{ partnerId: counterpart._id, partnerName: counterpart.name }}
                    style={{ padding: '8px 12px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', display: 'inline-block' }}
                  >
                    Message 💬
                  </Link>

                  {/* Accept Pending Request (Teachers Only) */}
                  {b.status === 'pending' && isTeacher && (
                    <button onClick={() => handleStatusChange(b._id, 'confirmed')} style={{ padding: '8px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                      Accept
                    </button>
                  )}

                  {/* Complete Confirmed Session (Teachers Only) */}
                  {b.status === 'confirmed' && isTeacher && (
                    <button onClick={() => handleStatusChange(b._id, 'completed')} style={{ padding: '8px 12px', background: '#0F6E56', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                      Complete ✅
                    </button>
                  )}

                  {/* Toggle Inline Review Box Trigger */}
                  {b.status === 'completed' && !b.hasReview && activeReviewBookingId !== b._id && (
                    <button 
                      onClick={() => setActiveReviewBookingId(b._id)}
                      style={{ padding: '8px 12px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Leave Review ⭐
                    </button>
                  )}

                  {/* Cancel Request / Active Schedule */}
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button onClick={() => handleStatusChange(b._id, 'cancelled')} style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Collapsible Review Textbox Area Block */}
              {activeReviewBookingId === b._id && (
                <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                  <ReviewForm 
                    bookingId={b._id} 
                    onReviewSuccess={() => {
                      setActiveReviewBookingId(null);
                      fetchBookings(); // Refresh UI logs on submission
                    }} 
                    onCancel={() => setActiveReviewBookingId(null)} 
                  />
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;