import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Browse from './pages/Browse.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import Profile from './pages/Profile.jsx';
import ViewProfile from './pages/ViewProfile.jsx';
import Chat from './pages/Chat.jsx';
import VideoRoom from './pages/VideoRoom.jsx';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes: If user is logged in, redirect them away from Auth pages to Dashboard */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Protected Route: If user is NOT logged in, redirect them to Login */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
        />

       {/* catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />

        <Route path="/browse" element={user ? <Browse /> : <Navigate to="/login" replace />} />

        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/profile/view" element={user ? <ViewProfile /> : <Navigate to="/login" replace />} />

        <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" replace />} />

        <Route path="/room/:bookingId" element={user ? <VideoRoom /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;