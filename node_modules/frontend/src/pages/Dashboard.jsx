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
  const [activeTab, setActiveTab] = useState('active');

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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatusAPI(bookingId, newStatus);
      alert(`Session ${newStatus}!`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const renderBookingCard = (b) => {
    const isTeacher = b.teacher._id === user._id;
    const counterpart = isTeacher ? b.learner : b.teacher;
    const dateString = new Date(b.sessionDate).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    // Individual dynamic inline color configurations based strictly on lifecycle status
    let badgeBg = '#FCE4D6';
    let badgeText = '#C65911';
    if (b.status === 'confirmed') { badgeBg = '#E2F0D9'; badgeText = '#385723'; }
    if (b.status === 'pending') { badgeBg = '#FFF2CC'; badgeText = '#7F6000'; }
    if (b.status === 'completed') { badgeBg = '#E8F1F5'; badgeText = '#1F4E79'; }

    return (
      <div key={b._id} style={{ padding: '20px', border: '1px solid rgba(193, 183, 241, 0.45)', borderRadius: '16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 12px 28px rgba(154, 132, 232, 0.11)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          <div>
            <span style={{ background: badgeBg, color: badgeText, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
              {b.status}
            </span>
            <h4 style={{ margin: '12px 0 6px 0', color: 'var(--color-text)', fontSize: '16px', fontWeight: 'bold' }}>
              {b.skillTitle}
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--color-text)', opacity: 0.8, lineHeight: '1.4' }}>
              <strong style={{ fontWeight: 'bold' }}>{isTeacher ? 'Teaching:' : 'Learning from:'}</strong> {counterpart.name} <span style={{ fontSize: '12px', opacity: 0.6 }}>({counterpart.email})</span>
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--color-text)', opacity: 0.55 }}>
              📅 {dateString} | ⏰ {b.timeSlot}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {b.status === 'confirmed' && (
              <Link to={`/room/${b._id}`} state={{ skillTitle: b.skillTitle }} style={{ padding: '8px 14px', background: '#6BCB7A', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', boxShadow: '0 2px 4px rgba(107,203,122,0.25)' }}>
                Join Call 🎥
              </Link>
            )}

            <Link to="/chat" state={{ partnerId: counterpart._id, partnerName: counterpart.name }} style={{ padding: '8px 14px', background: '#706CFF', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-block', boxShadow: '0 2px 6px rgba(112,108,255,0.18)' }}>
              Message 💬
            </Link>

            {b.status === 'pending' && isTeacher && (
              <button onClick={() => handleStatusChange(b._id, 'confirmed')} style={{ padding: '8px 14px', background: '#4EC2AE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 6px rgba(78,194,174,0.24)' }}>
                Accept
              </button>
            )}

            {b.status === 'confirmed' && isTeacher && (
              <button onClick={() => handleStatusChange(b._id, 'completed')} style={{ padding: '8px 14px', background: '#5A9DFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 6px rgba(90,157,255,0.24)' }}>
                Complete ✅
              </button>
            )}

            {b.status === 'completed' && !b.hasReview && activeReviewBookingId !== b._id && (
              <button onClick={() => setActiveReviewBookingId(b._id)} style={{ padding: '8px 14px', background: '#A974FF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 6px rgba(169,116,255,0.22)' }}>
                Leave Review ⭐
              </button>
            )}

            {b.status !== 'cancelled' && b.status !== 'completed' && (
              <button onClick={() => handleStatusChange(b._id, 'cancelled')} style={{ padding: '8px 14px', background: '#FF7C7C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 6px rgba(255,124,124,0.24)' }}>
                Cancel
              </button>
            )}
          </div>

        </div>

        {activeReviewBookingId === b._id && (
          <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '15px', marginTop: '5px' }}>
            <ReviewForm 
              bookingId={b._id} 
              onReviewSuccess={() => {
                setActiveReviewBookingId(null);
                fetchBookings(); 
              }} 
              onCancel={() => setActiveReviewBookingId(null)} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', background: '#F3E8FF', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(216, 200, 216, 0.7)', paddingBottom: '20px', gap: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--color-text)', letterSpacing: '-0.5px', margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: 'var(--color-text)', opacity: 0.7, margin: '5px 0 0 0', fontSize: '14px' }}>
            Manage your skill swaps and upcoming lessons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/profile/view" style={{ padding: '10px 20px', background: 'var(--color-card)', color: 'var(--color-text)', textDecoration: 'none', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600', fontSize: '14px' }}>
            View Profile 👤
          </Link>
          <button onClick={logout} style={{ padding: '10px 20px', background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            Logout
          </button>
        </div>
      </div>    

      <div style={{ margin: '25px 0 35px', padding: '20px', background: 'var(--color-peach)', border: '1px solid #E6D1D4', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 24px rgba(191, 164, 246, 0.1)' }}>
        <p style={{ margin: 0, color: 'var(--color-text)', fontWeight: '500', fontSize: '15px' }}>
          Looking to learn something new today?
        </p>
        <Link to="/browse" style={{ padding: '10px 20px', background: 'var(--color-mint)', color: 'var(--color-text)', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
          Search Profiles 🔍
        </Link>
      </div>

      <h3 style={{ color: 'var(--color-text)', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Your Scheduled Sessions 🗓️
      </h3>
      
      {loading && <p style={{ color: 'var(--color-text)', opacity: 0.7, fontSize: '15px' }}>Loading your timeline calendar...</p>}
      {error && <p style={{ color: '#D98880', fontWeight: 'bold', fontSize: '15px' }}>{error}</p>}

      {!loading && (
        <div>
          {/* Side-by-Side Horizontal Navigation Tab Bar */}
          <div style={{ display: 'flex', marginBottom: '25px', borderBottom: '1px solid var(--color-border)', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px', boxShadow: '0 8px 20px rgba(148, 129, 201, 0.08)', overflow: 'hidden' }}>
            
            <button 
              onClick={() => setActiveTab('active')} 
              style={{ flex: 1, padding: '16px', background: activeTab === 'active' ? 'var(--color-mint)' : 'transparent', color: activeTab === 'active' ? '#3E6A44' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'active' ? '3px solid #6DBE95' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'active' ? 1 : 0.5 }}
            >
              Active Sessions ({confirmedBookings.length})
            </button>
            
            <button 
              onClick={() => setActiveTab('pending')} 
              style={{ flex: 1, padding: '16px', background: activeTab === 'pending' ? 'var(--color-peach)' : 'transparent', color: activeTab === 'pending' ? '#9B5F63' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'pending' ? '3px solid #E7B2B8' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'pending' ? 1 : 0.5 }}
            >
              Pending Invites ({pendingBookings.length})
            </button>
            
            <button 
              onClick={() => setActiveTab('history')} 
              style={{ flex: 1, padding: '16px', background: activeTab === 'history' ? 'var(--color-lavender)' : 'transparent', color: activeTab === 'history' ? '#655786' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'history' ? '3px solid #C7B1E7' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'history' ? 1 : 0.5 }}
            >
              History Logs ({historyBookings.length})
            </button>

          </div>

          {/* Active View Port Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {activeTab === 'active' && (
              confirmedBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text)', opacity: 0.75, fontStyle: 'italic', textAlign: 'center', padding: '40px', background: 'var(--color-mint)', borderRadius: '12px', border: '1px dashed rgba(107, 163, 144, 0.35)', fontSize: '14px' }}>
                  No active classes confirmed right now.
                </p>
              ) : (
                confirmedBookings.map(renderBookingCard)
              )
            )}

            {activeTab === 'pending' && (
              pendingBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text)', opacity: 0.75, fontStyle: 'italic', textAlign: 'center', padding: '40px', background: 'var(--color-peach)', borderRadius: '12px', border: '1px dashed rgba(217, 180, 178, 0.35)', fontSize: '14px' }}>
                  No pending session proposals awaiting review.
                </p>
              ) : (
                pendingBookings.map(renderBookingCard)
              )
            )}

            {activeTab === 'history' && (
              historyBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text)', opacity: 0.75, fontStyle: 'italic', textAlign: 'center', padding: '40px', background: 'var(--color-lavender)', borderRadius: '12px', border: '1px dashed rgba(171, 149, 211, 0.35)', fontSize: '14px' }}>
                  No historical items logged yet.
                </p>
              ) : (
                historyBookings.map(renderBookingCard)
              )
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;