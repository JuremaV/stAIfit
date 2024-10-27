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
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;

          // Send token, username, and email back to the frontend
          console.log("User details on successful login:", { username: user.username, email: user.email, token });
          res.json({ token, username: user.username, email: user.email });
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    sendResetEmail(user.email, resetToken, {
      service: 'Gmail',
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
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
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

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

