import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import rateLimit from 'express-rate-limit';
import { auth } from '../middlewares/auth';
import { registerValidator, loginValidator } from '../validators/authValidator';

const router = Router();

// /auth/register
router.post('/register', registerValidator, register);

const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_WINDOW_MINUTES || '15', 10) * 60 * 1000,
  max: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// /auth/login
router.post('/login', loginLimiter, loginValidator, login);

router.post('/logout', auth, logout);

export default router;
