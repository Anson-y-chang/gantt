import { type RoleLevelType, type Employee } from '@/types/project';

export enum ColumnType {
  Text = 'text',
  Money = 'money',
  Number = 'number',
  Date = 'date',
  Members = 'members',
  Choice = 'choice',
  Attachment = 'attachment'
}

type ColumnTypeMap = {
  [key: string]: string;
};

export const columnTypeMap: ColumnTypeMap = {
  [ColumnType.Text]: '文字',
  [ColumnType.Money]: '金額',
  [ColumnType.Number]: '數字',
  [ColumnType.Date]: '日期選擇',
  [ColumnType.Members]: '人員選擇',
  [ColumnType.Choice]: '選擇題',
  [ColumnType.Attachment]: '附件'
} as const;

export type WritablePermission = RoleLevelType.Admin | RoleLevelType.Editor | RoleLevelType.Replyer;

export type Attachment = {
  dlId: string; // 下載刪除時用
  file_id: string; // 關聯項目時用
  name: string;
  short_path: string;
  type: string;
};

interface BaseColumn<CT extends ColumnType, DT> {
  column_id: string;
  name: string;
  permission: Array<WritablePermission>;
  width: number;
  sort: number;
  is_show: boolean;
  amount_type: 'none' | 'sum' | 'max' | 'min' | 'avg';
  has_writable_permission: boolean;
  type: CT;
  data: Array<DT | null>;
  relation_info: {
    list_id: string;
    list_name: string;
    column_name: string;
  }[];
}

type TextColumn = BaseColumn<ColumnType.Text, string>;
type MoneyColumn = BaseColumn<ColumnType.Money, number>;
type NumberColumn = BaseColumn<ColumnType.Number, number>;
type DateColumn = BaseColumn<ColumnType.Date, Date | string>;
type MembersColumn = BaseColumn<ColumnType.Members, Employee | Employee[]> & {
  is_multi: boolean;
};
type ChoiceColumn = BaseColumn<ColumnType.Choice, string | string[]> & {
  is_multi: boolean;
  options: string[];
};
type AttachmentColumn = BaseColumn<ColumnType.Attachment, Attachment | Attachment[]> & {
  is_multi: boolean;
};

export type Column =
  | TextColumn
  | MoneyColumn
  | NumberColumn
  | DateColumn
  | MembersColumn
  | ChoiceColumn
  | AttachmentColumn;

export type ColumnDataType = Column['data'][number];

export type Row = {
  data_index: number;
  related_lists: string[];
};

export type List = {
  list_id: string;
  name: string;
  columns: Column[];
  rows: Row[];
};

export type ListSidebarItem = {
  list_id: string;
  name: string;
};

export type ListCreationType = 'blank' | 'material' | 'drawing';

export type Template = {
  type: 'material' | 'drawing';
  name: string;
  icon: string;
  columnNames: string[];
};

export type NewColumn = {
  column_id?: string;
  name: string;
  type: ColumnType;
  permission: Array<WritablePermission>;
  is_multi?: boolean;
  options?: string[];
  relate_column_id?: string;
};

export type ColumnSettings = {
  column_id: string;
  sort: number;
  is_show?: boolean;
  name?: string;
};

export type RelationInfo = {
  list_id: string;
  name: string;
  columns: (Pick<Column, 'column_id' | 'name' | 'type'> & {
    is_multi?: boolean;
    options?: string[];
  })[];
};
