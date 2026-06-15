import React, { useState, useRef, useEffect } from 'react'; 
import { useParams, useLocation, Link } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../hooks/useAuth.jsx';
import CodeWorkspace from '../components/CodeWorkspace.jsx';
import Whiteboard from '../components/Whiteboard.jsx';

function VideoRoom() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const { skillTitle } = location.state || { skillTitle: 'Skill Swap Session' };
  const roomName = `SkillSwap_Room_${bookingId}`;
  const jitsiContainerRef = useRef(null);

  const [workspaceMode, setWorkspaceMode] = useState('code');
  const [isJitsiReady, setIsJitsiReady] = useState(false);

  useEffect(() => {
    // Ensure Jitsi API is loaded before rendering
    if (window.JitsiMeetExternalAPI) {
      setIsJitsiReady(true);
    }
  }, []);

  const handleJitsiIframeRef = (iframeRef) => {
    if (iframeRef) {
      iframeRef.style.height = '100%';
      iframeRef.style.width = '100%';
      iframeRef.style.display = 'block';
    }
  };

  const handleJitsiReady = () => {
    console.log('✅ Jitsi Meeting initialized successfully');
    setIsJitsiReady(true);
  };

  const handleJitsiError = (error) => {
    console.error('❌ Jitsi Meeting error:', error);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'sans-serif', background: 'var(--color-background)', minHeight: '100vh' }}>
      
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '22px', fontWeight: 'bold' }}>
            Live Classroom: {skillTitle} 🎥
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text)', opacity: 0.6, fontSize: '14px' }}>
            Work together on the code board or whiteboard in real-time while communicating.
          </p>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '14px' }}>
          ← Return to Dashboard
        </Link>
      </div>

      
      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Left Column: Jitsi Video Conference */}
        <div 
          ref={jitsiContainerRef}
          style={{ 
            flex: '1 1 500px', 
            height: '560px', 
            border: '1px solid var(--color-border)', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            background: '#000'
          }}
        >
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableThirdPartyRequests: false,
              enableWelcomePage: true,
              prejoinPageEnabled: true,
              remoteVideoMenu: {
                disableKick: false,
              },
            }}
            interfaceConfigOverwrite={{
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'hangup', 'chat', 'raisehand', 'videoquality', 'filmstrip'
              ],
              SHOW_JITSI_WATERMARK: false,
              MOBILE_APP_PROMO: false,
            }}
            userInfo={{
              displayName: user?.name || 'SkillSwap Peer',
              email: user?.email || 'unknown@skillswap.local'
            }}
            onApiReady={(externalAPI) => {
              console.log('✅ Jitsi API ready');
              handleJitsiReady();
            }}
            onReadyToClose={() => {
              console.log('Jitsi meeting closed');
            }}
            getIFrameRef={handleJitsiIframeRef}
          />
        </div>

        {/* Right Column: Tabbed Workspace Utility Controller Panels */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Workspace Sub-Navigation Menu Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => setWorkspaceMode('code')}
              style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: workspaceMode === 'code' ? '3px solid #4A7A64' : '3px solid transparent', color: workspaceMode === 'code' ? '#4A7A64' : 'var(--color-text)', fontWeight: 'bold', cursor: 'pointer', opacity: workspaceMode === 'code' ? 1 : 0.6, transition: 'all 0.15s' }}
            >
              💻 Shared Editor
            </button>
            <button 
              onClick={() => setWorkspaceMode('whiteboard')}
              style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: workspaceMode === 'whiteboard' ? '3px solid #185FA5' : '3px solid transparent', color: workspaceMode === 'whiteboard' ? '#185FA5' : 'var(--color-text)', fontWeight: 'bold', cursor: 'pointer', opacity: workspaceMode === 'whiteboard' ? 1 : 0.6, transition: 'all 0.15s' }}
            >
              🎨 Active Whiteboard
            </button>
          </div>

          {/* Active Tool Target Viewport Layer */}
          <div>
            {workspaceMode === 'code' ? (
              <CodeWorkspace bookingId={bookingId} />
            ) : (
              <Whiteboard bookingId={bookingId} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default VideoRoom;