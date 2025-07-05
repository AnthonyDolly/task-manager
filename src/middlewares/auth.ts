import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { checkBlacklist } from './blacklist';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      jti?: string;
      exp?: number;
    };

    req.user = { id: decoded.id, email: decoded.email };
    (req as any).tokenId = decoded.jti;
    (req as any).tokenExp = decoded.exp;
    await checkBlacklist(req, res, next);
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};
