import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

function Whiteboard({ bookingId }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#185FA5'); 
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join-classroom', bookingId);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Handle high-res drawing lines configuration
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Receive drawing events from peer
    socketRef.current.on('drawing-receive', (data) => {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
    });

    // Receive clear action from peer
    socketRef.current.on('clear-canvas-receive', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [bookingId]);

  const drawLine = (x0, y0, x1, y1, strokeColor, emit = true) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.closePath();

    if (emit) {
      socketRef.current.emit('drawing', { bookingId, x0, y0, x1, y1, color: strokeColor });
    }
  };

  // Helper to accurately get pointer coordinates relative to the canvas bounding box
  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    lastPos.current = pos;
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y, color);
    lastPos.current = pos;
  };

  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current.emit('clear-canvas', bookingId);
  };

  return (
    <div style={{ background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #ddd)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* Control Menu Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '15px', fontWeight: 'bold' }}>
          Interactive Shared Whiteboard 🎨
        </h4>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Color Selectors */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#185FA5', '#4A7A64', '#D98880', '#333333'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: color === c ? '2px solid var(--color-text)' : '1px solid #ccc', cursor: 'pointer', transform: color === c ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.1s' }}
              />
            ))}
          </div>
          {/* Clear Trigger Button */}
          <button onClick={handleClear} style={{ padding: '5px 12px', background: '#transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Clear Board
          </button>
        </div>
      </div>

      {/* Drawing Pad Canvas View */}
      <canvas
        ref={canvasRef}
        width={650}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '8px', cursor: 'crosshair', width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  );
}

export default Whiteboard;