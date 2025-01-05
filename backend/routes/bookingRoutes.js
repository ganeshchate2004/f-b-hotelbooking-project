// bookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const hotelList = await Promise.all(bookings.map(async (booking) => {
      const hotel = await Hotel.findById(booking.hotelId);
      if (!hotel) {
        throw new Error(`Hotel not found for booking with ID: ${booking._id}`);
      }

      return {
        ...booking.toObject(),
        hotel: {
          name: hotel.name,
          location: hotel.location,
          price: hotel.price
        },
      };
    }));

    res.json(hotelList); // Return the list with bookings and hotel details
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// Booking route with date conflict check (protected)
router.post('/:id', async (req, res) => {
  const hotelId = req.params.id;
  const { startDate, endDate, mobileNumber, numberOfPersons, scannedImage } = req.body;
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

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const overlappingBooking = await Booking.findOne({
      hotelId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: `Hotel is already booked for the selected dates. Please choose a different period.`
      });
    }

    const totalPrice = hotel.price * numberOfPersons;
    const newBooking = new Booking({
      hotelId,
      userId: user._id,
      startDate,
      endDate,
      mobileNumber,
      numberOfPersons,
      scannedImage,
      totalPrice
    });

    await newBooking.save();
    res.json({ message: 'Booking successful', booking: newBooking });
  } catch (err) {
    console.error('Error during booking:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
