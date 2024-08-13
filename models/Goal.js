const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ensure this is correct
  goalType: String,
  target: Number,
  progress: Number,
  startDate: Date,
  endDate: Date,
});

module.exports = mongoose.model('Goal', goalSchema);

