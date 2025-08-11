<template>
  <div id="schedule" class="flex h-full w-full flex-col">
    <Toast position="top-center" />
    <SpinnerLoader v-if="store.isFetching" />
    <!-- tab -->
    <div class="w-full h-9 border-b border-light pl-6">
      <div
        class="w-fit h-full px-3 py-1 text-primary font-bold border-b-2 border-primary cursor-pointer"
      >
        甘特圖
      </div>
    </div>
    <!-- setting -->
    <div
      class="w-full h-16 px-6 flex shrink-0 items-center justify-between border-b border-light"
    >
      <!-- left item -->
      <div class="flex gap-4">
        <Button
          class="p-2 flex items-center gap-1 hover:bg-[#f1f5f9]"
          @click="openViewTab"
        >
          <img :src="view2Icon" alt="view2" class="inline-block w-7" />
          <span>檢視</span>
        </Button>
        <OverlayPanel
          ref="viewTab"
          :pt="{
            root: {
              class: [
                'border w-[140px] h-[84px] shadow-sm text-sm overflow-hidden -translate-y-2',
              ],
            },
            content: { style: { padding: '0px' }, class: ['relative'] },
            closeButton: {
              class: [
                'scale-[0.875] -translate-x-0.5 translate-y-[2px] outline-none z-10 hover:bg-primary-200',
              ],
            },
          }"
        >
          <div class="w-full h-[42px] flex items-center px-3 py-2 gap-2">
            <input
              v-model="store.viewSetting.order"
              type="checkbox"
              id="order"
              class="cursor-pointer"
            />
            <label for="order" class="flex-1 text-base cursor-pointer"
              >行數</label
            >
          </div>
          <div class="w-full h-[42px] flex items-center px-3 py-2 gap-2">
            <input
              v-model="store.viewSetting.wbs"
              type="checkbox"
              id="wbs"
              class="cursor-pointer"
            />
            <label for="wbs" class="flex-1 text-base cursor-pointer"
              >WBS 編碼</label
            >
          </div>
        </OverlayPanel>
        <Button
          class="p-2 flex items-center gap-1 hover:bg-[#f1f5f9]"
          @click="openFilterTab"
        >
          <img :src="filterIcon" alt="view2" class="inline-block w-5" />
          <span>篩選</span>
        </Button>
        <OverlayPanel
          ref="filterTab"
          :pt="{
            root: {
              class: [
                'border w-[140px] h-[84px] shadow-sm text-sm overflow-hidden -translate-y-2',
              ],
            },
            content: { style: { padding: '0px' }, class: ['relative'] },
            closeButton: {
              class: [
                'scale-[0.875] -translate-x-0.5 translate-y-[2px] outline-none z-10 hover:bg-primary-200',
              ],
            },
          }"
        >
          <form>
            <div class="w-full h-[42px] flex items-center px-3 py-2 gap-2">
              <input
                v-model="store.filterSelf"
                type="radio"
                id="all"
                name="filter"
                :value="false"
                class="cursor-pointer"
              />
              <label for="all" class="flex-1 text-base cursor-pointer"
                >所有人</label
              >
            </div>
            <div class="w-full h-[42px] flex items-center px-3 py-2 gap-2">
              <input
                v-model="store.filterSelf"
                type="radio"
                id="self"
                name="filter"
                :value="true"
                class="cursor-pointer"
              />
              <label for="self" class="flex-1 text-base cursor-pointer"
                >自己</label
              >
            </div>
          </form>
        </OverlayPanel>
      </div>
      <!-- right item -->
      <SplitButton
        label="查看專案成員"
        :model="items"
        pt:root:class="border border-light h-[40px] my-split-button"
        pt:menu:class="min-w-[168px]"
        @click="showMemberModal = true"
      >
      </SplitButton>
      <Dialog
        v-model:visible="showMemberModal"
        modal
        header="專案成員"
        :style="{ width: '25rem' }"
        dismissableMask
      >
        <div class="mb-6 flex flex-col gap-2">
          <div class="font-bold">專案建立者</div>
          <div
            class="rounded bg-slate-500 w-max px-2 py-1 whitespace-nowrap text-white"
          >
            {{ "creator.name" }}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="font-bold">專案成員</div>
          <div class="flex flex-row flex-wrap gap-2">
            <div
              v-for="member in props.members"
              :key="member.employee_id"
              class="rounded bg-slate-500 w-max px-2 py-1 whitespace-nowrap text-white"
            >
              {{ member.name }}
            </div>
          </div>
        </div>
      </Dialog>
      <Dialog
        v-model:visible="showExportModal"
        modal
        header="匯出"
        :style="{ width: '25rem' }"
        dismissableMask
      >
        <div class="flex flex-col gap-6">
          <div class="text-gray-500">請選擇要匯出的左側欄位資吋</div>
          <div class="flex gap-2">
            <input id="date" type="checkbox" class="cursor-pointer" />
            <label for="date" class="flex-1 cursor-pointer">開始、結束日</label>
          </div>
          <div class="flex gap-2">
            <input id="duration" type="checkbox" class="cursor-pointer" />
            <label for="duration" class="flex-1 cursor-pointer">天數</label>
          </div>
          <div class="flex gap-2">
            <input id="completion" type="checkbox" class="cursor-pointer" />
            <label for="completion" class="flex-1 cursor-pointer">完成率</label>
          </div>
        </div>
        <template #footer>
          <Button
            class="border px-3 py-2 mr-2 hover:bg-secondary"
            @click="showExportModal = false"
            >取消</Button
          >
          <Button
            class="border px-3 py-2 bg-[#0e6d97] hover:bg-primary-800 text-white"
            @click="showExportModal = false"
          >
            <!-- <router-link to="/" target="_blank">匯出</router-link> -->
          </Button>
        </template>
      </Dialog>
    </div>
    <!-- content -->
    <div class="flex h-0 w-full grow">
      <!-- list -->
      <div
        ref="listContainer"
        class="flex flex-col border-r border-light text-sm relative min-w-[864px]"
        style="width: 864px"
      >
        <!-- title -->
        <div class="h-12 border-b border-light"></div>
        <div class="flex list-row">
          <div v-if="store.viewSetting.order" class="w-[41px]"></div>
          <div class="w-[69px]"></div>
          <div class="text-left font-normal grow">任務名稱</div>
          <div class="text-left font-normal w-[107px]">開始日</div>
          <div class="text-left font-normal w-[107px]">結束日</div>
          <div class="text-left font-normal w-[86px]">天數</div>
          <div class="text-left font-normal w-[107px]">成員</div>
          <div class="text-left font-normal w-[86px]">完成率</div>
        </div>
        <!-- body -->
        <div
          ref="listBody"
          class="overflow-x-hidden overflow-y-auto flex-1"
          style="scrollbar-width: none"
          @scroll="scrollRight"
        >
          <div
            class="flex list-row hover:bg-secondary"
            :class="{
              'bg-slate-100/50': project.isHovered,
              '!bg-primary-50':
                project.id && project.id === store.selectedRowId,
            }"
            @mouseenter="project.isHovered = true"
            @mouseleave="project.isHovered = false"
          >
            <div v-if="store.viewSetting.order" class="w-[41px]"></div>
            <div class="w-[69px]"></div>
            <div class="grow flex gap-1 w-0">
              <div class="truncate">{{ projectName }}</div>
            </div>
            <div class="w-[107px]">
              {{
                project.start_date instanceof Date
                  ? project.start_date.toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : ""
              }}
            </div>
            <div class="w-[107px]">
              {{
                project.end_date instanceof Date
                  ? project.end_date.toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : ""
              }}
            </div>
            <div class="w-[86px]">
              {{
                project.duration_in_days ? project.duration_in_days + "天" : ""
              }}
            </div>
            <div class="w-[107px]"></div>
            <div class="w-[86px]">
              <div class="p-1">{{ project.finished_percentage + "%" }}</div>
            </div>
          </div>
          <draggable
            :list="project.sections"
            v-bind="{
              animation: 200,
              group: 'sections',
              disabled: false,
              ghostClass: 'ghost',
            }"
            @start="dragSection = true"
            @end="dragSection = false"
            item-key="id"
            handle=".sectionHandle"
            :disabled="someSectionIdIsIsNotPrepared"
          >
            <template #item="{ element, index }">
              <RowGroup
                :data="element"
                :rowIndex="index.toString()"
                :workDays
                :members
                :parent_id="project.id"
                :isShow="true"
              ></RowGroup>
            </template>
          </draggable>
          <div class="mt-2 h-14">
            <Button
              class="h-9 ml-[76px] p-2 flex items-center cursor-pointer select-none hover:bg-primary-200"
              @click="addSection"
            >
              <img
                :src="addIcon"
                alt="add_task"
                class="inline-block mr-2 w-4"
              />
              <span>新增群組</span>
            </Button>
          </div>
        </div>
        <div
          class="absolute top-0 -right-1 w-2 h-full z-20 cursor-col-resize"
          :class="{ 'bg-primary-200': isResizing }"
          @mousedown="startResize"
        ></div>
      </div>
      <!-- Gantt -->
      <GanttDiagram @scroll="scrollLeft" :workDays :dateTime></GanttDiagram>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  watch,
  computed,
  watchEffect,
  onBeforeUnmount,
} from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { nanoid } from "nanoid";
import type { Project, Section, Task, Milestone } from "@/types/schedule";
import { countWorkDays } from "@/utils/schedule";
import RowGroup from "@/components/schedule/RowGroup.vue";
import GanttDiagram from "@/components/schedule/GanttDiagram.vue";
import draggable from "vuedraggable";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import SpinnerLoader from "@/components/common/SpinnerLoader.vue";
import { useDebounceFn } from "@vueuse/core";

