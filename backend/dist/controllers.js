"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembers = exports.deleteTask = exports.updateTask = exports.createTask = exports.deleteSection = exports.updateSection = exports.createSection = exports.createProject = exports.getProject = exports.test = void 0;
const db_1 = require("./db");
const nanoid_1 = require("nanoid");
// --- test ---
const test = (req, res) => {
    res.json({ message: 'Test successful' });
};
exports.test = test;
// --- Projects ---
const getProject = (req, res) => {
    try {
        const { id } = req.params;
        const projectStmt = db_1.db.prepare('SELECT * FROM project WHERE id = ?');
        const project = projectStmt.get(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const sectionsStmt = db_1.db.prepare('SELECT * FROM section WHERE project_id = ? ORDER BY order_index');
        const sections = sectionsStmt.all(id);
        const tasksStmt = db_1.db.prepare('SELECT * FROM task WHERE section_id = ? ORDER BY order_index');
        for (const section of sections) {
            const tasks = tasksStmt.all(section.id);
            // Parse JSON fields
            section.tasks = tasks.map(task => (Object.assign(Object.assign({}, task), { dependencies: JSON.parse(task.dependencies || '[]'), assignees: JSON.parse(task.assignees || '[]'), is_collapsed: Boolean(task.is_collapsed) })));
            section.is_collapsed = Boolean(section.is_collapsed);
        }
        project.sections = sections;
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProject = getProject;
const createProject = (req, res) => {
    try {
        const { name, description, start_date, end_date } = req.body;
        const id = 'project_' + (0, nanoid_1.nanoid)();
        const stmt = db_1.db.prepare('INSERT INTO project (id, name, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)');
        stmt.run(id, name, description, start_date, end_date);
        res.status(201).json({ id, name, description, start_date, end_date });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createProject = createProject;
// --- Sections ---
const createSection = (req, res) => {
    try {
        const { project_id } = req.params;
        const { name, order_index } = req.body;
        const id = 'section_' + (0, nanoid_1.nanoid)();
        const stmt = db_1.db.prepare('INSERT INTO section (id, project_id, name, order_index) VALUES (?, ?, ?, ?)');
        stmt.run(id, project_id, name, order_index || 0);
        res.status(201).json({ id, project_id, name, order_index });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createSection = createSection;
const updateSection = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        const stmt = db_1.db.prepare(`UPDATE section SET ${fields} WHERE id = ?`);
        stmt.run(...values, id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateSection = updateSection;
const deleteSection = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_1.db.prepare('DELETE FROM section WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteSection = deleteSection;
// --- Tasks ---
const createTask = (req, res) => {
    try {
        const { section_id } = req.params;
        const { name, type, order_index, parent_task_id } = req.body;
        const id = (type === 'milestone' ? 'milestone_' : 'task_') + (0, nanoid_1.nanoid)();
        const stmt = db_1.db.prepare(`
            INSERT INTO task (id, section_id, parent_task_id, name, type, order_index, dependencies, assignees) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, section_id, parent_task_id, name, type || 'task', order_index || 0, '[]', '[]');
        res.status(201).json({ id, section_id, name, type });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createTask = createTask;
const updateTask = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Handle JSON fields
        if (updates.dependencies)
            updates.dependencies = JSON.stringify(updates.dependencies);
        if (updates.assignees)
            updates.assignees = JSON.stringify(updates.assignees);
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        const stmt = db_1.db.prepare(`UPDATE task SET ${fields} WHERE id = ?`);
        stmt.run(...values, id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateTask = updateTask;
const deleteTask = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_1.db.prepare('DELETE FROM task WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteTask = deleteTask;
// --- Members ---
const getMembers = (req, res) => {
    try {
        const stmt = db_1.db.prepare('SELECT * FROM member');
        const members = stmt.all();
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMembers = getMembers;
