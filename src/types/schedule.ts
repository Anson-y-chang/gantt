interface Row {
  name: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  duration_in_days: number | undefined;
  description: string;
  todos: Array<{ isFinished: boolean; value: string; id: string }>;
  isHovered: boolean;
}

interface Member {
  id: number;
}

export interface Project extends Row {
  sections: Array<Section>;
  id: string;
  type: 'project';
  status: number;
  is_org: boolean;
  company_id: number;
  finished_percentage: number;
  occupiedRow: number;
  height: number;
}

export interface Section extends Row {
  id: string;
  type: 'section';
  tasks: Array<Task | Milestone>;
  finished_percentage: { completedDays: number; totalDays: number } | number; // tasks.length > 0, 前者服務計算, else, 後者服務用戶輸入
  is_collapsed: boolean;
  occupiedRow: number;
  height: number;
  isAssignedToCurrentUser: boolean;
}

export interface Task extends Row {
  id: string;
  type: 'task';
  assignees: Array<Member>;
  tasks: Array<Task | Milestone>;
  finished_percentage: { completedDays: number; totalDays: number } | number; // tasks.length > 0, 前者服務計算, else, 後者服務用戶輸入
  is_collapsed: boolean;
  dependencies: Array<string>;
  subsequences: Array<string>;
  occupiedRow: number;
  height: number;
  isAssignedToCurrentUser: boolean;
}

export interface Milestone extends Row {
  id: string;
  type: 'milestone';
  assignees: Array<Member>;
  finished_percentage: boolean;
  dependencies: Array<string>;
  subsequences: Array<string>;
  is_collapsed: false;
  occupiedRow: 1;
  height: number;
  isAssignedToCurrentUser: boolean;
}

export interface Comment {
  commented_by: number;
  content: string;
  created_at: string;
  deleted_at: string | null;
  files: any[];
  id: string;
  task_id: string;
  updated_at: string;
  isEditing: boolean | undefined;
}
