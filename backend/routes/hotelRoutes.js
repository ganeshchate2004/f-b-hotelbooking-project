// hotelRoutes.js
const express = require('express');
const Hotel = require('../models/Hotel');
const router = express.Router();

// Add hotel route
router.post('/add-hotel', async (req, res) => {
  try {
    const { image, name, location, price, description } = req.body;
    const newHotel = new Hotel({ image, name, location, price, description });
    await newHotel.save();
    res.json({ message: 'Hotel added successfully' });
  } catch (err) {
    console.error('Error adding hotel:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all hotels route
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find({});
    res.json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Search hotels route
router.get('/search', async (req, res) => {
  const { location, name } = req.query;
  try {
    const filter = {};
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };

    const hotels = await Hotel.find(filter);
    res.json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
