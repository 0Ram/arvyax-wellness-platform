import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MySessions from './pages/MySessions';
import SessionEditor from './pages/SessionEditor';
import SessionViewer from './pages/SessionViewer'; // Add this import
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/session/:sessionId" element={<SessionViewer />} /> {/* Add this route */}
              <Route
                path="/my-sessions"
                element={
                  <ProtectedRoute>
                    <MySessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session-editor"
                element={
                  <ProtectedRoute>
                    <SessionEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session-editor/:id"
                element={
                  <ProtectedRoute>
                    <SessionEditor />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
