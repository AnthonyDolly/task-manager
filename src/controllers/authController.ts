import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { addToBlacklist } from '../middlewares/blacklist';
import { AuthRequest } from '../middlewares/auth';

const generateToken = (user: IUser): string => {
  const jti = uuidv4();
  const jwtSecret = process.env.JWT_SECRET || '';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  const payload = { id: user._id, email: user.email, jti };
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user);

    return res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const jti = (req as any).tokenId;
    const exp = (req as any).tokenExp || 60 * 60; // fallback 1h
    if (jti) await addToBlacklist(jti, exp);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}; 