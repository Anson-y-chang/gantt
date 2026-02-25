import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import {
  type Section,
  type Task,
  type Milestone,
  type Project,
} from "@/types/schedule";

interface viewSetting {
  order: boolean;
  wbs: boolean;
}

export const useScheduleStore = defineStore("schedule", {
  state() {
    const project = reactive<Project>({
      sections: [],
      id: "",
      type: "project",
      status: 0,
      is_org: false,
      company_id: 0,
      finished_percentage: 0,
      name: "",
      start_date: undefined,
      end_date: undefined,
      duration_in_days: undefined,
      description: "",
      todos: [],
      isHovered: false,
      height: 1,
      occupiedRow: 1,
    }); // 巢狀任務資訊列表
    const authLevel = ref<number>(0); // 權限等級
    const projectSequence = reactive<
      {
        id: string;
        name: string;
        type: "section" | "task" | "milestone";
        ownTasks: boolean;
      }[]
    >([]); // 列表任務順序表
    const hashTable = reactive<
      Map<
        string,
        {
          index: string;
          start_date: Date | undefined;
          end_date: Date | undefined;
          type: "task" | "milestone" | "section";
          ownTasks: boolean;
          isShow: boolean;
          height: number;
        }
      >
    >(new Map()); // 哈希任務表用於快速查找依賴任務資訊
    const selectedRowId = ref<string>(""); // 當前選取任務編號
    const hoveredRowId = ref<string>(""); // 當前hover任務編號
    const isDragging = ref<"Section" | "Others" | undefined>(); // 拖曳動作中，分 Section 跟 Others(Task | Milestone)
    const dragData = ref<Section | Task | Milestone>(); // 拖曳物件資訊
    const dragTrace = ref<string[]>([]); // 拖曳物件追蹤編號
    const lastShowRowsStatus = ref<boolean>(true); // 保留拖曳前狀態
    const dragoverId = ref<string>(""); // dragover 物件ID
    const dragoverTrace = ref<string[]>([]); // dragover 物件追蹤編號
    const dragoverPosition = ref<"top" | "middle" | "bottom" | undefined>(); // 處於 dragover 物件的上中下部
    const viewSetting = reactive<viewSetting>({ order: false, wbs: false }); // 視圖是否開啟順序編碼及WBS編碼
    const filterSelf = ref<boolean>(false); // 篩選條件
    const currentSettingGanttCellId = ref<string>(""); // 當前拖動日期設定中的 row id
    const isAddingDependencyOrSubsequence = ref<
      "dependency" | "subsequence" | undefined
    >(undefined); // 是否正在新增依存關係
    const expectedDependentTargetInfo = ref<{
      isSet: boolean;
      type: "task" | "milestone" | undefined;
      left: number;
      top: number;
      width: number;
      height: number;
    }>({ isSet: false, type: undefined, left: 0, top: 0, width: 0, height: 0 }); // 依賴目標的資訊
    const originalDependencyTrace = ref<string[]>([]); // 依賴主體追蹤編號
    const originalDependencyId = ref<string>(""); // 依賴主體追蹤 Id
    const subsequencesMovingDistanceHashTable = reactive<Map<string, number>>(
      new Map()
    ); // 任務哈希表用於計算推移依
    const requestCounter = ref<number>(0); // 當前已發出未完成 request 數量
    const enableUpdateMultiTasks = ref<boolean>(false); // 開啟
    const updatedDateList = reactive<
      Map<
        string,
        { id: string; start_date: Date | undefined; end_date: Date | undefined }
      >
    >(new Map()); // 日期更新表
    const isSettingGanttBlock = ref<boolean>(false);
    const scrollPanelLeft = ref<number>(0);
    const scrollPanelWidth = ref<number>(0);
    const scrollPanelTop = ref<number>(0);
    const scrollPanelHeight = ref<number>(0);
    const deletedRowId = ref<string>("");
    const isFetching = ref<boolean>(false);
    const inheritInfo = reactive<{
      parentId: string;
      childId: string;
    }>({
      parentId: "",
      childId: "",
    });
    const shouldUpdateFormDate = ref<"left" | "right" | "">("");
    const dateRange: { start_date: Date; end_date: Date } = {
      start_date: new Date(),
      end_date: new Date(),
    };

    return {
      project,
      authLevel,
      projectSequence,
      hashTable,
      selectedRowId,
      hoveredRowId,
      isDragging,
      dragData,
      dragTrace,
      lastShowRowsStatus,
      dragoverId,
      dragoverTrace,
      dragoverPosition,
      viewSetting,
      filterSelf,
      currentSettingGanttCellId,
      isAddingDependencyOrSubsequence,
      expectedDependentTargetInfo,
      originalDependencyTrace,
      originalDependencyId,
      subsequencesMovingDistanceHashTable,
      requestCounter,
      enableUpdateMultiTasks,
      updatedDateList,
      isSettingGanttBlock,
      scrollPanelLeft,
      scrollPanelWidth,
      scrollPanelTop,
      scrollPanelHeight,
      deletedRowId,
      isFetching,
      inheritInfo,
      shouldUpdateFormDate,
      dateRange,
    };
  },
});
