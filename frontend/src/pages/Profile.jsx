import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { updateMyProfileAPI, getUserProfileAPI } from '../api/user.api.js';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Plus, Trash2, Save, MapPin, BookOpen, Lightbulb } from 'lucide-react';


function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');

  // Skills Offered state
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  // Skills Wanted state
  const [skillsWanted, setSkillsWanted] = useState(user?.skillsWanted || []);
  const [newWantedSkill, setNewWantedSkill] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch latest profile from server
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        if (!user?._id) return;
        const full = await getUserProfileAPI(user._id);
        if (!mounted) return;
        setBio(full.bio || '');
        setLocation(full.location || '');
        setSkillsOffered(full.skillsOffered || []);
        setSkillsWanted(full.skillsWanted || []);
      } catch (err) {
        // silently ignore - keep current state
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, [user]);

  // --- Skills Offered handlers ---
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skillsOffered.some(s => s.skill.toLowerCase() === newSkill.trim().toLowerCase())) {
      setError('You already added this skill!');
      return;
    }
    setSkillsOffered([...skillsOffered, { skill: newSkill.trim(), level: skillLevel }]);
    setNewSkill('');
    setError('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkillsOffered(skillsOffered.filter(s => s.skill !== skillName));
  };

  // --- Skills Wanted handlers ---
  const handleAddWantedSkill = (e) => {
    e.preventDefault();
    if (!newWantedSkill.trim()) return;
    if (skillsWanted.some(s => s.toLowerCase() === newWantedSkill.trim().toLowerCase())) {
      setError('You already added this skill to your wishlist!');
      return;
    }
    setSkillsWanted([...skillsWanted, newWantedSkill.trim()]);
    setNewWantedSkill('');
    setError('');
  };

  const handleRemoveWantedSkill = (skill) => {
    setSkillsWanted(skillsWanted.filter(s => s !== skill));
  };

  // Submit everything to the database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const updatedData = await updateMyProfileAPI({
        bio,
        location,
        skillsOffered,
        skillsWanted,
      });

      // Update localStorage session token data to keep UI synced
      const sessionData = JSON.parse(localStorage.getItem('userInfo'));
      const updatedSession = { ...sessionData, ...updatedData };
      localStorage.setItem('userInfo', JSON.stringify(updatedSession));

      setMessage('Profile updated successfully! 🚀');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile changes.');
    }
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  };

  const badgeStyle = {
    background: 'var(--color-surface-soft)',
    color: 'var(--color-text)',
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{ padding: '40px', maxWidth: '640px', margin: '0 auto', fontFamily: 'sans-serif', background: 'var(--color-background)', minHeight: '100vh' }}>
      <h2 style={{ color: 'var(--color-text)', marginBottom: '6px' }}>Edit Your Profile</h2>
      <p style={{ color: 'var(--color-text)', opacity: 0.6, fontSize: '14px', marginBottom: '24px' }}>
        Set what you teach, what you want to learn, and let the AI find your ideal swap partners.
      </p>

      {message && <p style={{ color: '#34D399', background: 'rgba(52,211,153,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{message}</p>}
      {error && <p style={{ color: '#FB7185', background: 'rgba(251,113,133,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>{error}</p>}

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--color-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>

        {/* Bio */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Bio / Headline:</strong>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell potential partners about your engineering, development, or creative specialties..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </label>

        {/* Location */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Location:</strong>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Jaipur, IN"
            style={inputStyle}
          />
        </label>

        <hr style={{ border: '0', borderTop: '1px solid var(--color-border)' }} />

        {/* Skills You Can Teach */}
        <div>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <BookOpen size={16} style={{ color: '#34D399' }} /> Skills You Can Teach (Offers):
          </strong>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g., React, Python, CAD"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{ ...inputStyle, flex: 2, minWidth: '120px' }}
            />
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: '100px' }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
            <button onClick={handleAddSkill} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {skillsOffered.map((s, index) => (
              <span key={index} style={{ ...badgeStyle, border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.1)' }}>
                {s.skill} <span style={{ opacity: 0.6, fontSize: '12px' }}>({s.level})</span>
                <button type="button" onClick={() => handleRemoveSkill(s.skill)} style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
              </span>
            ))}
            {skillsOffered.length === 0 && <p style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic' }}>No skills offered yet.</p>}
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid var(--color-border)' }} />

        {/* Skills You Want to Learn */}
        <div>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Lightbulb size={16} style={{ color: '#818CF8' }} /> Skills You Want to Learn (Wishlist):
          </strong>
          <p style={{ fontSize: '13px', opacity: 0.55, margin: '0 0 12px 0' }}>
            This powers the <strong>Auto-Match</strong> engine — the system finds people who teach exactly what you want! ✨
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="e.g., Figma, Guitar, SQL"
              value={newWantedSkill}
              onChange={(e) => setNewWantedSkill(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleAddWantedSkill} style={{ padding: '8px 16px', background: '#818CF8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {skillsWanted.map((skill, index) => (
              <span key={index} style={{ ...badgeStyle, border: '1px solid rgba(129,140,248,0.25)', background: 'rgba(129,140,248,0.1)' }}>
                {skill}
                <button type="button" onClick={() => handleRemoveWantedSkill(skill)} style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
              </span>
            ))}
            {skillsWanted.length === 0 && <p style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic' }}>No wishlist skills added yet.</p>}
          </div>
        </div>

        <button type="submit" style={{ padding: '14px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={20} /> Save Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;