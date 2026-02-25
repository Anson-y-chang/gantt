"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("./controllers");
const router = (0, express_1.Router)();
// Test
router.get('/test', controllers_1.test);
// Projects
router.get('/projects/:id', controllers_1.getProject);
router.post('/projects', controllers_1.createProject);
// Sections
router.post('/projects/:project_id/sections', controllers_1.createSection);
router.put('/sections/:id', controllers_1.updateSection);
router.delete('/sections/:id', controllers_1.deleteSection);
// Tasks
router.post('/sections/:section_id/tasks', controllers_1.createTask);
router.put('/tasks/:id', controllers_1.updateTask);
router.delete('/tasks/:id', controllers_1.deleteTask);
// Members
router.get('/members', controllers_1.getMembers);
exports.default = router;