// icon
const view2Icon = new URL("@/assets/icons/view2.svg", import.meta.url).href;
const filterIcon = new URL("@/assets/icons/filter.svg", import.meta.url).href;
const addIcon = new URL("@/assets/icons/add.svg", import.meta.url).href;

// init
const { project } = useScheduleStore();
const store = useScheduleStore();
// const authStore = useAuthStore();
const props = defineProps<{
  currentUserRole: number;
  projectId: string;
  workDays: {
    is_work_day: boolean;
    name: string;
  }[];
  members: {
    department: string;
    employee_id: number;
    is_builder: boolean;
    name: string;
    role_level: number;
  }[];
  dateTime: {
    start_date: Date;
    end_date: Date;
  };
  projectName: string;
  creator: {
    department: string;
    employee_id: number;
    is_builder: boolean;
    name: string;
    role_level: number;
  };
}>();
const toast = useToast();
const someSectionIdIsIsNotPrepared = computed(() => {
  return project.sections.some((el) => el.id.startsWith("temp"));
});

const requestUnsavedWarning = (event: Event) => {
  // 自訂提醒訊息
  if (store.requestCounter) {
    var message = "你有尚未儲存的變更，確定要離開嗎？";
    // @ts-ignore: Suppress deprecated warning
    event.returnValue = message; // 標準瀏覽器
    return message; // 針對一些老舊的瀏覽器
  }
};

