const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title too long']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  json_file_url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Must be a valid HTTP/HTTPS URL'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better query performance
sessionSchema.index({ status: 1, createdAt: -1 });
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ tags: 1 });

module.exports = mongoose.model('Session', sessionSchema);
