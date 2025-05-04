const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required.']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required.'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required.'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  jobLink: {
    type: String,
    trim: true
  },
  resumeVersion: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
