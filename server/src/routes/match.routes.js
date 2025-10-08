// server/src/routes/match.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getMyMatches, requestFood, acceptMatch, completeMatch } from '../controllers/match.controller.js';

const router = express.Router();

router.use(protect);

router.get('/my-matches', getMyMatches);
router.post('/request', authorize('recipient'), requestFood);
router.post('/:id/accept', authorize('recipient'), acceptMatch);
router.post('/:id/complete', completeMatch);

export default router;