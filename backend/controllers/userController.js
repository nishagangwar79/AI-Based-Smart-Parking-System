import User from '../models/User.js';
import Booking from '../models/Booking.js';
import ParkingHistory from '../models/ParkingHistory.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
  const history = await ParkingHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

  res.json({
    success: true,
    data: {
      user,
      recentBookings: bookings,
      parkingHistory: history,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.vehicleNumber = req.body.vehicleNumber ?? user.vehicleNumber;
  user.vehicleType = req.body.vehicleType || user.vehicleType;

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = req.body.email;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      vehicleNumber: updatedUser.vehicleNumber,
      vehicleType: updatedUser.vehicleType,
    },
  });
});
