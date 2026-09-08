import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import ParkingLot from '../models/ParkingLot.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import ParkingHistory from '../models/ParkingHistory.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await ParkingLot.deleteMany();
    await ParkingSlot.deleteMany();
    await Booking.deleteMany();
    await ParkingHistory.deleteMany();

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartparking.com',
      password: 'admin123',
      role: 'admin',
      vehicleNumber: 'DL01AB1234',
      vehicleType: 'car',
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'user123',
      role: 'user',
      vehicleNumber: 'UP14CD5678',
      vehicleType: 'car',
    });

    const user2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@example.com',
      password: 'user123',
      role: 'user',
      vehicleNumber: 'DL08EV9999',
      vehicleType: 'ev',
    });

    console.log('Creating parking lots...');
    const lotsData = [
      {
        name: 'City Centre Mall Parking',
        location: 'Ghaziabad',
        address: 'Near City Centre Mall, Vaishali Sector 3, Ghaziabad',
        totalSlots: 0,
        availableSlots: 0,
        pricePerHour: 40,
        openingTime: '08:00',
        closingTime: '23:00',
        latitude: 28.6506,
        longitude: 77.3412,
      },
      {
        name: 'Connaught Place Underground',
        location: 'Delhi',
        address: 'Block A, Connaught Place, New Delhi',
        totalSlots: 0,
        availableSlots: 0,
        pricePerHour: 60,
        openingTime: '06:00',
        closingTime: '22:00',
        latitude: 28.6315,
        longitude: 77.2167,
      },
      {
        name: 'Noida Sector 18 Metro Parking',
        location: 'Noida',
        address: 'Near Sector 18 Metro Station, Noida',
        totalSlots: 0,
        availableSlots: 0,
        pricePerHour: 35,
        openingTime: '07:00',
        closingTime: '23:00',
        latitude: 28.5708,
        longitude: 77.3261,
      },
      {
        name: 'Raj Nagar Extension Hub',
        location: 'Ghaziabad',
        address: 'Raj Nagar Extension, Ghaziabad',
        totalSlots: 0,
        availableSlots: 0,
        pricePerHour: 25,
        openingTime: '06:00',
        closingTime: '21:00',
        latitude: 28.7041,
        longitude: 77.4419,
      },
      {
        name: 'India Gate Visitor Parking',
        location: 'Delhi',
        address: 'Near India Gate, Rajpath, New Delhi',
        totalSlots: 0,
        availableSlots: 0,
        pricePerHour: 50,
        openingTime: '05:00',
        closingTime: '20:00',
        latitude: 28.6129,
        longitude: 77.2295,
      },
    ];

    const lots = await ParkingLot.insertMany(lotsData);

    console.log('Creating parking slots...');
    const slots = [];
    const slotConfigs = [
      { lotIndex: 0, count: 8, prefix: 'A', floor: 0 },
      { lotIndex: 1, count: 8, prefix: 'B', floor: -1 },
      { lotIndex: 2, count: 6, prefix: 'C', floor: 0 },
      { lotIndex: 3, count: 6, prefix: 'D', floor: 0 },
      { lotIndex: 4, count: 6, prefix: 'E', floor: 0 },
    ];

    const statuses = ['available', 'available', 'available', 'occupied', 'reserved', 'maintenance'];

    for (const config of slotConfigs) {
      const lot = lots[config.lotIndex];
      for (let i = 1; i <= config.count; i++) {
        let slotType = 'normal';
        if (i === 1) slotType = 'ev';
        if (i === 2) slotType = 'disabled';

        slots.push({
          parkingLot: lot._id,
          slotNumber: `${config.prefix}-${i.toString().padStart(2, '0')}`,
          slotType,
          status: statuses[i % statuses.length],
          floor: config.floor,
          pricePerHour: lot.pricePerHour + (slotType === 'ev' ? 10 : 0),
        });
      }
    }

    const createdSlots = await ParkingSlot.insertMany(slots);

    for (const lot of lots) {
      const lotSlots = createdSlots.filter((s) => s.parkingLot.toString() === lot._id.toString());
      const available = lotSlots.filter((s) => s.status === 'available').length;
      await ParkingLot.findByIdAndUpdate(lot._id, {
        totalSlots: lotSlots.length,
        availableSlots: available,
      });
    }

    console.log('Creating sample bookings...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const booking1 = await Booking.create({
      user: user1._id,
      parkingLot: lots[0]._id,
      parkingSlot: createdSlots.find((s) => s.status === 'reserved')._id,
      vehicleNumber: user1.vehicleNumber,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
      duration: 3,
      totalAmount: 120,
      status: 'confirmed',
    });

    const pastStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 45 * 60 * 60 * 1000);

    const booking2 = await Booking.create({
      user: user2._id,
      parkingLot: lots[2]._id,
      parkingSlot: createdSlots.find((s) => s.parkingLot.toString() === lots[2]._id.toString() && s.status === 'available')._id,
      vehicleNumber: user2.vehicleNumber,
      startTime: pastStart,
      endTime: pastEnd,
      duration: 3,
      totalAmount: 135,
      status: 'completed',
    });

    const booking3 = await Booking.create({
      user: user1._id,
      parkingLot: lots[1]._id,
      parkingSlot: createdSlots.find((s) => s.parkingLot.toString() === lots[1]._id.toString() && s.status === 'available')._id,
      vehicleNumber: user1.vehicleNumber,
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 2 * 60 * 60 * 1000),
      duration: 2,
      totalAmount: 120,
      status: 'confirmed',
    });

    await ParkingHistory.create({
      user: user2._id,
      parkingLot: lots[2]._id,
      parkingSlot: booking2.parkingSlot,
      startTime: booking2.startTime,
      endTime: booking2.endTime,
      duration: booking2.duration,
      amount: booking2.totalAmount,
      status: 'completed',
    });

    console.log('\n========== SEED COMPLETE ==========');
    console.log(`Users: 3 (1 admin, 2 users)`);
    console.log(`Parking Lots: ${lots.length}`);
    console.log(`Parking Slots: ${createdSlots.length}`);
    console.log(`Bookings: 3`);
    console.log('\nTest Accounts:');
    console.log('  Admin: admin@smartparking.com / admin123');
    console.log('  User:  rahul@example.com / user123');
    console.log('  User:  priya@example.com / user123');
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
};

seedData();
