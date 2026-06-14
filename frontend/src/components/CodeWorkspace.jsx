import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

function CodeWorkspace({ bookingId }) {
  const [code, setCode] = useState('// Welcome to your shared SkillSwap classroom workspace!\n// Type your code here...');
  const [language, setLanguage] = useState('javascript');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join-classroom', bookingId);

    socketRef.current.on('code-receive', (data) => {
      if (data.code !== undefined) setCode(data.code);
      if (data.language !== undefined) setLanguage(data.language);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [bookingId]);

  // Handle local typing updates and broadcast them out
  const handleEditorChange = (value) => {
    setCode(value);
    socketRef.current.emit('code-changed', {
      bookingId,
      code: value,
      language
    });
  };

  // Handle local language adjustments and broadcast them out
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    socketRef.current.emit('code-changed', {
      bookingId,
      code,
      language: selectedLang
    });
  };

  return (
    <div style={{ background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #ddd)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
      
     
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '15px', fontWeight: 'bold' }}>
          Shared Code Sandbox 💻
        </h4>
        <div>
          <label style={{ fontSize: '13px', marginRight: '8px', color: 'var(--color-text)', opacity: 0.7 }}>Language:</label>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border, #ccc)', background: 'var(--color-background, #fff)', color: 'var(--color-text)', fontWeight: '500', cursor: 'pointer' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
      </div>

      {/* Embedded Monaco Editor Container */}
      <div style={{ height: '450px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border, #eee)' }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark" 
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false }, // Hides the busy side map to maximize screen real estate
            automaticLayout: true,
            scrollbar: { vertical: 'visible', horizontal: 'visible' }
          }}
        />
      </div>
    </div>
  );
}

export default CodeWorkspace;