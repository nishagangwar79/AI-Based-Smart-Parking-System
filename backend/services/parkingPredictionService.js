import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ParkingLot from '../models/ParkingLot.js';
import { generateAIResponse } from './geminiService.js';

const getHourlyBookingCounts = (bookings) => {
  const hourCounts = Array(24).fill(0);

  bookings.forEach((booking) => {
    const startHour = new Date(booking.startTime).getHours();
    hourCounts[startHour] += 1;
  });

  return hourCounts;
};

const getDayOfWeekCounts = (bookings) => {
  const dayCounts = Array(7).fill(0);
  bookings.forEach((booking) => {
    const day = new Date(booking.startTime).getDay();
    dayCounts[day] += 1;
  });
  return dayCounts;
};

export const predictParkingDemand = async (parkingLotId = null) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const query = {
    createdAt: { $gte: thirtyDaysAgo },
    status: { $in: ['confirmed', 'completed'] },
  };

  if (parkingLotId) {
    query.parkingLot = parkingLotId;
  }

  const bookings = await Booking.find(query);
  const totalSlots = parkingLotId
    ? await ParkingSlot.countDocuments({ parkingLot: parkingLotId })
    : await ParkingSlot.countDocuments();

  const availableSlots = parkingLotId
    ? await ParkingSlot.countDocuments({ parkingLot: parkingLotId, status: 'available' })
    : await ParkingSlot.countDocuments({ status: 'available' });

  const currentHour = now.getHours();
  const currentDay = now.getDay();
  const hourCounts = getHourlyBookingCounts(bookings);
  const dayCounts = getDayOfWeekCounts(bookings);

  const avgBookingsPerHour = bookings.length / 24 || 0;
  const currentHourBookings = hourCounts[currentHour];
  const currentDayBookings = dayCounts[currentDay];

  let demandLevel = 'low';
  let score = 0;

  if (totalSlots > 0) {
    const occupancyRate = ((totalSlots - availableSlots) / totalSlots) * 100;
    score += occupancyRate * 0.4;
  }

  if (avgBookingsPerHour > 0) {
    score += (currentHourBookings / avgBookingsPerHour) * 30;
  }

  score += (currentDayBookings / Math.max(bookings.length, 1)) * 30;

  if (score >= 60) {
    demandLevel = 'high';
  } else if (score >= 30) {
    demandLevel = 'medium';
  }

  const lowDemandHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 3)
    .map((h) => `${h.hour.toString().padStart(2, '0')}:00`);

  const suggestedBestTime = lowDemandHours[0] || '06:00';
  const expectedAvailability =
    demandLevel === 'high' ? 'Limited' : demandLevel === 'medium' ? 'Moderate' : 'Good';

  let explanation = `Based on ${bookings.length} bookings in the last 30 days, current demand is ${demandLevel}. `;
  explanation += `${availableSlots} of ${totalSlots} slots are currently available. `;
  explanation += `Best time to park today is around ${suggestedBestTime}.`;

  const aiEnhancement = await generateAIResponse(
    `Explain parking demand prediction briefly in 2-3 sentences for a user in India. Demand level: ${demandLevel}. Available slots: ${availableSlots}/${totalSlots}. Suggested time: ${suggestedBestTime}.`,
    'You are a smart parking assistant. Be concise and helpful.'
  );

  if (aiEnhancement) {
    explanation = aiEnhancement;
  }

  return {
    demandLevel,
    explanation,
    suggestedBestTime,
    expectedAvailability,
    stats: {
      totalBookings: bookings.length,
      availableSlots,
      totalSlots,
      currentHourBookings,
    },
  };
};

