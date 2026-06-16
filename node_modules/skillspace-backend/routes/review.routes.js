import express from 'express';
import { createReview, getUserReviews } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);


export default router;