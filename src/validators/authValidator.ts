import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().withMessage('Email is invalid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('name').notEmpty().withMessage('Name is required')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Email is invalid'),
  body('password').exists().withMessage('Password is required')
]; 