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

// Update a goal
router.put('/:id', auth, async (req, res) => {
  const { goalType, target, progress, startDate, endDate } = req.body;

  try {
      let goal = await Goal.findById(req.params.id);

      if (!goal) {
          return res.status(404).json({ msg: 'Goal not found' });
      }

      // Update the goal fields
      goal.goalType = goalType;
      goal.target = target;
      goal.progress = progress;
      goal.startDate = startDate;
      goal.endDate = endDate;

      await goal.save();
      res.json(goal);
  } catch (error) {
      console.error('Error updating goal:', error.message);
      res.status(500).send('Server error');
  }
});



// Delete a goal
router.delete('/:id', auth, async (req, res) => {
  try {
      let goal = await Goal.findById(req.params.id);

      if (!goal) {
          return res.status(404).json({ msg: 'Goal not found' });
      }

      await goal.deleteOne(); // Corrected method
      res.json({ msg: 'Goal removed' });
  } catch (error) {
      console.error('Error deleting goal:', error.message);
      res.status(500).send('Server error');
  }
});
