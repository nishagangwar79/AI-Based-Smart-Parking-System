import express from 'express';
import { getRecommendation, getPrediction, chat } from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/recommend', protect, getRecommendation);
router.post('/predict', protect, getPrediction);
router.post('/chat', protect, chat);

export default router;
