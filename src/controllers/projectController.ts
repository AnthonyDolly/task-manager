import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Project from '../models/project';
import Task from '../models/task';
import { publishProjectEvent } from '../utils/redisPublisher';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/user';

const isOwner = (project: { ownerId: unknown }, userId: string) => {
  return String(project.ownerId) === String(userId);
};

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);

    const filter = {
      $or: [{ ownerId: req.user!.id }, { members: req.user!.id }],
    } as Record<string, unknown>;

    const projects = await Project.find(filter)
      .populate('ownerId', 'name')
      .populate('members', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Project.countDocuments(filter);

    res.json({ projects, page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only owner or member can view
    if (
      !isOwner(project, req.user!.id) &&
      !project.members.includes(req.user!.id as never)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await project.populate({
      path: 'ownerId members',
      select: 'name',
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const data = { ...req.body, ownerId: req.user!.id };
    const project = await Project.create(data);
    await publishProjectEvent('created', project);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!isOwner(project, req.user!.id)) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    project.set(req.body);
    await project.save();
    await publishProjectEvent('updated', project);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!isOwner(project, req.user!.id)) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    // Option B: detach tasks
    await Task.updateMany(
      { projectId: project._id },
      { $unset: { projectId: '' } }
    );
    await project.deleteOne();
    await publishProjectEvent('deleted', project);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const manageMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { operations } = req.body as {
      operations: { action: 'add' | 'remove'; userIds: string[] }[];
    };

    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userIds = operations.flatMap((operation) => operation.userIds);
    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length) {
      return res.status(400).json({ message: 'userIds not found' });
    }

    if (!isOwner(project, req.user!.id)) {
      return res.status(403).json({ message: 'Only owner can manage members' });
    }

    operations.forEach((operation) => {
      if (operation.action === 'add') {
        operation.userIds.forEach((userId) => {
          if (!project.members.includes(userId as never))
            project.members.push(userId as never);
        });
      } else if (operation.action === 'remove') {
        project.members = project.members.filter(
          (m) => !operation.userIds.includes(String(m))
        );
      }
    });

    await project.save();
    await publishProjectEvent('updated', project);
    res.json(project);
  } catch (err) {
    next(err);
  }
};
