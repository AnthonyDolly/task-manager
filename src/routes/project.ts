import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  manageMembers
} from '../controllers/projectController';
import { auth } from '../middlewares/auth';
import {
  projectIdParam,
  createProjectValidator,
  updateProjectValidator,
  manageMemberValidator
} from '../validators/projectValidator';

const router = Router();

router.use(auth);

router.get('/', getProjects);

router.get('/:id', projectIdParam, getProjectById);

router.post('/', createProjectValidator, createProject);

router.put('/:id', updateProjectValidator, updateProject);

router.delete('/:id', projectIdParam, deleteProject);

router.patch('/:id/members', manageMemberValidator, manageMembers);

export default router;
