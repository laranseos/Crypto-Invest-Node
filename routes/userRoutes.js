import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  mailHandler,
  updateUserProfile,
  checkAuth,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', checkAuth);
router.post('/register', registerUser);
router.post('/mail', mailHandler);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .put(protect, updateUserProfile);

export default router;