onMounted(async () => {
  // try {
  //   const data = await fetchSchedule(props.projectId);
  //   const sections = data.schedule.map((el: any) => {
  //     return { ...el, type: "section" };
  //   });
  //   Object.assign(store.project, {
  //     name: data.name,
  //     start_date: undefined,
  //     end_date: undefined,
  //     duration_in_days: undefined,
  //     members: [],
  //     completion: 0,
  //     id: data.id,
  //     type: "project",
  //     sections: [...sections],
  //     status: 0,
  //     is_org: false,
  //     company_id: 1,
  //   });
  //   window.addEventListener("beforeunload", requestUnsavedWarning);
  //   store.authLevel = props.currentUserRole;
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "撈取失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  // }
  // 監聽 event
  // await initializeEcho();
  // window.Echo.private(`schedule.${props.projectId}`).listen(
  //   ".task.changed",
  //   function (e: any) {
  //     // 自己廣播的內容不處理
  //     if (e.request.user_id == authStore.currentEmployeeId) return;
  //     // 單一任務更新
  //     if (e.request.task_id) {
  //       // 更新節點位置
  //       if ("parent_id" in e.request.data) {
  //         const newParentInfo = store.hashTable.get(e.request.data.parent_id);
  //         const targetInfo = store.hashTable.get(e.request.task_id);
  //         if (!newParentInfo || !targetInfo) return;
  //         const newParentIndex = newParentInfo.index.split("-");
  //         let newParentNode: Project | Section | Task = store.project;
  //         for (let i = 1; i < newParentIndex.length; i++) {
  //           if (i == 1) {
  //             newParentNode = store.project.sections[
  //               Number(newParentIndex[i])
  //             ] as Section;
  //           } else {
  //             newParentNode = (newParentNode as Section | Task).tasks[
  //               Number(newParentIndex[i])
  //             ] as Task;
  //           }
  //         }
  //         const originalParentIndex = targetInfo.index.split("-").slice(0, -1);
  //         const nodeIndex = targetInfo.index.split("-");
  //         let originalParentNode: Project | Section | Task = store.project;
  //         let node: Project | Section | Task | Milestone = store.project;
  //         for (let i = 1; i < originalParentIndex.length; i++) {
  //           if (i == 1) {
  //             originalParentNode = store.project.sections[
  //               Number(originalParentIndex[i])
  //             ] as Section;
  //             node = store.project.sections[
  //               Number(originalParentIndex[i])
  //             ] as Section;
  //           } else {
  //             originalParentNode = (originalParentNode as Section | Task).tasks[
  //               Number(originalParentIndex[i])
  //             ] as Task;
  //             node = (node as Section | Task).tasks[
  //               Number(originalParentIndex[i])
  //             ] as Task;
  //           }
  //         }
  //         node = (originalParentNode as Section | Task).tasks[
  //           Number(nodeIndex[nodeIndex.length - 1])
  //         ] as Task | Milestone;
  //         (originalParentNode as Section | Task).tasks.splice(
  //           Number(nodeIndex[nodeIndex.length - 1]),
  //           1
  //         );
  //         if ("before" in e.request.data) {
  //           const beforeIndex = (
  //             newParentNode as Section | Task
  //           ).tasks.findIndex((el) => el.id == e.request.data.before);
  //           (newParentNode as Section | Task).tasks.splice(
  //             beforeIndex,
  //             0,
  //             node
  //           );
  //         } else if ("after" in e.request.data) {
  //           const afterIndex =
  //             (newParentNode as Section | Task).tasks.findIndex(
  //               (el) => el.id == e.request.data.after
  //             ) + 1;
  //           (newParentNode as Section | Task).tasks.splice(afterIndex, 0, node);
  //         } else {
  //           (newParentNode as Section | Task).tasks.push(node);
  //         }
  //       }
  //       // 更新基礎屬性
  //       else {
  //         // 取得更新節點
  //         const targetInfo = store.hashTable.get(e.request.task_id);
  //         if (!targetInfo) return;
  //         const index = targetInfo.index.split("-");
  //         let node: Project | Section | Task | Milestone = store.project;
  //         for (let i = 1; i < index.length; i++) {
  //           if (i == 1) {
  //             node = store.project.sections[Number(index[i])] as Section;
  //           } else {
  //             node = (node as Section | Task).tasks[Number(index[i])] as
  //               | Task
  //               | Milestone;
  //           }
  //         }
  //         const row = e.request.data;
  //         Object.keys(row).forEach((key) => {
  //           if (key == "id") {
  //             return;
  //           } else if (key == "start_date" || key == "end_date") {
  //             node[key] = new Date(row[key] as Date);
  //           } else if (key == "assignees") {
  //             if (node.type == "task" || node.type == "milestone") {
  //               node[key] = row[key].map((el: number) => ({ id: el }));
  //             }
  //           } else {
  //             (node as any)[key] = (row as any)[key];
  //           }
  //         });
  //       }
  //     }
  //     // 複數任務更新
  //     else {
  //       e.request.data.forEach((row: any) => {
  //         // 取得更新節點
  //         const targetInfo = store.hashTable.get(row.id);
  //         if (!targetInfo) return;
  //         const index = targetInfo.index.split("-");
  //         let node: Project | Section | Task | Milestone = store.project;
  //         for (let i = 1; i < index.length; i++) {
  //           if (i == 1) {
  //             node = store.project.sections[Number(index[i])] as Section;
  //           } else {
  //             node = (node as Section | Task).tasks[Number(index[i])] as
  //               | Task
  //               | Milestone;
  //           }
  //         }
  //         // 更新基礎屬性
  //         Object.keys(row).forEach((key) => {
  //           if (key == "id") {
  //             return;
  //           } else if (key == "start_date" || key == "end_date") {
  //             node[key] = new Date(row[key] as Date);
  //           } else if (key == "assignees") {
  //             if (node.type == "task" || node.type == "milestone") {
  //               node[key] = row[key].map((el: number) => ({ id: el }));
  //             }
  //           } else {
  //             (node as any)[key] = (row as any)[key];
  //           }
  //         });
  //       });
  //     }
  //   }
  // );
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", requestUnsavedWarning);

  // 清空 store
  Object.assign(store.project, {
    name: "",
    start_date: undefined,
    end_date: undefined,
    duration_in_days: undefined,
    members: [],
    completion: 0,
    id: "",
    type: "project",
    sections: [],
    status: 0,
    is_org: false,
    company_id: 1,
  });

  store.authLevel = 4;
});

