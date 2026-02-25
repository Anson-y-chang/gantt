export const Widget = {
  MyTasks: 'my_tasks',
  RecentlyDiscussedTasks: 'recently_discussed_tasks',
  TeamTasks: 'team_tasks',
  RecentlyModifiedLists: 'recently_modified_lists',
  Milestone: 'milestone',
  TaskProgress: 'task_progress'
} as const;

export type WidgetType = (typeof Widget)[keyof typeof Widget];

type TaskCount = {
  overdue: number;
  today?: number;
  three_days: number;
  this_week?: number;
};

type Task = {
  task_id: string;
  task_name: string;
  members: {
    employee_id: number;
    name: string;
    department: string;
  }[];
  due_date: string;
};

export type MyTasksData = {
  project_id: string;
  project_name: string;
  tasks: Task[];
  incomplete_tasks_count: number;
}[];

export type RecentlyDiscussedTasksData = {
  project_id: string;
  project_name: string;
  task_id: string;
  comment_id: number;
  discussion_id: string;
  author: string;
  message: string;
  created_at: string;
}[];

export type TeamTasksData = {
  project_id: string;
  project_name: string;
  tasks: Task[];
  incomplete_tasks_count: number;
}[];

export type RecentlyModifiedListsData = {
  project_id: string;
  project_name: string;
  list_id: string;
  list_name: string;
  modify_date: string;
  modify_by: string;
  indices: number[];
}[];

export type MilestoneData = {
  project_id: string;
  project_name: string;
  milestone_id: string;
  milestone_name: string;
  due_date: string;
}[];

export type TaskProgressData = {
  project_id: string;
  project_name: string;
  status: 'normal' | 'warning' | 'danger';
  current_progress: number;
  target_progress: number;
}[];

export type WidgetData = {
  name: WidgetType;
  task_count?: TaskCount;
  data:
    | MyTasksData
    | RecentlyDiscussedTasksData
    | TeamTasksData
    | RecentlyModifiedListsData
    | MilestoneData
    | TaskProgressData;
  cursor?: string | null;
};

export type DiscussedTaskFilterParams = {
  startDate?: Date | null;
  endDate?: Date | null;
  projectIds?: string[];
  memberIds?: number[];
  isOnlyMyTasks?: boolean;
};
