// commentRoutes.js
const express = require('express');
const Comment = require('../models/Comment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Get comments for a specific hotel
router.get('/:id/comments', async (req, res) => {
  const hotelId = req.params.id;
  try {
    const comments = await Comment.find({ hotelId })
      .populate('userId', 'username')  // Populate username from the User model
      .exec();
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Post a comment for a hotel (protected)
router.post('/:id/comments', async (req, res) => {
  const hotelId = req.params.id;
  const { text, rating } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = new Comment({
      userId: user._id,
      hotelId,
      text,
      rating,
    });

    await newComment.save();
    res.json({ message: 'Comment posted successfully' });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
