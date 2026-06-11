import express from 'express';
import { getChatHistory } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:counterpartId', protect, getChatHistory);

export default router;