// server/src/routes/food.routes.js
import express from 'express';
import {
  createFoodItem,
  getAllFoodItems,
  getMyFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  bulkDeleteFoodItems,
  bulkUpdateStatus,
  getFoodStats
} from '../controllers/food.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateFoodItem } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getAllFoodItems);
router.get('/:id', getFoodItemById);

router.use(protect);

router.post('/', authorize('business'), validateFoodItem, createFoodItem);
router.get('/my-items', authorize('business'), getMyFoodItems);
router.put('/:id', authorize('business'), updateFoodItem);
router.delete('/:id', authorize('business'), deleteFoodItem);
router.post('/bulk-delete', authorize('business'), bulkDeleteFoodItems);
router.post('/bulk-update-status', authorize('business'), bulkUpdateStatus);
router.get('/stats', authorize('business'), getFoodStats);

export default router;