const addSection = async (): Promise<void> => {
  const tempId = "temp" + nanoid();
  project.sections.push({
    id: tempId,
    type: "section",
    name: "群組",
    start_date: undefined,
    end_date: undefined,
    duration_in_days: undefined,
    finished_percentage: 0,
    tasks: [],
    is_collapsed: false,
    description: "",
    todos: [],
    isHovered: false,
    height: 1,
    occupiedRow: 1,
    isAssignedToCurrentUser: false,
  });

  store.selectedRowId = tempId;
};

const dragSection = ref<boolean>(false);

// 監聽 projectSequence 用於計算拖曳預覽位置
const orderedList = computed(() => {
  let list: {
    id: string;
    name: string;
    type: "section" | "task" | "milestone";
    ownTasks: boolean;
  }[] = [];
  const pushList = (item: Section | Task | Milestone) => {
    if (item.type == "section") {
      list.push({
        id: item.id,
        name: item.name,
        type: item.type,
        ownTasks: true,
      });
      (item as Section | Task).tasks.forEach((el) => pushList(el));
    } else if (item.type == "task") {
      list.push({
        id: item.id,
        name: item.name,
        type: item.type,
        ownTasks: item.tasks.length > 0,
      });
      (item as Section | Task).tasks.forEach((el) => pushList(el));
    } else {
      list.push({
        id: item.id,
        name: item.name,
        type: item.type,
        ownTasks: false,
      });
    }
  };
  project.sections.forEach((el) => pushList(el));

  return list;
});

