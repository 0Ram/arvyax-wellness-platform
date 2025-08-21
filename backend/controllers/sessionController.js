const Session = require('../models/Session');

// Get all published sessions (public)
const getPublicSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'published' })
      .populate('user_id', 'email')
      .sort({ createdAt: -1 });
    
    console.log('Public sessions found:', sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching public sessions:', error);
    res.status(500).json({ message: 'Failed to load sessions' });
  }
};

// Get user's own sessions
const getUserSessions = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const sessions = await Session.find({ user_id: req.user._id })
      .sort({ updatedAt: -1 });
    
    console.log('User sessions found:', sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Failed to load your sessions' });
  }
};

// Get single user session
const getUserSession = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save draft session
const saveDraft = async (req, res) => {
  try {
    console.log('Save draft request:', req.body);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id, title, tags, json_file_url } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let session;
    if (id) {
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          json_file_url: json_file_url || '',
          status: 'draft'
        },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({ message: 'Session not found or unauthorized' });
      }
    } else {
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        json_file_url: json_file_url || '',
        status: 'draft'
      });
      await session.save();
    }

    console.log('Session saved:', session._id);
    res.json({ message: 'Draft saved successfully', session });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
};

// Publish session
const publishSession = async (req, res) => {
  try {
    console.log('Publish request:', req.body);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id, title, tags, json_file_url } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let session;
    if (id) {
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          json_file_url: json_file_url || '',
          status: 'published'
        },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({ message: 'Session not found or unauthorized' });
      }
    } else {
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        json_file_url: json_file_url || '',
        status: 'published'
      });
      await session.save();
    }

    console.log('Session published:', session._id);
    res.json({ message: 'Session published successfully', session });
  } catch (error) {
    console.error('Error publishing session:', error);
    res.status(500).json({ message: 'Failed to publish session' });
  }
};

module.exports = {
  getPublicSessions,
  getUserSessions,
  getUserSession,
  saveDraft,
  publishSession
};
