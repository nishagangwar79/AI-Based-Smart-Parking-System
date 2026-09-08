import ParkingLot from '../models/ParkingLot.js';
import ParkingSlot from '../models/ParkingSlot.js';
import {
  predictParkingDemand,
  getParkingRecommendation,
  getChatResponse,
} from '../services/parkingPredictionService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getRecommendation = asyncHandler(async (req, res) => {
  const { userLocation, preferredParkingType, desiredDuration, vehicleType } = req.body;

  const recommendation = await getParkingRecommendation({
    userLocation: userLocation || '',
    preferredParkingType: preferredParkingType || 'any',
    desiredDuration: desiredDuration || 2,
    vehicleType: vehicleType || req.user?.vehicleType || 'car',
  });

  res.json({
    success: true,
    data: recommendation,
  });
});

export const getPrediction = asyncHandler(async (req, res) => {
  const { parkingLotId } = req.body;

  const prediction = await predictParkingDemand(parkingLotId || null);

  res.json({
    success: true,
    data: prediction,
  });
});

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  const lots = await ParkingLot.find().lean();
  const availableSlots = await ParkingSlot.countDocuments({ status: 'available' });
  const totalSlots = await ParkingSlot.countDocuments();
  const evSlots = await ParkingSlot.countDocuments({ status: 'available', slotType: 'ev' });
  const demandPrediction = await predictParkingDemand();

  const contextData = {
    totalLots: lots.length,
    availableSlots,
    totalSlots,
    evSlots,
    lots: lots.map((l) => ({
      name: l.name,
      location: l.location,
      available: l.availableSlots,
      price: l.pricePerHour,
    })),
    demandPrediction,
  };

  const response = await getChatResponse(message, contextData);

  res.json({
    success: true,
    data: response,
  });
});
