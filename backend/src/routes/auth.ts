import { Router } from 'express';
import { register, login, acceptInvite } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/accept-invite', acceptInvite);

export default router;
