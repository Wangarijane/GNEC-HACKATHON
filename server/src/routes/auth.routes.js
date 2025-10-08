// ============================================================================
// SERVER - ROUTES
// ============================================================================

// server/src/routes/auth.routes.js
import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;