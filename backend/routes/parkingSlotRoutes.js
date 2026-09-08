import express from 'express';
import {
  getParkingSlots,
  getParkingSlotById,
  createParkingSlot,
  updateParkingSlot,
  deleteParkingSlot,
} from '../controllers/parkingSlotController.js';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getParkingSlots);
router.get('/:id', getParkingSlotById);
router.post('/', protect, admin, createParkingSlot);
router.put('/:id', protect, admin, updateParkingSlot);
router.delete('/:id', protect, admin, deleteParkingSlot);

export default router;
