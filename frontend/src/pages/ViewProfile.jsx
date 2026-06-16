import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getUserProfileAPI } from '../api/user.api.js';
import { Link } from 'react-router-dom';
import { Edit2, ArrowLeft, MapPin, BookOpen, Lightbulb } from 'lucide-react';

function ViewProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!user?._id) return setLoading(false);
        const data = await getUserProfileAPI(user._id);
        if (!mounted) return;
        setProfile(data);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <p style={{ padding: '24px' }}>Loading profile...</p>;
  if (!profile) return <p style={{ padding: '24px' }}>Profile not available.</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-text)', opacity: 0.8 }}>{profile.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/profile" style={{ padding: '8px 14px', background: 'var(--color-accent)', color: '#fff', textDecoration: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Edit2 size={16} /> Edit Profile</Link>
          <Link to="/dashboard" style={{ padding: '8px 14px', background: 'var(--color-card)', color: 'var(--color-text)', textDecoration: 'none', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={16} /> Back</Link>
        </div>
      </div>

      <div style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <h4 style={{ marginTop: 0 }}>Bio</h4>
        <p style={{ marginTop: 6 }}>{profile.bio || '—'}</p>

        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} /> Location</h4>
        <p style={{ marginTop: 6 }}>{profile.location || '—'}</p>

        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={18} /> Skills Offered</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {(profile.skillsOffered || []).length ? (
            profile.skillsOffered.map((s, i) => (
              <span key={i} style={{ background: 'var(--color-surface-soft)', padding: '6px 10px', borderRadius: '999px' }}>{s.skill} ({s.level})</span>
            ))
          ) : (
            <span style={{ color: 'var(--color-text)', opacity: 0.6 }}>No skills added yet</span>
          )}
        </div>

        <h4 style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={18} /> Skills Wanted</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {(profile.skillsWanted || []).length ? (
            profile.skillsWanted.map((s, i) => (
              <span key={i} style={{ background: 'var(--color-surface-soft)', padding: '6px 10px', borderRadius: '999px' }}>{s}</span>
            ))
          ) : (
            <span style={{ color: 'var(--color-text)', opacity: 0.6 }}>No wants listed</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
