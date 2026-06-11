import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { updateMyProfileAPI } from '../api/user.api.js';
import { useNavigate } from 'react-router-dom';


function Profile() {
  const { user, login } = useAuth(); // We can use login context to refresh user data in localStorage
  const navigate = useNavigate();

  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  
  // State for skills arrays
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  
  // Form input states for a single skill item
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Append a skill to the local state array
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    // Prevent duplicate entries
    if (skillsOffered.some(s => s.skill.toLowerCase() === newSkill.trim().toLowerCase())) {
      setError('You already added this skill!');
      return;
    }

    setSkillsOffered([...skillsOffered, { skill: newSkill.trim(), level: skillLevel }]);
    setNewSkill('');
    setError('');
  };

  // Remove a skill from the local state array
  const handleRemoveSkill = (skillName) => {
    setSkillsOffered(skillsOffered.filter(s => s.skill !== skillName));
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
        skillsOffered
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

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', background: 'var(--color-background)' }}>
      <h2>Edit Your Profile 🛠️</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--color-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Bio / Headline:</strong>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Tell potential partners about your engineering, development, or creative specialties..."
            style={{ padding: '10px', height: '8px', minHeight: '80px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Location:</strong>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder="e.g., Jaipur, IN"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

        {/* Add Skills Sub-Form */}
        <div>
          <strong>Skills You Can Teach (Offers):</strong>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="e.g., React, Python, CAD" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select 
              value={skillLevel} 
              onChange={(e) => setSkillLevel(e.target.value)}
              style={{ flex: 1, padding: '8px', background: '#fff', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
            <button onClick={handleAddSkill} style={{ padding: '8px 16px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Add
            </button>
          </div>

          {/* Render Active Added Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {skillsOffered.map((s, index) => (
              <span key={index} style={{ background: 'var(--color-surface-soft)', color: 'var(--color-text)', padding: '6px 12px', borderRadius: '99px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {s.skill} ({s.level})
                <button type="button" onClick={() => handleRemoveSkill(s.skill)} style={{ background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" style={{ padding: '12px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>
          Save & Save Profile Details
        </button>
      </form>
    </div>
  );
}

export default Profile;