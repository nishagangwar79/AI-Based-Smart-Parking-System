import User from '../models/User.js';
import Booking from '../models/Booking.js';
import ParkingLot from '../models/ParkingLot.js';
import ParkingSlot from '../models/ParkingSlot.js';
import { updateLotAvailableCount } from './parkingSlotController.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalParkingLots = await ParkingLot.countDocuments();
  const totalSlots = await ParkingSlot.countDocuments();
  const availableSlots = await ParkingSlot.countDocuments({ status: 'available' });
  const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
  const reservedSlots = await ParkingSlot.countDocuments({ status: 'reserved' });
  const totalBookings = await Booking.countDocuments();
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

  const revenueResult = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const revenue = revenueResult[0]?.total || 0;

  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('parkingLot', 'name location')
    .populate('parkingSlot', 'slotNumber')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalParkingLots,
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        totalBookings,
        confirmedBookings,
        revenue,
      },
      recentBookings,
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email vehicleNumber')
    .populate('parkingLot', 'name location')
    .populate('parkingSlot', 'slotNumber slotType')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

export const updateSlotStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const slot = await ParkingSlot.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('parkingLot', 'name location');

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  await updateLotAvailableCount(slot.parkingLot._id);

  res.json({
    success: true,
    data: slot,
  });
});
