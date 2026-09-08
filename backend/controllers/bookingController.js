import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ParkingLot from '../models/ParkingLot.js';
import ParkingHistory from '../models/ParkingHistory.js';
import { updateLotAvailableCount } from './parkingSlotController.js';
import asyncHandler from '../utils/asyncHandler.js';

const checkOverlap = async (slotId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    parkingSlot: slotId,
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlapping = await Booking.findOne(query);
  return overlapping;
};

export const createBooking = asyncHandler(async (req, res) => {
  const { parkingLot, parkingSlot, vehicleNumber, startTime, endTime } = req.body;

  if (!parkingLot || !parkingSlot || !vehicleNumber || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please provide all booking details');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  const slot = await ParkingSlot.findById(parkingSlot);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  if (slot.status === 'maintenance') {
    res.status(400);
    throw new Error('This slot is under maintenance');
  }

  const overlap = await checkOverlap(parkingSlot, start, end);

  if (overlap) {
    res.status(400);
    throw new Error('This slot is already booked for the selected time period');
  }

  const durationMs = end - start;
  const duration = Math.ceil(durationMs / (1000 * 60 * 60));
  const pricePerHour = slot.pricePerHour;
  const totalAmount = Math.round(pricePerHour * duration * 100) / 100;

  const booking = await Booking.create({
    user: req.user._id,
    parkingLot,
    parkingSlot,
    vehicleNumber,
    startTime: start,
    endTime: end,
    duration,
    totalAmount,
    status: 'confirmed',
  });

  await ParkingSlot.findByIdAndUpdate(parkingSlot, { status: 'reserved' });
  await updateLotAvailableCount(parkingLot);

  const populatedBooking = await Booking.findById(booking._id)
    .populate('parkingLot', 'name location address')
    .populate('parkingSlot', 'slotNumber slotType floor pricePerHour');

  res.status(201).json({
    success: true,
    data: populatedBooking,
  });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('parkingLot', 'name location address')
    .populate('parkingSlot', 'slotNumber slotType floor')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingLot', 'name location address pricePerHour')
    .populate('parkingSlot', 'slotNumber slotType floor pricePerHour')
    .populate('user', 'name email vehicleNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.json({
    success: true,
    data: booking,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    res.status(400);
    throw new Error('Cannot cancel a completed booking');
  }

  booking.status = 'cancelled';
  await booking.save();

  const otherActiveBookings = await Booking.findOne({
    parkingSlot: booking.parkingSlot,
    status: 'confirmed',
    _id: { $ne: booking._id },
  });

  if (!otherActiveBookings) {
    await ParkingSlot.findByIdAndUpdate(booking.parkingSlot, { status: 'available' });
  }

  await updateLotAvailableCount(booking.parkingLot);

  await ParkingHistory.create({
    user: booking.user,
    parkingLot: booking.parkingLot,
    parkingSlot: booking.parkingSlot,
    startTime: booking.startTime,
    endTime: booking.endTime,
    duration: booking.duration,
    amount: booking.totalAmount,
    status: 'cancelled',
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('parkingLot', 'name location')
    .populate('parkingSlot', 'slotNumber slotType');

  res.json({
    success: true,
    data: populatedBooking,
    message: 'Booking cancelled successfully',
  });
});

export { checkOverlap };
