import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import API from '../api/axios.js';
import { getMyBookingsAPI, updateBookingStatusAPI } from '../api/booking.api.js';
import { getMatchesAPI } from '../api/user.api.js';
import ReviewForm from '../components/ReviewForm.jsx';
import { Phone, MessageCircle, CheckCircle, Star, LogOut, User, Search, Calendar, Zap, Sparkles, MapPin, ArrowRight } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // Auto-matching state
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

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

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const data = await getMatchesAPI();
      setMatches(data);
    } catch (err) {
      // silently fail — user may not have skillsWanted set yet
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchMatches();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const updatedBooking = await updateBookingStatusAPI(bookingId, newStatus);
      alert(updatedBooking.calendarSyncWarning || `Session ${newStatus}!`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const renderBookingCard = (b) => {
    const isTeacher = b.teacher && b.teacher._id === user._id;
    const counterpart = isTeacher ? b.learner : b.teacher;
    const counterpartName = counterpart ? counterpart.name : 'Deleted User';
    const counterpartEmail = counterpart ? counterpart.email : '';
    const dateString = new Date(b.sessionDate).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    const handleGoogleConnect = async () => {
      try {
        const response = await API.get('/auth/google/connect');
        const { url } = response.data;
        const popup = window.open(url, 'Google OAuth', 'width=600,height=700,left=200,top=100');
        const handleMessage = (event) => {
          if (event.data === 'google-calendar-connected') {
            alert('Google Calendar synchronized successfully! 🎉');
            popup.close();
            fetchBookings();
            window.removeEventListener('message', handleMessage);
          }
        };
        window.addEventListener('message', handleMessage);
      } catch (err) {
        alert('Failed to launch calendar configuration module.');
      }
    };

    let badgeBg = 'rgba(156, 163, 175, 0.15)';
    let badgeText = '#9CA3AF';
    if (b.status === 'confirmed') { badgeBg = 'var(--color-mint)'; badgeText = '#34D399'; }
    if (b.status === 'pending') { badgeBg = 'var(--color-peach)'; badgeText = '#FB7185'; }
    if (b.status === 'completed') { badgeBg = 'var(--color-lavender)'; badgeText = '#818CF8'; }

    return (
      <div key={b._id} style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '16px', background: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ background: badgeBg, color: badgeText, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
              {b.status}
            </span>
            <h4 style={{ margin: '12px 0 6px 0', color: 'var(--color-text)', fontSize: '16px', fontWeight: 'bold' }}>
              {b.skillTitle}
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--color-text)', opacity: 0.8, lineHeight: '1.4' }}>
              <strong style={{ fontWeight: 'bold' }}>{isTeacher ? 'Teaching:' : 'Learning from:'}</strong> {counterpartName} {counterpartEmail && <span style={{ fontSize: '12px', opacity: 0.6 }}>({counterpartEmail})</span>}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--color-text)', opacity: 0.55 }}>
              📅 {dateString} | ⏰ {b.timeSlot}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {b.status === 'confirmed' && counterpart && (
              <Link to={`/room/${b._id}`} state={{ skillTitle: b.skillTitle }} title="Join Call" style={{ padding: '8px 12px', background: '#6BCB7A', color: 'white', textDecoration: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(107,203,122,0.25)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <Phone size={18} />
              </Link>
            )}

            {counterpart && (
              <Link to="/chat" state={{ partnerId: counterpart._id, partnerName: counterpart.name }} title="Message" style={{ padding: '8px 12px', background: '#706CFF', color: 'white', textDecoration: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(112,108,255,0.18)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <MessageCircle size={18} />
              </Link>
            )}

            {b.status === 'pending' && isTeacher && counterpart && (
              <button onClick={() => handleStatusChange(b._id, 'confirmed')} title="Accept" style={{ padding: '8px 12px', background: '#4EC2AE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(78,194,174,0.24)', transition: 'transform 0.2s' }}>
                <CheckCircle size={18} />
              </button>
            )}

            {b.status === 'confirmed' && isTeacher && counterpart && (
              <button onClick={() => handleStatusChange(b._id, 'completed')} title="Complete" style={{ padding: '8px 12px', background: '#5A9DFF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(90,157,255,0.24)', transition: 'transform 0.2s' }}>
                <CheckCircle size={18} />
              </button>
            )}

            {b.status === 'completed' && counterpart && !b.hasReview && activeReviewBookingId !== b._id && (
              <button onClick={() => setActiveReviewBookingId(b._id)} title="Leave Review" style={{ padding: '8px 12px', background: '#A974FF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(169,116,255,0.22)', transition: 'transform 0.2s' }}>
                <Star size={18} />
              </button>
            )}

            {b.status !== 'cancelled' && b.status !== 'completed' && counterpart && (
              <button onClick={() => handleStatusChange(b._id, 'cancelled')} title="Cancel" style={{ padding: '8px 12px', background: '#FF7C7C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(255,124,124,0.24)', transition: 'transform 0.2s' }}>
                ✕
              </button>
            )}

            {isTeacher && b.status !== 'completed' && b.status !== 'cancelled' && (
              <button
                onClick={handleGoogleConnect}
                title="Connect Google Calendar"
                style={{ padding: '8px 12px', background: '#b8c75b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(184,199,91,0.24)', transition: 'transform 0.2s' }}
              >
                <Calendar size={18} />
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

  // --- Match Card renderer ---
  const renderMatchCard = (match) => {
    const isMutual = match.mutualMatches && match.mutualMatches.length > 0;
    return (
      <div
        key={match._id}
        style={{
          padding: '20px',
          border: `1px solid ${isMutual ? 'rgba(129,140,248,0.4)' : 'var(--color-border)'}`,
          borderRadius: '16px',
          background: isMutual
            ? 'linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(168,85,247,0.06) 100%)'
            : 'var(--color-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: isMutual ? '0 8px 24px rgba(129,140,248,0.18)' : '0 4px 14px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Mutual match glow badge */}
        {isMutual && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            background: 'linear-gradient(135deg, #818CF8, #A855F7)',
            color: 'white', fontSize: '11px', fontWeight: 'bold',
            padding: '4px 12px', borderBottomLeftRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '4px',
            letterSpacing: '0.3px',
          }}>
            <Zap size={12} /> MUTUAL MATCH
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Avatar placeholder with initials */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #818CF8, #34D399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '16px', flexShrink: 0,
              }}>
                {match.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-text)', fontWeight: 'bold', fontSize: '16px' }}>
                  {match.name}
                </h4>
                {match.location && (
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.55, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {match.location}
                  </p>
                )}
              </div>
            </div>

            {match.bio && (
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: 'var(--color-text)', opacity: 0.7, lineHeight: '1.5', maxWidth: '420px' }}>
                {match.bio.length > 100 ? match.bio.substring(0, 100) + '…' : match.bio}
              </p>
            )}
          </div>

          {/* Rating */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, color: '#FBBF24', fontWeight: 'bold', fontSize: '18px' }}>
              ⭐ {match.averageRating > 0 ? match.averageRating.toFixed(1) : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.5 }}>{match.reviewCount} reviews</p>
          </div>
        </div>

        {/* Skill Match Pills */}
        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 'bold', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            They can teach you:
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {match.matchingSkills.map((skill, i) => (
              <span key={i} style={{
                background: 'rgba(52,211,153,0.15)', color: '#34D399',
                padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                border: '1px solid rgba(52,211,153,0.25)',
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {isMutual && (
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 'bold', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              They want to learn from you:
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {match.mutualMatches.map((skill, i) => (
                <span key={i} style={{
                  background: 'rgba(129,140,248,0.15)', color: '#818CF8',
                  padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                  border: '1px solid rgba(129,140,248,0.25)',
                }}>
                  ↔ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <Link
            to={`/users/${match._id}`}
            style={{
              flex: 1, padding: '10px', background: 'var(--color-accent)', color: 'white',
              textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold',
              fontSize: '13px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
            }}
          >
            View Profile <ArrowRight size={14} />
          </Link>
          <Link
            to="/chat"
            state={{ partnerId: match._id, partnerName: match.name }}
            style={{
              flex: 1, padding: '10px', background: 'rgba(112,108,255,0.15)', color: '#706CFF',
              textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold',
              fontSize: '13px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              border: '1px solid rgba(112,108,255,0.3)',
            }}
          >
            <MessageCircle size={14} /> Message
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '920px', margin: '0 auto', fontFamily: 'sans-serif', background: 'var(--color-background)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '20px', gap: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--color-text)', letterSpacing: '-0.5px', margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: 'var(--color-text)', opacity: 0.7, margin: '5px 0 0 0', fontSize: '14px' }}>
            Manage your skill swaps and upcoming lessons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Link to="/browse" title="Browse Skills" style={{ padding: '8px 14px', background: 'var(--color-accent)', color: 'white', textDecoration: 'none', borderRadius: '6px', border: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Search size={16} /> Browse
          </Link>
          <Link to="/profile/view" title="View Profile" style={{ padding: '8px 12px', background: 'var(--color-card)', color: 'var(--color-text)', textDecoration: 'none', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </Link>
          <button onClick={logout} title="Logout" style={{ padding: '8px 12px', background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={20} />
          </button>
        </div>
      </div>



      {/* ─── AUTO-MATCH RECOMMENDATION ENGINE ─── */}
      <div style={{ marginBottom: '45px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: '#818CF8' }} /> Your Recommended Matches
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text)', opacity: 0.55 }}>
              Based on your skills wishlist — ranked by compatibility score.
            </p>
          </div>
          <Link
            to="/profile"
            style={{ padding: '8px 14px', background: 'rgba(129,140,248,0.12)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.3)', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Edit Wishlist
          </Link>
        </div>

        {matchesLoading ? (
          <p style={{ color: 'var(--color-text)', opacity: 0.6, fontStyle: 'italic', fontSize: '14px' }}>Finding your ideal partners…</p>
        ) : matches.length === 0 ? (
          <div style={{ padding: '32px', background: 'var(--color-card)', borderRadius: '16px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <Sparkles size={36} style={{ color: '#818CF8', opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ color: 'var(--color-text)', opacity: 0.65, fontSize: '14px', margin: 0 }}>
              No matches found yet. <Link to="/profile" style={{ color: '#818CF8', textDecoration: 'none', fontWeight: 'bold' }}>Add skills you want to learn</Link> in your profile to activate the recommendation engine!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
            {matches.map(renderMatchCard)}
          </div>
        )}
      </div>

      {/* ─── SESSIONS ─── */}
      <h3 style={{ color: 'var(--color-text)', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        Your Scheduled Sessions 🗓️
      </h3>

      {loading && <p style={{ color: 'var(--color-text)', opacity: 0.7, fontSize: '15px' }}>Loading your timeline calendar...</p>}
      {error && <p style={{ color: '#D98880', fontWeight: 'bold', fontSize: '15px' }}>{error}</p>}

      {!loading && (
        <div>
          {/* Tab Bar */}
          <div style={{ display: 'flex', marginBottom: '25px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-background-soft)', borderRadius: '16px', overflow: 'hidden' }}>

            <button
              onClick={() => setActiveTab('active')}
              style={{ flex: 1, padding: '16px', background: activeTab === 'active' ? 'var(--color-mint)' : 'transparent', color: activeTab === 'active' ? '#34D399' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'active' ? '3px solid #34D399' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'active' ? 1 : 0.5 }}
            >
              Active Sessions ({confirmedBookings.length})
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              style={{ flex: 1, padding: '16px', background: activeTab === 'pending' ? 'var(--color-peach)' : 'transparent', color: activeTab === 'pending' ? '#FB7185' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'pending' ? '3px solid #FB7185' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'pending' ? 1 : 0.5 }}
            >
              Pending Invites ({pendingBookings.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              style={{ flex: 1, padding: '16px', background: activeTab === 'history' ? 'var(--color-lavender)' : 'transparent', color: activeTab === 'history' ? '#818CF8' : 'var(--color-text)', border: 'none', borderBottom: activeTab === 'history' ? '3px solid #818CF8' : '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease-in-out', opacity: activeTab === 'history' ? 1 : 0.5 }}
            >
              History Logs ({historyBookings.length})
            </button>

          </div>

          {/* Active Tab Viewport */}
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
