import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SessionForm = ({ sessionId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    json_file_url: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sample JSON URLs for quick selection
  const sampleUrls = [
    'http://localhost:5000/api/sessions-data/morning-yoga.json',
    'http://localhost:5000/api/sessions-data/stress-relief-meditation.json',
    'http://localhost:5000/api/sessions-data/hiit-workout.json',
    'http://localhost:5000/api/sessions-data/evening-relaxation.json',
    'http://localhost:5000/api/sessions-data/breathwork-energy.json'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title is too long (max 200 characters)';
    }
    
    if (formData.json_file_url && !/^https?:\/\/.+/.test(formData.json_file_url)) {
      newErrors.json_file_url = 'Please enter a valid HTTP/HTTPS URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, action = 'publish') => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        id: sessionId
      };
      
      let response;
      if (action === 'publish') {
        response = await sessionAPI.publishSession(payload);
        toast.success('Session published successfully!');
      } else {
        response = await sessionAPI.saveDraft(payload);
        toast.success('Draft saved successfully!');
      }
      
      if (onSuccess) {
        onSuccess(response.data.session);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action} session`;
      toast.error(errorMessage);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.includes('Title')) backendErrors.title = err;
          if (err.includes('URL')) backendErrors.json_file_url = err;
        });
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="session-form" onSubmit={(e) => handleSubmit(e, 'publish')}>
      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="title">
          Session Title *
          <span className="char-count">({formData.title.length}/200)</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Energizing Morning Yoga Flow"
          maxLength={200}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      {/* Tags Field */}
      <div className="form-group">
        <label htmlFor="tags">
          Tags (comma-separated)
          <span className="help-text">Use keywords to help users find your session</span>
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., yoga, morning, beginner, stretching, breathing, energy"
        />
        <div className="tag-preview">
          {formData.tags && (
            <div className="tags-display">
              Preview: {formData.tags.split(',').map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JSON File URL Field */}
      <div className="form-group">
        <label htmlFor="json_file_url">JSON File URL (optional)</label>
        <input
          type="url"
          id="json_file_url"
          name="json_file_url"
          value={formData.json_file_url}
          onChange={handleChange}
          placeholder="https://example.com/session-data.json"
          className={errors.json_file_url ? 'error' : ''}
        />
        {errors.json_file_url && <span className="error-text">{errors.json_file_url}</span>}
        
        {/* Quick URL Selection */}
        <div className="url-suggestions">
          <span>Quick select:</span>
          {sampleUrls.map((url, index) => (
            <button
              key={index}
              type="button"
              className="url-suggestion"
              onClick={() => setFormData(prev => ({ ...prev, json_file_url: url }))}
            >
              {url.split('/').pop().replace('.json', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'draft')}
          disabled={loading}
          className="draft-button"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="publish-button"
        >
          {loading ? 'Publishing...' : 'Publish Session'}
        </button>
      </div>
    </form>
  );
};

export default SessionForm;
