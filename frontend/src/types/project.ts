export enum RoleLevelType {
  Admin = 1, // '管理者'
  Editor = 2, //  '編輯者'
  Replyer = 3, // '回覆者'
  Viewer = 4 // '檢視者'
}

type RoleLevel = {
  [key: number]: string;
};

export const roleLevelMap: RoleLevel = {
  [RoleLevelType.Admin]: '管理者',
  [RoleLevelType.Editor]: '編輯者',
  [RoleLevelType.Replyer]: '回覆者',
  [RoleLevelType.Viewer]: '檢視者'
} as const;

export type Employee = {
  employee_id: number;
  name: string;
  department: string;
  role_level?: RoleLevelType;
};

export enum ProjectStatus {
  InProgress = 1, // 進行中
  Completed = 2 // 已完成
}

export type RiskCoefficient = {
  existence_risk: number;
  schedule_delay: number;
};

export type Week = {
  name: string;
  is_work_day: boolean;
};

export type Column = {
  id: number;
  column_name: string;
  is_show: boolean;
  is_customized?: boolean;
  has_data?: boolean;
  sort: number;
};

export type ColumnData = {
  id: number;
  data: string | Employee[] | { start_date: string; end_date: string };
};

export type Project = {
  project_id: string;
  name: string;
  creator: Employee;
  status: ProjectStatus;
  members: Employee[];
  project_date: {
    start_date: string;
    end_date: string;
  };
  work_days_setting: Week[];
  columns: ColumnData[];
  can_modify: boolean;
};

export type ProjectFormData = {
  project_id?: string;
  name: string;
  creator?: Employee;
  status?: ProjectStatus;
  members: Employee[];
  project_date: {
    start_date: Date | null;
    end_date: Date | null;
  };
  risk_coefficient: RiskCoefficient;
  work_days_setting: Week[];
  columns?: ColumnData[];
  is_org?: boolean;
};

export type ProjectSubmitData = {
  project_id?: string;
  name: string;
  creator?: Employee;
  status?: ProjectStatus;
  members: Pick<Employee, 'employee_id'>[];
  project_date: {
    start_date: string | null;
    end_date: string | null;
  };
  risk_coefficient: RiskCoefficient;
  work_days_setting: Week[];
  columns?: ColumnData[];
  is_org?: boolean;
};

export type PermissionMembers = {
  permission_id: number;
  name: 'overview' | 'set_permission' | 'create_project' | 'modify_column_setting';
  members: Employee[];
};
