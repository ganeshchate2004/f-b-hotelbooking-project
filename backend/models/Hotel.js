const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  image: String,
  name: String,
  location: String,
  price: Number,
  description: String,
});

module.exports = mongoose.model('Hotel', HotelSchema);
