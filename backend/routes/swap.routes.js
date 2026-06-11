import express from 'express';
import { createSwapRequest, respondToSwapRequest, getMySwaps } from '../controllers/swap.controller.js';
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); //al routes require jwt token authentication

router.post('/request', createSwapRequest);
router.put('/:id/respond', respondToSwapRequest);
router.get('/mine', getMySwaps);

export default router;