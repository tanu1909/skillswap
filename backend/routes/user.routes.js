import express from 'express';
import { searchUsersBySkill, getUserProfile, updateMyProfile, getMatches } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/search', searchUsersBySkill);
router.get('/matches', protect, getMatches);
router.put('/me', protect, updateMyProfile);
router.get('/:id', getUserProfile);


export default router;