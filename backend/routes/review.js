const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/reviews
 * @desc    Submit a user review/feedback
 * @access  Private (JWT Protected)
 */
router.post('/', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // 1. Extract robust user ID and username fallback
    const detectedUserId = req.user?.id || req.user?._id || req.user?.userId || req.user;
    if (!detectedUserId) {
      return res.status(401).json({ error: 'No user identification found in token' });
    }

    let verifiedName = req.body.userName || req.user?.name || req.user?.businessName;
    if (!verifiedName) {
      const user = await User.findById(detectedUserId);
      if (user) {
        verifiedName = user.name;
      }
    }
    if (!verifiedName) {
      verifiedName = 'Verified User';
    }

    // 2. Validate ratings
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a numerical value between 1 and 5 stars' });
    }

    // 3. Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Review comment cannot be empty' });
    }

    // 4. Create or update (upsert) existing review
    const savedReview = await Review.findOneAndUpdate(
      { userId: detectedUserId },
      {
        userId: detectedUserId,
        userName: verifiedName,
        rating,
        comment: comment.trim()
      },
      { upsert: true, new: true, runValidators: true }
    );
    return res.status(201).json(savedReview);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    console.error(`Error saving review: ${error.message}`);
    return res.status(500).json({ error: 'Server error while submitting user feedback' });
  }
});

/**
 * @route   GET /api/reviews/featured
 * @desc    Get highest-rated featured reviews (4 or 5 stars)
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const featuredReviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 });
    return res.status(200).json(featuredReviews);
  } catch (error) {
    console.error(`Error fetching featured reviews: ${error.message}`);
    return res.status(500).json({ error: 'Server error while fetching testimonials' });
  }
});

module.exports = router;
