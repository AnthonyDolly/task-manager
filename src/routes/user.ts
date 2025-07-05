import { Router, Request, Response } from 'express';
import { auth, AuthRequest } from '../middlewares/auth';
import User from '../models/user';

const router = Router();

// /users/me
router.get('/me', auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).select('-password');
  res.json(user);
});

router.get('/', async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

export default router; 