import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../hooks/useAuth.jsx';

function VideoRoom() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  //grab the skill title
  const { skillTitle } = location.state || { skillTitle: 'Skill Swap Session' };

//unique room id
  const roomName = `SkillSwap_Room_${bookingId}`;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Live Classroom: {skillTitle} 🎥</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Make sure your camera and microphone permissions are allowed.</p>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#185FA5', fontWeight: 'bold' }}>
          ← Return to Dashboard
        </Link>
      </div>
      <div style={{ height: '600px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
            prejoinPageEnabled: false, // Bypasses extra setup prompts for instant loading
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'factions', 'hangup', 'chat', 'raisehand', 'videoquality', 'filmstrip'
            ],
          }}
          userInfo={{
            displayName: user?.name || 'SkillSwap Peer',
            email: user?.email
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </div>
  );
}

export default VideoRoom;