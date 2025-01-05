const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  text: String,
  rating: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);
