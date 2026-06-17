const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Generate a JWT token signed with user ID
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body;

  try {
    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Please enter all fields (name, email, password, security question, security answer)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    // Save new user
    user = new User({
      name,
      email,
      password,
      securityQuestion,
      securityAnswer
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(`Register endpoint error: ${error.message}`);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(`Login endpoint error: ${error.message}`);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Fetch authenticated user details
 * @access  Private (Protected by authMiddleware)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Auth/Me endpoint error: ${error.message}`);
    return res.status(500).json({ error: 'Server error fetching profile details' });
  }
});

// @route   GET /api/auth/security-question
// @desc    Retrieve security question for an email
// @access  Public
router.get('/security-question', async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.securityQuestion) {
      return res.status(400).json({ error: 'Security question not configured for this user' });
    }
    return res.status(200).json({ question: user.securityQuestion });
  } catch (error) {
    console.error(`Fetch security question error: ${error.message}`);
    return res.status(500).json({ error: 'Server error fetching security question' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Verify answer and reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, answer, newPassword } = req.body;
  try {
    if (!email || !answer || !newPassword) {
      return res.status(400).json({ error: 'Please enter all fields (email, answer, newPassword)' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.compareSecurityAnswer(answer);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect security answer' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);
    return res.status(500).json({ error: 'Server error resetting password' });
  }
});

// @route   PUT /api/auth/security
// @desc    Update user security question and answer
// @access  Private
router.put('/security', authMiddleware, async (req, res) => {
  const { securityQuestion, securityAnswer } = req.body;
  try {
    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Please provide both question and answer' });
    }
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.securityQuestion = securityQuestion;
    user.securityAnswer = securityAnswer;
    await user.save();

    return res.status(200).json({ message: 'Security questions updated successfully' });
  } catch (error) {
    console.error(`Update security question error: ${error.message}`);
    return res.status(500).json({ error: 'Server error updating security settings' });
  }
});

module.exports = router;
