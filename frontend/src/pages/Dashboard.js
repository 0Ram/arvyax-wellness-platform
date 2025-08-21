import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicSessions();
  }, []);

  const fetchPublicSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sessionAPI.getPublicSessions();
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError(error.response?.data?.message || 'Failed to load sessions');
      toast.error(error.response?.data?.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>Failed to Load Sessions</h2>
          <p>{error}</p>
          <button onClick={fetchPublicSessions} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>🧘 Wellness Sessions</h1>
      <p>Discover published wellness sessions from our community</p>
      
      <div className="sessions-grid">
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <h3>No Published Sessions Yet</h3>
            <p>Be the first to create and publish a wellness session!</p>
            <Link to="/session-editor" className="create-first-button">
              Create First Session
            </Link>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="session-card">
              <h3>{session.title}</h3>
              <div className="session-tags">
                {session.tags && session.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <p className="session-author">
                By: {session.user_id?.email || 'Anonymous'}
              </p>
              <p className="session-date">
                Created: {new Date(session.createdAt).toLocaleDateString()}
              </p>
              <div className="session-actions">
                <Link
                  to={`/session/${session._id}`}
                  className="session-link"
                >
                  View Session
                </Link>
                {session.json_file_url && (
                  <a
                    href={session.json_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="session-file-link"
                  >
                    View JSON
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
