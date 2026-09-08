import ParkingSlot from '../models/ParkingSlot.js';
import ParkingLot from '../models/ParkingLot.js';
import asyncHandler from '../utils/asyncHandler.js';

const updateLotAvailableCount = async (parkingLotId) => {
  const availableCount = await ParkingSlot.countDocuments({
    parkingLot: parkingLotId,
    status: 'available',
  });
  const totalCount = await ParkingSlot.countDocuments({ parkingLot: parkingLotId });
  await ParkingLot.findByIdAndUpdate(parkingLotId, {
    availableSlots: availableCount,
    totalSlots: totalCount,
  });
};

export const getParkingSlots = asyncHandler(async (req, res) => {
  const { parkingLot, status, slotType } = req.query;
  let query = {};

  if (parkingLot) query.parkingLot = parkingLot;
  if (status) query.status = status;
  if (slotType) query.slotType = slotType;

  const slots = await ParkingSlot.find(query)
    .populate('parkingLot', 'name location address')
    .sort({ slotNumber: 1 });

  res.json({
    success: true,
    count: slots.length,
    data: slots,
  });
});

export const getParkingSlotById = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id).populate(
    'parkingLot',
    'name location address pricePerHour'
  );

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  res.json({
    success: true,
    data: slot,
  });
});

export const createParkingSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.create(req.body);
  await updateLotAvailableCount(slot.parkingLot);

  res.status(201).json({
    success: true,
    data: slot,
  });
});

export const updateParkingSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  await updateLotAvailableCount(slot.parkingLot);

  res.json({
    success: true,
    data: slot,
  });
});

export const deleteParkingSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findByIdAndDelete(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  await updateLotAvailableCount(slot.parkingLot);

  res.json({
    success: true,
    message: 'Parking slot removed',
  });
});

export { updateLotAvailableCount };
