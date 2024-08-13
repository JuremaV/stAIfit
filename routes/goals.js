const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import the auth middleware
const Goal = require('../models/Goal');

// Example protected route to get all goals for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching goals for user ID:', req.user.id); // Add this line
    const goals = await Goal.find({ user: req.user.id });
    console.log('Goals found:', goals); // Add this line
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error.message);
    res.status(500).send('Server error');
  }
});

// Route to add a new goal
router.post('/', auth, async (req, res) => {
  const { goalType, target, progress, startDate, endDate } = req.body;

  try {
    const newGoal = new Goal({
      user: req.user.id,
      goalType,
      target,
      progress,
      startDate,
      endDate,
    });

    const goal = await newGoal.save();
    console.log('Goal added:', goal); // Add this line
    res.json(goal);
  } catch (error) {
    console.error('Error adding goal:', error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;