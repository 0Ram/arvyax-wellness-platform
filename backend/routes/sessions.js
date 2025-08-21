const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getPublicSessions,
  getUserSessions,
  getUserSession,
  saveDraft,
  publishSession
} = require('../controllers/sessionController');

const router = express.Router();

// Public routes
router.get('/sessions', getPublicSessions);

// Protected routes
router.get('/my-sessions', authMiddleware, getUserSessions);
router.get('/my-sessions/:id', authMiddleware, getUserSession);
router.post('/my-sessions/save-draft', authMiddleware, saveDraft);
router.post('/my-sessions/publish', authMiddleware, publishSession);

module.exports = router;
