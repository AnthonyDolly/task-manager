import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { auth } from '../middlewares/auth';
import { taskIdParam, createTaskValidator, updateTaskValidator } from '../validators/taskValidator';

const router = Router();

router.use(auth);

router.get('/', getTasks);

router.get('/:id', taskIdParam, getTaskById);

router.post('/', createTaskValidator, createTask);

router.put('/:id', updateTaskValidator, updateTask);

router.delete('/:id', taskIdParam, deleteTask);

export default router;
