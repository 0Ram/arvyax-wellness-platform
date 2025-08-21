import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';
import './SessionJsonViewer.css';

const SessionJsonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [jsonContent, setJsonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionAndContent = async () => {
      try {
        setLoading(true);
        
        // First fetch session details
        const sessionResponse = await sessionAPI.getUserSession(id);
        const sessionData = sessionResponse.data;
        setSession(sessionData);

        // Then fetch JSON content if URL exists
        if (sessionData.json_file_url) {
          const jsonResponse = await fetch(sessionData.json_file_url);
          if (!jsonResponse.ok) {
            throw new Error(`Failed to fetch JSON: ${jsonResponse.status}`);
          }
          const content = await jsonResponse.json();
          setJsonContent(content);
        } else {
          setError('No JSON file URL available for this session');
        }
      } catch (err) {
        console.error('Error fetching session content:', err);
        setError(err.message || 'Failed to load session content');
        toast.error('Failed to load session content');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSessionAndContent();
    }
  }, [id]);

  const renderJsonContent = (obj, level = 0) => {
    if (obj === null || obj === undefined) {
      return <span className="json-null">null</span>;
    }

    if (typeof obj === 'string') {
      return <span className="json-string">"{obj}"</span>;
    }

    if (typeof obj === 'number') {
      return <span className="json-number">{obj}</span>;
    }

    if (typeof obj === 'boolean') {
      return <span className="json-boolean">{obj.toString()}</span>;
    }

    if (Array.isArray(obj)) {
      return (
        <div className="json-array">
          <span className="json-bracket">[</span>
          {obj.map((item, index) => (
            <div key={index} className="json-array-item" style={{ marginLeft: `${(level + 1) * 20}px` }}>
              {renderJsonContent(item, level + 1)}
              {index < obj.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
          <span className="json-bracket">]</span>
        </div>
      );
    }

    if (typeof obj === 'object') {
      return (
        <div className="json-object">
          <span className="json-bracket">{'{'}</span>
          {Object.entries(obj).map(([key, value], index, entries) => (
            <div key={key} className="json-object-item" style={{ marginLeft: `${(level + 1) * 20}px` }}>
              <span className="json-key">"{key}"</span>
              <span className="json-colon">: </span>
              {renderJsonContent(value, level + 1)}
              {index < entries.length - 1 && <span className="json-comma">,</span>}
            </div>
          ))}
          <span className="json-bracket">{'}'}</span>
        </div>
      );
    }

    return <span>{String(obj)}</span>;
  };

  if (loading) {
    return (
      <div className="json-viewer-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading session content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="json-viewer-container">
        <div className="error-container">
          <h2>⚠️ Error Loading Content</h2>
          <p>{error}</p>
          <div className="action-buttons">
            <button onClick={() => navigate(-1)} className="back-button">
              ← Go Back
            </button>
            <Link to="/my-sessions" className="sessions-button">
              My Sessions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="json-viewer-container">
      <div className="json-viewer-header">
        <div className="header-info">
          <h1>📄 Session Content</h1>
          {session && (
            <div className="session-info">
              <h2>{session.title}</h2>
              <div className="session-tags">
                {session.tags && session.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              <p className="session-status">Status: {session.status}</p>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <Link to="/my-sessions" className="sessions-button">
            My Sessions
          </Link>
          <Link to={`/session-editor/${id}`} className="edit-button">
            ✏️ Edit
          </Link>
        </div>
      </div>

      <div className="json-content-container">
        <div className="json-content-header">
          <h3>JSON Content</h3>
          <div className="content-actions">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2))}
              className="copy-button"
            >
              📋 Copy JSON
            </button>
            <a
              href={session?.json_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              📥 Download
            </a>
          </div>
        </div>
        
        <div className="json-display">
          {jsonContent ? renderJsonContent(jsonContent) : <p>No content available</p>}
        </div>
      </div>
    </div>
  );
};

export default SessionJsonViewer;