export const getParkingRecommendation = async ({
  userLocation,
  preferredParkingType,
  desiredDuration,
  vehicleType,
}) => {
  const lots = await ParkingLot.find().lean();
  const slots = await ParkingSlot.find({ status: 'available' })
    .populate('parkingLot')
    .lean();

  if (lots.length === 0 || slots.length === 0) {
    return {
      recommendedLot: null,
      recommendedSlot: null,
      reason: 'No parking lots or available slots found at the moment.',
      estimatedPrice: 0,
      availability: 'none',
    };
  }

  let filteredSlots = slots;

  if (preferredParkingType && preferredParkingType !== 'any') {
    filteredSlots = filteredSlots.filter((s) => s.slotType === preferredParkingType);
  }

  if (vehicleType === 'ev') {
    const evSlots = filteredSlots.filter((s) => s.slotType === 'ev');
    if (evSlots.length > 0) {
      filteredSlots = evSlots;
    }
  }

  if (filteredSlots.length === 0) {
    filteredSlots = slots;
  }

  const locationKeyword = userLocation?.toLowerCase() || '';
  let scoredLots = lots.map((lot) => {
    let score = lot.availableSlots * 2;
    if (locationKeyword && lot.location.toLowerCase().includes(locationKeyword)) {
      score += 50;
    }
    if (locationKeyword && lot.name.toLowerCase().includes(locationKeyword)) {
      score += 30;
    }
    score -= lot.pricePerHour * 0.5;
    return { lot, score };
  });

  scoredLots.sort((a, b) => b.score - a.score);
  const bestLot = scoredLots[0].lot;

  const lotSlots = filteredSlots.filter(
    (s) => s.parkingLot._id.toString() === bestLot._id.toString()
  );

  const recommendedSlot = lotSlots[0] || filteredSlots[0];
  const pricePerHour = recommendedSlot?.pricePerHour || bestLot.pricePerHour;
  const duration = parseFloat(desiredDuration) || 2;
  const estimatedPrice = Math.round(pricePerHour * duration * 100) / 100;

  let reason = `Recommended based on availability (${bestLot.availableSlots} slots free), location match, and pricing at ₹${bestLot.pricePerHour}/hour.`;

  const parkingData = lots.map((l) => ({
    name: l.name,
    location: l.location,
    available: l.availableSlots,
    total: l.totalSlots,
    price: l.pricePerHour,
  }));

  const aiReason = await generateAIResponse(
    `Recommend parking for: location="${userLocation}", vehicle="${vehicleType}", duration="${duration} hours", preference="${preferredParkingType}". Available lots: ${JSON.stringify(parkingData)}. Best lot: ${bestLot.name}. Give a friendly 2-sentence recommendation.`,
    'You are a smart parking assistant in India. Use ₹ for currency.'
  );

  if (aiReason) {
    reason = aiReason;
  }

  return {
    recommendedLot: bestLot,
    recommendedSlot,
    reason,
    estimatedPrice,
    availability: bestLot.availableSlots > 5 ? 'good' : bestLot.availableSlots > 0 ? 'limited' : 'none',
    duration,
  };
};

export const getChatResponse = async (message, contextData) => {
  const fallbackResponses = {
    best: 'Based on current availability, I recommend checking parking lots with the most free slots in your preferred area. Use the AI Recommendation page for personalized suggestions.',
    available: `There are currently ${contextData.availableSlots} available slots across ${contextData.totalLots} parking lots.`,
    cost: `Parking costs vary by lot, typically ₹30-₹80 per hour. Select a lot and duration on the booking page for exact pricing.`,
    ev: contextData.evSlots > 0
      ? `Yes! We have ${contextData.evSlots} EV charging slots available across our parking lots.`
      : 'EV slots may be limited. Please check parking details for EV-compatible slots.',
    time: contextData.demandPrediction
      ? `Best time to park today is around ${contextData.demandPrediction.suggestedBestTime}. Demand is currently ${contextData.demandPrediction.demandLevel}.`
      : 'Early morning (6-8 AM) and late evening (8-10 PM) typically have lower demand.',
  };

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('best') || lowerMsg.includes('recommend')) {
    return { reply: fallbackResponses.best, source: 'fallback' };
  }
  if (lowerMsg.includes('available') || lowerMsg.includes('slot')) {
    return { reply: fallbackResponses.available, source: 'fallback' };
  }
  if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('much')) {
    return { reply: fallbackResponses.cost, source: 'fallback' };
  }
  if (lowerMsg.includes('ev') || lowerMsg.includes('electric')) {
    return { reply: fallbackResponses.ev, source: 'fallback' };
  }
  if (lowerMsg.includes('time') || lowerMsg.includes('when')) {
    return { reply: fallbackResponses.time, source: 'fallback' };
  }

  const systemContext = `You are a helpful AI parking assistant for Smart Parking System in India (Delhi NCR region).
Current parking data:
- Total lots: ${contextData.totalLots}
- Available slots: ${contextData.availableSlots}
- Total slots: ${contextData.totalSlots}
- EV slots available: ${contextData.evSlots}
- Parking lots: ${JSON.stringify(contextData.lots?.slice(0, 5) || [])}
Answer concisely in 2-4 sentences. Use ₹ for prices. Be friendly and helpful.`;

  const aiReply = await generateAIResponse(message, systemContext);

  if (aiReply) {
    return { reply: aiReply, source: 'gemini' };
  }

  return {
    reply: 'I can help you with parking recommendations, availability, pricing, EV slots, and best times to park. What would you like to know?',
    source: 'fallback',
  };
};

export default { predictParkingDemand, getParkingRecommendation, getChatResponse };
