const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming you have user authentication
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  jobLink: String,
  resumeVersion: String
}, {
  timestamps: true
});

module.exports = mongoose.model('jobApplication', jobApplicationSchema);
