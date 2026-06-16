import React, { useState } from 'react';
import { searchUsersBySkillAPI } from '../api/user.api.js';
import BookingPanel from '../components/BookingPanel.jsx';
import { Star, MapPin, Eye, EyeOff } from 'lucide-react';

// Separate item component to cleanly manage individual card expanded toggle states
function ProfileCard({ profile, searchQuery }) {
  const [showReviewsList, setShowReviewsList] = useState(false);

  return (
    <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-card)', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{profile.name}</h3>
        {profile.location && <span style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {profile.location}</span>}
      </div>
      
      {/* Dynamic Star Ratings & Reviews Accordion Link */}
      <div style={{ margin: '-5px 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
        {profile.reviewCount > 0 ? (
          <>
            <span style={{ color: '#ffc107', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={16} /> {Number(profile.averageRating || 0).toFixed(1)} 
            </span>
            <button
              type="button"
              onClick={() => setShowReviewsList(!showReviewsList)}
              title={showReviewsList ? "Hide Reviews" : "Show Reviews"}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: '4px 8px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {showReviewsList ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </>
        ) : (
          <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: '13px' }}>New Partner (No reviews yet)</span>
        )}
      </div>

      {/* Biography */}
      <p style={{ fontSize: '15px', color: '#444', margin: '8px 0' }}>{profile.bio || "No biography provided."}</p>
      
      {/* Render Offered Skills Tags */}
      <div style={{ marginTop: '12px', marginBottom: '15px' }}>
        <strong>Offers:</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {profile.skillsOffered?.length > 0 ? (
            profile.skillsOffered.map((s, idx) => (
              <span key={idx} style={{ background: '#E6F1FB', color: '#0C447C', padding: '4px 10px', borderRadius: '99px', fontSize: '13px', fontWeight: '500' }}>
                {s.skill} • <em style={{ fontSize: '11px' }}>{s.level}</em>
              </span>
            ))
          ) : (
            <span style={{ color: '#888', fontSize: '13px' }}>No skills explicitly listed.</span>
          )}
        </div>
      </div>

      {/* Collapsible History Feed Container */}
      {showReviewsList && profile.receivedReviewsData?.length > 0 && (
        <div style={{ margin: '15px 0', padding: '15px', background: '#f9f9f9', borderRadius: '6px', borderLeft: '4px solid #185FA5', textAlign: 'left' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Peer Feedback history:</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profile.receivedReviewsData.map((rev, rIdx) => (
              <div key={rIdx} style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                <span style={{ color: '#ffc107', marginRight: '5px' }}>
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </span>
                <span style={{ color: '#555', fontStyle: 'italic' }}>"{rev.comment}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Scheduling UI Element Form */}
      <BookingPanel 
        teacherId={profile._id}
        swapRequestId={profile._id} 
        skillTitle={searchQuery || "Skill Transfer"} 
      />
      
    </div>
  );
}

function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await searchUsersBySkillAPI(searchQuery);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching skills profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', background:'var(--color-background)' }}>
      <h2>Browse Skill Partners 🔍</h2>
      <p style={{ color: 'var(--color-muted)' }}>Find users who are teaching what you want to learn.</p>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', margin: '20px 0 30px' }}>
        <input
          type="text"
          placeholder="Search skills (e.g., Python, React, Guitar)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Searching database profiles...</p>}

      {/* Profile Search Results Layout Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!loading && results.length === 0 && searchQuery && (
          <p style={{ textAlign: 'center', color: '#888' }}>No users found offering "{searchQuery}" yet.</p>
        )}

        {results.map((profile) => (
          <ProfileCard 
            key={profile._id} 
            profile={profile} 
            searchQuery={searchQuery} 
          />
        ))}
      </div>
    </div>
  );
}

export default Browse;