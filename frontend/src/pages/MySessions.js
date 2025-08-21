import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user sessions...');
      
      const response = await sessionAPI.getUserSessions();
      console.log('User sessions response:', response.data);
      
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load your sessions:', error);
      setError(error.response?.data?.message || 'Failed to load your sessions');
      toast.error(error.response?.data?.message || 'Failed to load your sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchUserSessions();
  };

  if (loading) {
    return (
      <div className="my-sessions">
        <div className="loading">Loading your sessions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-sessions">
        <div className="error-container">
          <h2>Failed to Load Your Sessions</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const draftSessions = sessions.filter(session => session.status === 'draft');
  const publishedSessions = sessions.filter(session => session.status === 'published');

  return (
    <div className="my-sessions">
      <div className="sessions-header">
        <h1>My Sessions</h1>
        <Link to="/session-editor" className="create-button">
          Create New Session
        </Link>
      </div>

      <div className="sessions-section">
        <h2>📝 Draft Sessions ({draftSessions.length})</h2>
        <div className="sessions-grid">
          {draftSessions.length === 0 ? (
            <p>No draft sessions yet.</p>
          ) : (
            draftSessions.map((session) => (
              <div key={session._id} className="session-card draft">
                <h3>{session.title || 'Untitled Session'}</h3>
                <div className="session-tags">
                  {session.tags && session.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="session-date">
                  Last edited: {new Date(session.updated_at).toLocaleDateString()}
                </p>
                <div className="session-actions">
                  <Link
                    to={`/session-editor/${session._id}`}
                    className="edit-button"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/session/${session._id}`}
                    className="view-button"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sessions-section">
        <h2>✅ Published Sessions ({publishedSessions.length})</h2>
        <div className="sessions-grid">
          {publishedSessions.length === 0 ? (
            <p>No published sessions yet.</p>
          ) : (
            publishedSessions.map((session) => (
              <div key={session._id} className="session-card published">
                <h3>{session.title}</h3>
                <div className="session-tags">
                  {session.tags && session.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="session-date">
                  Published: {new Date(session.created_at).toLocaleDateString()}
                </p>
                <div className="session-actions">
                  <Link
                    to={`/session-editor/${session._id}`}
                    className="edit-button"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/session/${session._id}`}
                    className="view-button"
                  >
                    View Session
                  </Link>
                  {session.json_file_url && (
                    <a
                      href={session.json_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-button"
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
    </div>
  );
};

export default MySessions;
