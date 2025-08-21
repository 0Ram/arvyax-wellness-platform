import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    json_file_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(Date.now());

  useEffect(() => {
    if (id) {
      fetchSession();
    }
  }, [id]);

  const fetchSession = async () => {
    try {
      const response = await sessionAPI.getUserSession(id);
      const session = response.data;
      setFormData({
        title: session.title,
        tags: session.tags.join(', '),
        json_file_url: session.json_file_url || ''
      });
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/my-sessions');
    }
  };

  // Auto-save draft
  const autoSave = useCallback(
    async (data) => {
      if (!data.title.trim()) return;

      setAutoSaving(true);
      try {
        const response = await sessionAPI.saveDraft({ ...data, id });
        console.log('Auto-save successful:', response.data);
        toast.success('Auto-saved!', { duration: 2000 });
        setLastSaved(Date.now());
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error(`Auto-save failed: ${error.response?.data?.message || error.message}`);
      } finally {
        setAutoSaving(false);
      }
    },
    [id]
  );

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.title.trim() && Date.now() - lastSaved > 5000) {
        autoSave(formData);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave, lastSaved]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sessionAPI.saveDraft({ ...formData, id });
      toast.success('Draft saved successfully!');
      console.log('Save response:', response.data);

      // If this is a new session, redirect to its editor page
      if (!id && response.data.session?._id) {
        navigate(`/session-editor/${response.data.session._id}`);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(`Failed to save draft: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.json_file_url.trim()) {
      toast.error('JSON file URL is required');
      return;
    }

    setLoading(true);

    try {
      const response = await sessionAPI.publishSession({ ...formData, id });
      console.log('Publish response:', response.data);
      toast.success('Session published successfully!');
      navigate('/my-sessions');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(`Failed to publish session: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-editor">
      <div className="editor-header">
        <h1>{id ? 'Edit Session' : 'Create New Session'}</h1>
        <div className="editor-status">
          {autoSaving && <span className="auto-save-indicator">Auto-saving...</span>}
          {lastSaved && !autoSaving && (
            <span className="last-saved">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <form className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Session Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter session title..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="yoga, meditation, relaxation..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="json_file_url">JSON File URL *</label>
          <input
            type="url"
            id="json_file_url"
            name="json_file_url"
            value={formData.json_file_url}
            onChange={handleChange}
            placeholder="http://localhost:5000/api/sessions-data/morning-yoga.json"
            required
          />
        </div>

        <div className="editor-actions">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="draft-button"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={loading || !formData.title.trim()}
            className="publish-button"
          >
            {loading ? 'Publishing...' : 'Publish Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionEditor;