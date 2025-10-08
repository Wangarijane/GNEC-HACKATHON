// server/src/routes/prediction.routes.js
import express from 'express';
import { getSurplusPrediction, triggerAIMatching } from '../controllers/prediction.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/surplus', authorize('business'), getSurplusPrediction);
router.post('/match/:foodId', authorize('business'), triggerAIMatching);

export default router;