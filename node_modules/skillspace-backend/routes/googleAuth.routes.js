import express from 'express';
import { connectGoogleCalendar, googleCallback } from '../controllers/googleAuth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/connect', protect, connectGoogleCalendar);
router.get('/callback', googleCallback); // This must match your Google Cloud URI exactly

export default router;