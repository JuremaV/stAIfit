// Goal.js (models/Goal.js)

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goalCategory: {
    type: String,
    enum: ['running', 'walking', 'workout', 'diet'],
    required: true,
  },
  target: {
    type: mongoose.Schema.Types.Mixed, // Allows both numbers and strings
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  progress: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Goal', goalSchema);


  
