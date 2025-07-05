import { body, param } from 'express-validator';

export const projectIdParam = [param('id').isMongoId().withMessage('Invalid project id')];

export const createProjectValidator = [body('name').notEmpty().withMessage('Name is required')];

export const updateProjectValidator = [
  ...projectIdParam,
  body('name').optional().notEmpty().withMessage('Name cannot be empty')
];

export const manageMemberValidator = [
  ...projectIdParam,
  body('userId').isMongoId().withMessage('Invalid userId'),
  body('action').isIn(['add', 'remove']).withMessage('Action must be add or remove')
]; 