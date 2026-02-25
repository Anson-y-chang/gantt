import { Request, Response } from 'express';
import { db } from './db';
import { nanoid } from 'nanoid';

// --- test ---
export const test = (req: Request, res: Response) => {
  res.json({ message: 'Test successful' });
}

// --- Projects ---

export const getProject = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectStmt = db.prepare('SELECT * FROM project WHERE id = ?');
    const project = projectStmt.get(id) as any;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sectionsStmt = db.prepare('SELECT * FROM section WHERE project_id = ? ORDER BY order_index');
    const sections = sectionsStmt.all(id) as any[];

    const tasksStmt = db.prepare('SELECT * FROM task WHERE section_id = ? ORDER BY order_index');

    for (const section of sections) {
      const tasks = tasksStmt.all(section.id) as any[];
      // Parse JSON fields
      section.tasks = tasks.map(task => ({
        ...task,
        dependencies: JSON.parse(task.dependencies || '[]'),
        assignees: JSON.parse(task.assignees || '[]'),
        is_collapsed: Boolean(task.is_collapsed)
      }));
      section.is_collapsed = Boolean(section.is_collapsed);
    }

    project.sections = sections;

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    const id = 'project_' + nanoid();
    const stmt = db.prepare('INSERT INTO project (id, name, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, description, start_date, end_date);
    res.status(201).json({ id, name, description, start_date, end_date });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// --- Sections ---

export const createSection = (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { name, order_index } = req.body;
    const id = 'section_' + nanoid();
    const stmt = db.prepare('INSERT INTO section (id, project_id, name, order_index) VALUES (?, ?, ?, ?)');
    stmt.run(id, project_id, name, order_index || 0);
    res.status(201).json({ id, project_id, name, order_index });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSection = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const stmt = db.prepare(`UPDATE section SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSection = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM section WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// --- Tasks ---

export const createTask = (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const { name, type, order_index, parent_task_id } = req.body;
    const id = (type === 'milestone' ? 'milestone_' : 'task_') + nanoid();

    const stmt = db.prepare(`
            INSERT INTO task (id, section_id, parent_task_id, name, type, order_index, dependencies, assignees) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
    stmt.run(id, section_id, parent_task_id, name, type || 'task', order_index || 0, '[]', '[]');
    res.status(201).json({ id, section_id, name, type });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle JSON fields
    if (updates.dependencies) updates.dependencies = JSON.stringify(updates.dependencies);
    if (updates.assignees) updates.assignees = JSON.stringify(updates.assignees);

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const stmt = db.prepare(`UPDATE task SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM task WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// --- Members ---
export const getMembers = (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM member');
    const members = stmt.all();
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
