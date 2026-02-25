import Database from 'better-sqlite3';

const db = new Database('gantt.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize database schema
const initDb = () => {
  const createProjectTable = `
    CREATE TABLE IF NOT EXISTS project (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status INTEGER DEFAULT 0,
      is_org BOOLEAN DEFAULT 0,
      company_id INTEGER DEFAULT 1,
      finished_percentage REAL DEFAULT 0,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `;

  const createSectionTable = `
    CREATE TABLE IF NOT EXISTS section (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      is_collapsed BOOLEAN DEFAULT 0,
       finished_percentage REAL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
    );
  `;

  const createTaskTable = `
    CREATE TABLE IF NOT EXISTS task (
      id TEXT PRIMARY KEY,
      section_id TEXT,
      parent_task_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      duration_in_days REAL,
      progress REAL DEFAULT 0,
      type TEXT CHECK(type IN ('task', 'milestone')) DEFAULT 'task',
      order_index INTEGER DEFAULT 0,
      dependencies TEXT, -- JSON array of task IDs
      assignees TEXT, -- JSON array of member IDs
      finished_percentage REAL DEFAULT 0,
       is_collapsed BOOLEAN DEFAULT 0,
      FOREIGN KEY (section_id) REFERENCES section(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_task_id) REFERENCES task(id) ON DELETE CASCADE
    );
  `;

  const createMemberTable = `
    CREATE TABLE IF NOT EXISTS member (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `;

  db.exec(createProjectTable);
  db.exec(createSectionTable);
  db.exec(createTaskTable);
  db.exec(createMemberTable);

  // Seed initial project if empty
  const stmt = db.prepare('SELECT count(*) as count FROM project');
  const result = stmt.get() as { count: number };
  if (result.count === 0) {
    console.log("Seeding initial project...");
    const insertProject = db.prepare(`
          INSERT INTO project (id, name, description, start_date, end_date)
          VALUES (?, ?, ?, ?, ?)
      `);
    insertProject.run('project_001', 'My First Gantt Project', 'A sample project', new Date().toISOString(), new Date(Date.now() + 86400000 * 30).toISOString());

    const insertMember = db.prepare('INSERT INTO member (id, name) VALUES (?, ?)');
    insertMember.run(1, 'Alice');
    insertMember.run(2, 'Bob');
  }
};

export { db, initDb };