watch(
  () => orderedList.value,
  () => {
    store.projectSequence = orderedList.value;
  }
);

// set view width
const listContainer = ref<HTMLDivElement>();
const originalWidth = ref<number>(0);
const isResizing = ref<boolean>(false);
const offsetX = ref<number>(0);

const startResize = (e: MouseEvent): void => {
  e.preventDefault();
  e.stopPropagation();
  originalWidth.value = Number(listContainer.value?.style.width.split("px")[0]);
  isResizing.value = true;
  offsetX.value = e.clientX;
  document.body.style.cursor = "col-resize";
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", endResize);
};

const resize = (e: MouseEvent): void => {
  if (isResizing.value && listContainer.value) {
    // 最小限制 864px
    if (e.clientX - offsetX.value + originalWidth.value <= 864) {
      listContainer.value.style.width = "864px";
      return;
    }
    // 最大不得超過視窗的 0.8 倍
    if (
      e.clientX - offsetX.value + originalWidth.value >=
      window.innerWidth * 0.8
    ) {
      listContainer.value.style.width = `${window.innerWidth * 0.8}px`;
      return;
    }
    listContainer.value.style.width = `${
      e.clientX - offsetX.value + originalWidth.value
    }px`;
  }
};

const endResize = () => {
  isResizing.value = false;
  document.body.style.cursor = "default";
  document.removeEventListener("mousemove", resize);
  document.removeEventListener("mouseup", endResize);
};

// setting - left
const viewTab = ref();
const filterTab = ref();
const openViewTab = (event: Event): void => {
  viewTab.value.toggle(event);
};
const openFilterTab = (event: Event): void => {
  filterTab.value.toggle(event);
};

