import express from 'express';
import { createBooking, updateBookingStatus, getMyBookings } from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); 

router.post('/', createBooking);
router.get('/mine', getMyBookings);
router.put('/:id', updateBookingStatus);

export default router;