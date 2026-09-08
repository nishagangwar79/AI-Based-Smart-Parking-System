import express from 'express';
import {
  getDashboard,
  getAllUsers,
  getAllBookings,
  updateSlotStatus,
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.put('/parking-slots/:id/status', updateSlotStatus);

export default router;