// setting - right
const showMemberModal = ref<boolean>(false);
const showExportModal = ref<boolean>(false);
const items = [
  {
    label: "匯出 PDF",
    command: () => {
      showExportModal.value = true;
    },
  },
];

// scroll
const listBody = ref<HTMLDivElement>();
const scrollRight = (event: Event): void => {
  const target = event.target as HTMLElement;
  const GanttScrollPanel = document.getElementById(
    "GanttScrollPanel"
  ) as HTMLDivElement;
  GanttScrollPanel.scrollTop = target.scrollTop;
};
const scrollLeft = (scrollTop: number): void => {
  const body = listBody.value as HTMLDivElement;
  body.scrollTop = scrollTop;
};

// date and duration
const computedStartDate = computed((): Date | undefined => {
  if (!project.sections) return;
  return project.sections.reduce((min: Date | undefined, cur) => {
    if (!(cur.start_date instanceof Date) || !(cur.end_date instanceof Date)) {
      return min;
    } else {
      if (min === undefined) {
        return cur.start_date;
      } else {
        return cur.start_date.getTime() < min.getTime() ? cur.start_date : min;
      }
    }
  }, undefined);
});
const computedEndDate = computed((): Date | undefined => {
  if (!project.sections) return;
  return project.sections.reduce((max: Date | undefined, cur) => {
    if (!(cur.start_date instanceof Date) || !(cur.end_date instanceof Date)) {
      return max;
    } else {
      if (max === undefined) {
        return cur.end_date;
      } else {
        return cur.end_date.getTime() > max.getTime() ? cur.end_date : max;
      }
    }
  }, undefined);
});

watchEffect(() => {
  project.start_date = computedStartDate.value;
});
watchEffect(() => {
  project.end_date = computedEndDate.value;
});
watchEffect(() => {
  if (project.start_date && project.end_date) {
    project.duration_in_days = countWorkDays(
      project.start_date,
      project.end_date,
      props.workDays
    );
  } else {
    project.duration_in_days = 0;
  }
});

// completion
watchEffect(() => {
  if (!project.sections) return;

  const completedDays = project.sections.reduce((sum, cur) => {
    if (typeof cur.finished_percentage == "object") {
      return sum + cur.finished_percentage.completedDays;
    }
    return sum;
  }, 0);
  const totalDays = project.sections.reduce((sum, cur) => {
    if (typeof cur.finished_percentage == "object") {
      return (
        sum +
        (
          cur.finished_percentage as {
            completedDays: number;
            totalDays: number;
          }
        ).totalDays
      );
    }
    return sum;
  }, 0);
  const finished_percentage = totalDays
    ? Math.round((completedDays / totalDays) * 100)
    : 0;
  project.finished_percentage = finished_percentage;
});

// 自動更新日期區間
watch(
  () => [project.start_date, project.end_date],
  () => {
    // 當 project 被設定在在原始日期區間外時
    if (project.start_date) {
      if (project.start_date.getTime() < props.dateTime.start_date.getTime()) {
        debouncedUpdateFormDate("left");
      }
    }

    if (project.end_date) {
      if (project.end_date.getTime() > props.dateTime.end_date.getTime()) {
        debouncedUpdateFormDate("right");
      }
    }
  }
);

const debouncedUpdateFormDate = useDebounceFn((param: "left" | "right") => {
  store.shouldUpdateFormDate = param;
}, 500);

// 更新 DB 任務完成率
watch(
  () => project.finished_percentage,
  () => {
    const deepCopyOfProjectId: string = JSON.parse(JSON.stringify(project.id));
    debouncedUpdateProjectCompletionAPI(
      deepCopyOfProjectId,
      project.finished_percentage
    );
  }
);

const debouncedUpdateProjectCompletionAPI = useDebounceFn(
  (deepCopyOfProjectId: string, finished_percentage: number) => {
    // updateProjectCompletion(deepCopyOfProjectId, finished_percentage);
  },
  500
);
</script>

<style scoped>
.list-row > :nth-child(2) {
  padding-left: 24px;
}

.list-row > :not(:first-child) {
  border-left: 1px #d0d5dd solid;
}

input[type="checkbox"]:checked {
  accent-color: #0b95d0;
}
</style>
