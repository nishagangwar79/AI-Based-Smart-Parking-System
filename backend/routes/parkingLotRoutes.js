import express from 'express';
import {
  getParkingLots,
  getParkingLotById,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from '../controllers/parkingLotController.js';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getParkingLots);
router.get('/:id', getParkingLotById);
router.post('/', protect, admin, createParkingLot);
router.put('/:id', protect, admin, updateParkingLot);
router.delete('/:id', protect, admin, deleteParkingLot);

export default router;
