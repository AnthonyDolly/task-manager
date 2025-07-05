import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/task';
import { publishTaskEvent } from '../utils/redisPublisher';
import { AuthRequest } from '../middlewares/auth';

// Build filters based on query params
const buildFilters = (req: Request) => {
  const {
    status,
    priority,
    dueBefore,
    project,
    assignedTo
  } = req.query;

  const filters: Record<string, unknown> = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (dueBefore) filters.dueDate = { $lte: new Date(dueBefore as string) };
  if (project) filters.projectId = project;
  if (assignedTo) filters.assignedTo = assignedTo;

  return filters;
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const sort = (req.query.sort as string) || '-createdAt'; // default desc createdAt

    const filters = buildFilters(req);

    const tasks = await Task.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .lean();

    const total = await Task.countDocuments(filters);

    res.json({ page, limit, total, tasks });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const data = { ...req.body, createdBy: req.user!.id };
    const task = await Task.create(data);
    await publishTaskEvent('created', task);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await publishTaskEvent('updated', task);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await publishTaskEvent('deleted', task);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}; 