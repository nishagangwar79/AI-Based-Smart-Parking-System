import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    totalSlots: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    openingTime: {
      type: String,
      required: true,
      default: '06:00',
    },
    closingTime: {
      type: String,
      required: true,
      default: '22:00',
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

export default ParkingLot;
