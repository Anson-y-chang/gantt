import { Router } from 'express';
import {
  getProject,
  createProject,
  createSection,
  updateSection,
  deleteSection,
  createTask,
  updateTask,
  deleteTask,
  getMembers
} from './controllers';

const router = Router();

// Projects
router.get('/projects/:id', getProject);
router.post('/projects', createProject);

// Sections
router.post('/projects/:project_id/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// Tasks
router.post('/sections/:section_id/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Members
router.get('/members', getMembers);

export default router;
