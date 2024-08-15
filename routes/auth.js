const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const sendResetEmail = require('../services/emailService'); // Fix import

// Register route
router.post('/register', async (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error during registration:', error.message);
    if (error.code === 11000) {
      return res.status(400).send('Username or email already exists');
    }
    res.status(400).send(error.message);
  }
});

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        'your_jwt_secret', // Replace with your actual JWT secret
        { expiresIn: 3600 }, // 1 hour expiration
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).send('Server error');
    }
  }
);

// Request Password Reset Route
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email with the reset link
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    sendResetEmail(user.email, resetToken, {
      service: 'Gmail', // Change this as needed
      user: 'your-email@gmail.com', // Change this
      pass: 'your-email-password', // Change this
    });

    res.status(200).json({ msg: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Error requesting password reset:', error.message);
    res.status(500).send('Server error');
  }
});


// Password Reset Route
router.post('/reset-password/:token', async (req, res) => {
  try {
    // Get the reset token from the URL
    const { token } = req.params;
    const { password } = req.body;

    // Find the user by reset token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is not expired
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
