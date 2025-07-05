import { body, param } from 'express-validator';

export const taskIdParam = [param('id').isMongoId().withMessage('Invalid task id')];

export const createTaskValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
];

export const updateTaskValidator = [
  ...taskIdParam,
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
]; 