// Import necessary modules
const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal'); // Adjust the path to your Goal model
const auth = require('../middleware/auth'); // Middleware for authentication

// Route to add a new goal
router.post('/', auth, async (req, res) => {
  const { goalCategory, target, description } = req.body;

  // Validate the goal category
  if (goalCategory === 'workout' && typeof target !== 'number') {
    return res.status(400).json({ msg: 'Target should be a number for workout goals.' });
  } else if (goalCategory === 'diet' && typeof target !== 'string') {
    return res.status(400).json({ msg: 'Target should be a string for diet goals.' });
  }

  try {
    // Create a new goal
    const newGoal = new Goal({
      user: req.user.id, // Use authenticated user’s ID
      goalCategory,
      target,
      description: description || '', 
    });

    // Save goal to the database
    const savedGoal = await newGoal.save();
    res.json(savedGoal);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Route to get all goals for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;




