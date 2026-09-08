import ParkingLot from '../models/ParkingLot.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getParkingLots = asyncHandler(async (req, res) => {
  const { search, location } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const lots = await ParkingLot.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: lots.length,
    data: lots,
  });
});

export const getParkingLotById = asyncHandler(async (req, res) => {
  const lot = await ParkingLot.findById(req.params.id);

  if (!lot) {
    res.status(404);
    throw new Error('Parking lot not found');
  }

  res.json({
    success: true,
    data: lot,
  });
});

export const createParkingLot = asyncHandler(async (req, res) => {
  const lot = await ParkingLot.create(req.body);

  res.status(201).json({
    success: true,
    data: lot,
  });
});

export const updateParkingLot = asyncHandler(async (req, res) => {
  const lot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lot) {
    res.status(404);
    throw new Error('Parking lot not found');
  }

  res.json({
    success: true,
    data: lot,
  });
});

export const deleteParkingLot = asyncHandler(async (req, res) => {
  const lot = await ParkingLot.findByIdAndDelete(req.params.id);

  if (!lot) {
    res.status(404);
    throw new Error('Parking lot not found');
  }

  res.json({
    success: true,
    message: 'Parking lot removed',
  });
});
