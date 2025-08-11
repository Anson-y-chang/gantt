<template>
  <!-- project -->
  <template v-if="data.type == 'project'">
    <div
      class="absolute h-12 w-full border-y border-transparent z-10"
      :class="{
        '!border-light bg-slate-100/50': data.isHovered,
        '!border-light !bg-primary-50':
          store.selectedRowId && store.selectedRowId == data.id,
        'pointer-events-none':
          (store.selectedRowId && !isSelected) || // 其他人被選擇中
          store.isAddingDependencyOrSubsequence,
      }"
      :style="{
        top: '0px',
      }"
      @mouseenter="currentData.isHovered = true"
      @mouseleave="currentData.isHovered = false"
    >
      <div
        ref="ganttBlock"
        class="absolute h-6 rounded bg-primary ganttBlock"
        :class="{
          'cursor-grab': !store.isAddingDependencyOrSubsequence,
        }"
        :style="{
          width: blockWidth + 'px',
          top: '12px',
          left: leftDistance + 'px',
          ...styleInfo,
        }"
        @mousedown="cloneGanttBlock($event, 'move')"
      ></div>
    </div>
    <GanttGroup
      v-for="(task, index) in data.sections"
      :key="task.id"
      :data="task"
      :rowIndex="rowIndex + '-' + index"
      :startDate="startDate"
      :totalDays
      :workDays
      :parentIsMoving="isMoving"
      :parentMovingDistance="movingDistance"
      :isShow="!store.filterSelf || task.isAssignedToCurrentUser"
    ></GanttGroup>
  </template>
  <!-- section or task that own task -->
  <template v-else-if="ownTasks">
    <div
      v-show="isShow"
      class="absolute h-12 w-full border-y border-transparent z-10 opacity-65 hover:opacity-100"
      :class="{
        '!border-light bg-slate-100/50': data.isHovered,
        '!border-light !bg-primary-50': store.selectedRowId == data.id,
        'pointer-events-none':
          (store.selectedRowId && !isSelected) || // 其他人被選擇中
          store.isAddingDependencyOrSubsequence,
      }"
      :style="{
        top: data.height * 48 + 'px',
      }"
      @mouseenter="currentData.isHovered = true"
      @mouseleave="currentData.isHovered = false"
    >
      <div
        v-if="isNearToView || isMoving"
        ref="ganttBlock"
        class="absolute h-3 rounded bg-light ganttBlock"
        :class="{
          '!h-6': (data as Section | Task).type == 'section',
          'cursor-grab': !store.isAddingDependencyOrSubsequence 
        }"
        :style="{
          width: blockWidth + 'px',
          top: (data as Section | Task).type == 'section' ? '12px' : '18px',
          left: leftDistance + 'px',
          ...styleInfo
        }"
        @mousedown="cloneGanttBlock($event, 'move')"
      ></div>
    </div>
    <GanttGroup
      v-for="(task, index) in (data as Section | Task).tasks"
      :key="task.id"
      :data="task"
      :rowIndex="rowIndex + '-' + index"
      :startDate="startDate"
      :totalDays
      :workDays
      :parentIsMoving="isMoving"
      :parentMovingDistance="movingDistance"
      :isShow="
        !(data as Section | Task).is_collapsed &&
        isShow &&
        (!store.filterSelf || task.isAssignedToCurrentUser)
      "
    ></GanttGroup>
  </template>
  <!-- milestone -->
  <template v-else-if="data.type == 'milestone'">
    <div
      v-if="!showCell"
      v-show="isShow"
      class="absolute h-12 w-full border-y border-transparent cursor-pointer z-10"
      :class="{
        '!border-light bg-slate-100/50': data.isHovered,
        'pointer-events-none':
          (store.selectedRowId && !isSelected) || // 其他人被選擇中
          store.isAddingDependencyOrSubsequence,
      }"
      :style="{
        top: data.height * 48 + 'px',
      }"
      @mouseenter="createPreviewMilestoneBlock"
      @mouseleave="removePreviewMilestoneBlock"
      @mousemove="movePreviewMilestoneBlock"
      @click="setMilestoneDate"
    ></div>
    <template v-else>
      <div
        v-show="isShow"
        class="absolute h-12 w-full border-y border-transparent z-10"
        :class="{
          '!border-light !bg-primary-50': isSelected,
          '!border-light bg-slate-100/50':
            !store.selectedRowId &&
            !store.isAddingDependencyOrSubsequence &&
            data.isHovered,
          'pointer-events-none': store.selectedRowId && !isSelected, // 其他人被選擇中
        }"
        :style="{
          top: data.height * 48 + 'px',
        }"
        @mouseenter="currentData.isHovered = true"
        @mouseleave="currentData.isHovered = false"
      >
        <div
          v-if="isNearToView || isMoving"
          ref="ganttBlock"
          class="absolute w-[22px] h-[22px] rotate-45 rounded bg-orange-200 border border-orange-500 flex items-center justify-center ganttBlock"
          :class="{
            'cursor-move': store.isAddingDependencyOrSubsequence,
            'group/bg': !store.isAddingDependencyOrSubsequence,
          }"
          :style="{
            top: '12px',
            left: leftDistance + 'px',
            ...styleInfo,
          }"
          @mouseenter="showPreviewDependencyOrSubSequenceLine"
          @mouseleave="hidePreviewDependencyOrSubSequenceLine"
          @mousedown="cloneGanttBlock($event, 'move')"
          @mouseup="setDependencyOrSubsequence"
        >
          <button
            class="hidden hover:block group-hover/bg:block rounded absolute -rotate-45 w-9 h-[22px] z-10 cursor-pointer group/dp"
            :style="{ top: '21px', left: '-29px' }"
            @mousedown.stop="createDependencyLine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="fill-gray-500 group-hover/dp:fill-button w-3 pointer-events-none absolute top-[4px] left-[10.5px]"
            >
              <path
                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
              />
            </svg>
          </button>
          <button
            class="hidden hover:block group-hover/bg:block rounded absolute -rotate-45 w-9 h-[22px] z-10 cursor-pointer group/dp"
            :style="{ top: '-23px', left: '15px' }"
            @mousedown.stop="createSubsequenceLine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="fill-gray-500 group-hover/dp:fill-button w-3 pointer-events-none absolute top-[4px] right-[10.5px]"
            >
              <path
                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </template>
  <!-- task -->
  <template v-else>
    <div
      v-if="!showCell"
      v-show="isShow"
      class="absolute h-12 w-full border-y border-transparent cursor-pointer z-10"
      :class="{
        '!border-light hover:bg-slate-100/50': data.isHovered,
        'pointer-events-none':
          (store.selectedRowId && !isSelected) || // 其他人被選擇中
          store.isAddingDependencyOrSubsequence,
      }"
      :style="{
        top: data.height * 48 + 'px',
      }"
      @mouseenter="createPreviewTaskBlock"
      @mousedown="startSetTaskDate"
      @mousemove="movePreviewTaskBlock"
      @mouseup="endSetTaskDate"
      @mouseleave="removePreviewTaskBlock"
      @dragstart="
        (event) => {
          event.preventDefault();
        }
      "
    ></div>
    <template v-else>
      <div
        v-show="isShow"
        class="absolute h-12 w-full border-y border-transparent z-10"
        :class="{
          '!border-light !bg-primary-50': isSelected,
          '!border-light bg-slate-100/50':
            !store.selectedRowId &&
            !store.isAddingDependencyOrSubsequence &&
            data.isHovered,
          'pointer-events-none': store.selectedRowId && !isSelected, // 其他人被選擇中
        }"
        :style="{
          top: data.height * 48 + 'px',
        }"
        @mouseenter="currentData.isHovered = true"
        @mouseleave="currentData.isHovered = false"
      >
        <div
          v-if="isNearToView || isMoving"
          ref="ganttBlock"
          class="absolute h-6 rounded bg-primary-1 border border-primary flex items-center justify-between ganttBlock"
          :class="{
            'cursor-move': store.isAddingDependencyOrSubsequence,
            'group/bg': !store.isAddingDependencyOrSubsequence,
          }"
          :style="{
            width: blockWidth + 'px',
            top: '11px',
            left: leftDistance + 'px',
            ...styleInfo,
          }"
          @mouseenter="showPreviewDependencyOrSubSequenceLine"
          @mouseleave="hidePreviewDependencyOrSubSequenceLine"
          @mousedown="cloneGanttBlock($event, 'move')"
          @mouseup="setDependencyOrSubsequence"
        >
          <!-- left dependency btn -->
          <button
            class="hidden group-hover/bg:flex absolute -left-[33px] w-[33px] h-6 items-center justify-center cursor-pointer group/dp z-10"
            @mousedown.stop="createDependencyLine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="fill-gray-500 group-hover/dp:fill-button w-3 pointer-events-none"
            >
              <path
                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
              />
            </svg>
          </button>
          <!-- left resize btn -->
          <button
            class="hidden group-hover/bg:block absolute -left-[1px] w-[7px] h-full cursor-col-resize z-10 before:block before:w-full before:h-4/6 before:border-r before:border-button"
            @mousedown.stop="cloneGanttBlock($event, 'resize-left')"
          ></button>
          <!-- right resize btn -->
          <button
            class="hidden group-hover/bg:block absolute -right-[1px] w-[7px] h-full cursor-col-resize z-10 before:block before:w-full before:h-4/6 before:border-l before:border-button"
            @mousedown.stop="cloneGanttBlock($event, 'resize-right')"
          ></button>
          <!-- right dependency btn -->
          <button
            class="hidden group-hover/bg:flex absolute -right-[33px] w-[33px] h-6 items-center justify-center cursor-pointer group/dp"
            @mousedown.stop="createSubsequenceLine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="fill-gray-500 group-hover/dp:fill-button w-3 pointer-events-none"
            >
              <path
                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </template>
  <!-- dependencies and subsequences -->
  <template v-if="!ownTasks">
    <template
      v-for="subsequenceId in (data as Task | Milestone).subsequences"
      :key="subsequenceId"
    >
      <svg
        v-show="isShow && store.hashTable.get(subsequenceId)?.isShow"
        class="absolute"
        :style="{
          left:
            getLeftPoint(store.hashTable.get(subsequenceId)?.start_date) + 'px',
          top:
            getTopPoint(
              subsequenceId,
              store.hashTable.get(subsequenceId)?.index
            ) + 'px',
          width:
            getWidth(
              subsequenceId,
              store.hashTable.get(subsequenceId)?.start_date
            ) + 'px',
          height:
            getHeight(
              subsequenceId,
              store.hashTable.get(subsequenceId)?.index
            ) + 'px',
        }"
      >
        <path
          :d="
            getPath(
              store.hashTable.get(subsequenceId)?.start_date,
              subsequenceId,
              store.hashTable.get(subsequenceId)?.index
            )
          "
          class="stroke-gray-500"
          :class="{
            '!stroke-red-600': !getIsMovingRight(
              store.hashTable.get(subsequenceId)?.start_date
            ),
          }"
          stroke-width="1"
          fill="none"
        ></path>
      </svg>
    </template>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, watch, nextTick } from "vue";
import type { Project, Section, Task, Milestone } from "@/types/schedule";
import { useScheduleStore } from "@/stores/schedule";
import GanttGroup from "@/components/schedule/GanttGroup.vue";
import { useToast } from "primevue/usetoast";
// import { updateTask, updateMultiTasks } from '@/api/schedule';
import { useDebounceFn } from "@vueuse/core";

// init
const toast = useToast();
const store = useScheduleStore();
const props = defineProps<{
  data: Project | Section | Task | Milestone;
  rowIndex: string;
  startDate: Date;
  totalDays: number;
  workDays: Array<{ is_work_day: boolean; name: string }>;
  parentIsMoving: boolean;
  parentMovingDistance: number;
  isShow: boolean;
}>();
const trace = computed(() => {
  return props.rowIndex.split("-");
});
const currentData = computed(() => {
  let current: Project | Section | Task = store.project;
  if (trace.value.length > 1) {
    current = current.sections[Number(trace.value[1])];
    for (let i = 2; i < trace.value.length; i++) {
      current = current.tasks[Number(trace.value[i])] as Task;
    }
  }
  return current;
});
const ownTasks = computed<boolean>(() => {
  if ("sections" in props.data) {
    return true;
  } else if (props.data.type == "section") {
    return true;
  } else if (props.data.type == "task") {
    if ((props.data as Task).tasks.length > 0) {
      return true;
    }
  }
  return false;
});

const isSelected = ref<boolean>(false);

// API
const updateTaskAPI = async (
  projectId: string,
  taskId: string,
  updateParams: {
    is_collapsed?: boolean;
    parent_id?: string;
    name?: string;
    description?: string;
    before?: string;
    start_date?: Date;
    end_date?: Date;
    finished_percentage?: number;
    todos?: { isFinished: boolean; value: string; id: string }[];
    dependencies?: string[];
    subsequences?: string[];
  }
): Promise<void> => {
  // try {
  //   await updateTask(projectId, taskId, updateParams);
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

const updateMultiTasksAPI = async (
  projectId: string,
  tasks: Array<{
    id: string;
    parent_id?: string;
    name?: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    finished_percentage?: number;
    todos?: { isFinished: boolean; value: string; id: string }[];
  }>
): Promise<void> => {
  // try {
  //   await updateMultiTasks(projectId, tasks);
  // } catch {
  //   toast.add({
  //     severity: "error",
  //     summary: "error",
  //     detail: "更新失敗",
  //     closable: false,
  //     life: 3000,
  //   });
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 3000);
  // }
};

// 有日期才顯示 cell
const showCell = computed<boolean>(() => {
  if (props.data.type == "milestone") {
    if (props.data.start_date) {
      return true;
    }
  }
  if (props.data.start_date && props.data.end_date) {
    return true;
  }
  return false;
});

// 定位用訊息
const boundaryAdjustment = 0.75; // 除 milestone 外所有 block 為與邊線對齊的調整數
const columnWidth = 33; // 日期欄位寬度
const milestonePaddingLeft = 5; // milestone paddingLeft
const milestonePaddingLeftAfterRotation = 3; // milestone paddingLeft after rotation
const blockWidth = computed<number>(() => {
  let duration = 0;
  if (props.data.start_date && props.data.end_date) {
    duration =
      (props.data.end_date.getTime() - props.data.start_date.getTime()) /
        (1000 * 60 * 60 * 24) +
      1;
  }

  if (props.data.type == "section") {
    return duration ? duration * columnWidth + boundaryAdjustment : 0;
  } else if (ownTasks.value) {
    return duration ? duration * columnWidth + boundaryAdjustment : 0;
  } else {
    return duration
      ? duration * columnWidth + boundaryAdjustment
      : columnWidth + boundaryAdjustment;
  }
});
const topDistance = computed<number>(() => {
  const rowHigh = 48;
  return props.data.height * rowHigh;
});
const leftDistance = computed<number>(() => {
  if (props.data.start_date) {
    const duration =
      (props.data.start_date.getTime() - props.startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    return (
      duration * columnWidth +
      (props.data.type == "milestone"
        ? milestonePaddingLeft
        : -boundaryAdjustment)
    );
  }
  return 0;
});

// preview gantt block
const createPreviewTaskBlock = (event: MouseEvent): void => {
  currentData.value.isHovered = true;
  store.currentSettingGanttCellId = props.data.id;
  const target = event.target as HTMLElement;
  const dateBlock = document.createElement("div");
  dateBlock.id = "dateBlock";
  dateBlock.classList.add(
    "absolute",
    "w-[33.5px]",
    "h-6",
    "top-[11px]",
    "rounded",
    "bg-primary-1",
    "border",
    "border-primary",
    "pointer-events-none"
  );
  dateBlock.style.left =
    Math.floor(event.offsetX / columnWidth) * columnWidth -
    boundaryAdjustment +
    "px";

  target.appendChild(dateBlock);
};

const movePreviewTaskBlock = (event: MouseEvent): void => {
  if (store.currentSettingGanttCellId !== props.data.id) return;

  const dateBlock = document.getElementById("dateBlock");
  if (dateBlock) {
    // 已經設定了 startDistance 代表使用者已經 mousedown
    if (startDistance.value != null) {
      if (event.offsetX > startDistance.value) {
        const width =
          (Math.floor(event.offsetX / 33) -
            Math.floor(startDistance.value / columnWidth) +
            1) *
            columnWidth +
          boundaryAdjustment;
        const left =
          Math.floor(startDistance.value / columnWidth) * columnWidth -
          boundaryAdjustment;
        dateBlock.style.width = width + "px";
        dateBlock.style.left = left + "px";
      } else {
        const width =
          (Math.floor(startDistance.value / 33) -
            Math.floor(event.offsetX / columnWidth) +
            1) *
            columnWidth +
          boundaryAdjustment;
        const left =
          Math.floor(event.offsetX / columnWidth) * columnWidth -
          boundaryAdjustment;
        dateBlock.style.width = width + "px";
        dateBlock.style.left = left + "px";
      }
    }
    // 使用者還沒 mousedown
    else {
      if (
        Number(dateBlock.style.left.slice(0, -2)) !==
        Math.floor(event.offsetX / columnWidth) * columnWidth -
          boundaryAdjustment
      ) {
        const left =
          Math.floor(event.offsetX / columnWidth) * columnWidth -
          boundaryAdjustment;
        dateBlock.style.left = left + "px";
      }
    }
  }
};

let startDistance = ref<number | null>(null); // 計算 dateBlock 寬度用
const startSetTaskDate = (event: MouseEvent): void => {
  if (store.currentSettingGanttCellId !== props.data.id) return;
  startDistance.value = event.offsetX;
};

const endSetTaskDate = (event: MouseEvent): void => {
  if (startDistance.value == null) return;
  const startDateCount =
    startDistance.value > event.offsetX
      ? Math.floor(event.offsetX / columnWidth)
      : Math.floor(startDistance.value / columnWidth);
  const endDateCount =
    startDistance.value > event.offsetX
      ? Math.floor(startDistance.value / columnWidth)
      : Math.floor(event.offsetX / columnWidth);
  store.updatedDateList.clear();
  store.enableUpdateMultiTasks = true;
  const startDate = new Date(props.startDate);
  const endDate = new Date(props.startDate);
  startDate.setDate(startDate.getDate() + startDateCount);
  endDate.setDate(endDate.getDate() + endDateCount);
  currentData.value.start_date = startDate;
  currentData.value.end_date = endDate;
  setTimeout(() => {
    store.enableUpdateMultiTasks = false;
    const updatedDateList = Array.from(store.updatedDateList.values());
    if (updatedDateList.length) {
      updateMultiTasksAPI(store.project.id, updatedDateList);
    }
  }, 0);
  startDistance.value = null;
};

const removePreviewTaskBlock = (event: MouseEvent): void => {
  currentData.value.isHovered = false;
  if (store.currentSettingGanttCellId !== props.data.id) return;
  const target = event.target as HTMLElement;
  const dateBlock = document.getElementById("dateBlock");
  if (dateBlock) {
    target.removeChild(dateBlock);
    startDistance.value = null;
  }
};

const createPreviewMilestoneBlock = (event: MouseEvent): void => {
  currentData.value.isHovered = true;
  store.currentSettingGanttCellId = props.data.id;
  const target = event.target as HTMLElement;
  const milestone = document.createElement("div");
  milestone.id = "milestone";
  milestone.classList.add(
    "absolute",
    "w-[22px]",
    "h-[22px]",
    "top-[12px]",
    "rotate-45",
    "rounded",
    "bg-orange-200",
    "border",
    "border-orange-500",
    "pointer-events-none"
  );

  milestone.style.left =
    Math.floor(event.offsetX / columnWidth) * columnWidth +
    milestonePaddingLeft +
    "px";
  target.appendChild(milestone);
};

const movePreviewMilestoneBlock = (event: MouseEvent): void => {
  if (store.currentSettingGanttCellId !== props.data.id) return;

  const milestone = document.getElementById("milestone");
  if (milestone) {
    if (
      Number(milestone.style.left.slice(0, -2)) !==
      Math.floor(event.offsetX / columnWidth) * columnWidth +
        milestonePaddingLeft
    ) {
      milestone.style.left =
        Math.floor(event.offsetX / columnWidth) * columnWidth +
        milestonePaddingLeft +
        "px";
    }
  }
};

const setMilestoneDate = (event: MouseEvent): void => {
  if (store.currentSettingGanttCellId !== props.data.id) return;
  const dateCount = Math.floor(event.offsetX / columnWidth);
  store.updatedDateList.clear();
  store.enableUpdateMultiTasks = true;
  const startDate = new Date(props.startDate);
  startDate.setDate(startDate.getDate() + dateCount);
  currentData.value.start_date = startDate;
  setTimeout(() => {
    store.enableUpdateMultiTasks = false;
    const updatedDateList = Array.from(store.updatedDateList.values());
    if (updatedDateList.length) {
      updateMultiTasksAPI(store.project.id, updatedDateList);
    }
  }, 0);
};

const removePreviewMilestoneBlock = (event: MouseEvent): void => {
  currentData.value.isHovered = false;
  if (store.currentSettingGanttCellId !== props.data.id) return;
  const target = event.target as HTMLElement;
  const milestone = document.getElementById("milestone");
  if (milestone) {
    target.removeChild(milestone);
  }
};

// Gantt cell edit
const isMoving = ref<boolean>(false);
const ganttBlock = ref<HTMLElement>();

// 與父母一同移動
watch(
  () => props.parentIsMoving,
  () => {
    if (props.parentIsMoving) {
      const mousedownEvent = new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      ganttBlock.value?.dispatchEvent(mousedownEvent);
    }
  }
);

// 與依賴任務一同移動
const isMovingByDependency = ref<boolean>(false);
watchEffect(() => {
  // 已經跟父母走就不用推了
  if (props.parentIsMoving) return;

  if (
    store.subsequencesMovingDistanceHashTable.has(props.data.id) &&
    !isMovingByDependency.value
  ) {
    isMovingByDependency.value = true;
    const mousedownEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    ganttBlock.value?.dispatchEvent(mousedownEvent);
  }
});

// 移動主體，而非被拖著的部分
const isMovingProactively = computed<boolean>(() => {
  return !props.parentIsMoving && !isMovingByDependency.value;
});

const createBackBoard = (
  width: number | null = null,
  left: number | null = null
) => {
  const backBoard = document.createElement("div");
  backBoard.id = "BackBoard";
  backBoard.classList.add(
    "absolute",
    "top-0",
    "border-x",
    "border-primary",
    "bg-primary-50/50",
    "pointer-events-none"
  );
  backBoard.style.width = (width || blockWidth.value) + "px";
  backBoard.style.left =
    (left || leftDistance.value) -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    "px";

  const ganttContent = document.getElementById("GanttContent");
  if (!ganttContent) return;
  backBoard.style.height = ganttContent.clientHeight + "px";
  ganttContent.insertBefore(backBoard, ganttContent.firstChild);
};

const setBackBoard = (width: number | null, left: number | null) => {
  const backBoard = document.getElementById("BackBoard");
  if (!backBoard) return;
  if (width) {
    backBoard.style.width = width + "px";
  }
  if (left) {
    backBoard.style.left =
      left -
      (props.data.type == "milestone"
        ? milestonePaddingLeft + boundaryAdjustment
        : 0) +
      "px";
  }
};

const removeBackBoard = () => {
  const backBoard = document.getElementById("BackBoard");
  if (!backBoard) return;
  backBoard.remove();
};

const originalBlock = ref<HTMLElement>();
const originalClientX = ref<number>(0);
const originalWidth = ref<number>(0);
const originalLeft = ref<number>(0);
const originalScrollLeft = ref<number>(0);
const movingAction = ref<"move" | "resize-left" | "resize-right" | undefined>();
const cloneGanttBlock = (
  event: MouseEvent,
  action: "move" | "resize-left" | "resize-right"
): void => {
  if (isMovingProactively.value) {
    // 啟用 autoScroll
    store.isSettingGanttBlock = true;

    // 禁止反選
    const body = document.body;
    body.style.userSelect = "none";

    const scrollPanel = document.getElementById("GanttScrollPanel");
    if (scrollPanel) {
      originalScrollLeft.value = scrollPanel.scrollLeft;
    }
  }

  // 設定組件拖曳動作
  movingAction.value = action;

  // 使子組件都一同拖動
  isMoving.value = true;

  // 複製 block
  const target =
    action == "move"
      ? (event.target as HTMLElement)
      : ((event.target as HTMLElement).parentNode as HTMLElement);
  const clone = target.cloneNode(true) as HTMLDivElement;
  clone.id = "clone" + props.data.id;
  clone.classList.add("pointer-events-none");
  clone.classList.remove("cursor-grab");

  // 儲存原始offset並使原始block不可見
  originalBlock.value = target;
  originalClientX.value = event.clientX;
  originalWidth.value = Number(clone.style.width.slice(0, -2));
  originalLeft.value = Number(clone.style.left.slice(0, -2));
  target.classList.add("hidden");

  // 貼上複製元素
  target.parentElement?.appendChild(clone);

  if (action == "move") {
    // 設置屬標樣式
    if (isMovingProactively.value) {
      document.body.style.cursor = "grabbing";
      isSelected.value = true;
      store.selectedRowId = props.data.id;
      createBackBoard();
    }

    // 後續追蹤
    document.body.addEventListener("mousemove", moveGanttBlock);
    document.body.addEventListener("mouseup", removeGanttBlockAndSetDate);
  } else {
    // 設置屬標樣式
    document.body.style.cursor = "col-resize";
    isSelected.value = true;
    store.selectedRowId = props.data.id;
    createBackBoard();

    // 後續追蹤
    document.body.addEventListener("mousemove", resizeGanttBlock);
    document.body.addEventListener("mouseup", removeGanttBlockAndSetDate);
  }
};

const movingDistance = ref<number>(0);
// 跟隨父組件移動距離
watchEffect(() => {
  movingDistance.value = props.parentMovingDistance;
});

// 計算接續任務距離
const subsequenceGaps = computed<Array<number>>(() => {
  if (props.data.type == "task") {
    return props.data.subsequences.map((id) => {
      const subsequenceStartDate = store.hashTable.get(id)?.start_date;
      if (subsequenceStartDate && props.data.end_date) {
        if (subsequenceStartDate > props.data.end_date) {
          // 右側物件給距離
          return (
            ((subsequenceStartDate.getTime() - props.data.end_date.getTime()) /
              (1000 * 60 * 60 * 24) -
              1) *
            33
          );
        }
        // 左側給-1
        return -1;
      }
      // default
      return -1;
    });
  } else if (props.data.type == "milestone") {
    return props.data.subsequences.map((id) => {
      const subsequenceStartDate = store.hashTable.get(id)?.start_date;
      if (subsequenceStartDate && props.data.start_date) {
        if (subsequenceStartDate > props.data.start_date) {
          // 右側物件給距離
          return (
            ((subsequenceStartDate.getTime() -
              props.data.start_date.getTime()) /
              (1000 * 60 * 60 * 24) -
              1) *
            33
          );
        }
        // 左側給-1
        return -1;
      }
      // default
      return -1;
    });
  }
  return [];
});

// 滾動時移動根據動作調用 moveGanttBlock, resizeGanttBlock 或 drawDependencyLine, drawSubsequenceLine
watch(
  () => store.scrollPanelLeft,
  () => {
    if (store.isSettingGanttBlock) {
      if (movingAction.value == "move") {
        moveGanttBlock(undefined, mouseDistance.value);
      } else {
        resizeGanttBlock(undefined, mouseDistance.value);
      }
    }
  }
);

const mouseDistance = ref<number>(0);
const moveGanttBlock = (event?: MouseEvent, distance?: number): void => {
  const clone = document.getElementById("clone" + props.data.id);
  if (!clone) return;

  // 移動子任務
  if (props.parentIsMoving) {
    movingDistance.value = props.parentMovingDistance;
    clone.style.left = originalLeft.value + movingDistance.value + "px";
  }
  // 移動接續任務
  else if (isMovingByDependency.value) {
    movingDistance.value = Math.min(
      store.subsequencesMovingDistanceHashTable.get(props.data.id) || 0,
      (props.totalDays - 1) * columnWidth -
        originalLeft.value -
        blockWidth.value
    );
    clone.style.left = originalLeft.value + movingDistance.value + "px";
  }
  // 移動自己
  else {
    const scrollDistance = store.scrollPanelLeft - originalScrollLeft.value;
    if (event) {
      mouseDistance.value = event.clientX - originalClientX.value;
    } else if (distance) {
      mouseDistance.value = distance;
    }
    movingDistance.value = Math.min(
      Math.max(
        mouseDistance.value + scrollDistance,
        -boundaryAdjustment - originalLeft.value
      ),
      (props.totalDays - 1) * columnWidth -
        originalLeft.value -
        blockWidth.value
    );

    // movingDistance.value = mouseDistance.value + scrollDistance;
    clone.style.left = originalLeft.value + movingDistance.value + "px";
    setBackBoard(null, originalLeft.value + movingDistance.value);
  }

  if (props.data.type == "task" || props.data.type == "milestone") {
    // 設定接續任務移動距離
    for (let i = 0; i < subsequenceGaps.value.length; i++) {
      // 後方任務(目標起始<當前結束)不做推移
      if (subsequenceGaps.value[i] < 0) continue;

      if (movingDistance.value > subsequenceGaps.value[i]) {
        store.subsequencesMovingDistanceHashTable.set(
          props.data.subsequences[i],
          movingDistance.value - subsequenceGaps.value[i]
        );
      } else {
        store.subsequencesMovingDistanceHashTable.delete(
          props.data.subsequences[i]
        );
      }
    }
  }
};

// 防止使用者連續拖曳
const debouncedUpdateTaskAPI = useDebounceFn(
  (
    deepCopyOfProjectId: string,
    updatedDateList: {
      id: string;
      start_date: Date | undefined;
      end_date: Date | undefined;
    }[]
  ) => {
    if (updatedDateList.length) {
      updateMultiTasksAPI(deepCopyOfProjectId, updatedDateList);
    }
  },
  800
);

const resizeGanttBlock = (event?: MouseEvent, distance?: number): void => {
  const clone = document.getElementById("clone" + props.data.id);
  if (!clone) return;

  if (event) {
    mouseDistance.value = event.clientX - originalClientX.value;
  } else if (distance) {
    mouseDistance.value = distance;
  }
  const scrollDistance = store.scrollPanelLeft - originalScrollLeft.value;
  if (movingAction.value == "resize-right") {
    movingDistance.value = Math.min(
      mouseDistance.value + scrollDistance,
      (props.totalDays - 1) * columnWidth -
        originalLeft.value -
        blockWidth.value
    );

    const width = Math.max(
      originalWidth.value + movingDistance.value,
      columnWidth + boundaryAdjustment
    );
    clone.style.width = width + "px";
    setBackBoard(width, null);

    if (props.data.type == "task" || props.data.type == "milestone") {
      // 設定接續任務移動距離
      for (let i = 0; i < subsequenceGaps.value.length; i++) {
        // 後方任務(目標起始<當前結束)不做推移
        if (subsequenceGaps.value[i] < 0) continue;

        if (movingDistance.value > subsequenceGaps.value[i]) {
          store.subsequencesMovingDistanceHashTable.set(
            props.data.subsequences[i],
            movingDistance.value - subsequenceGaps.value[i]
          );
        } else {
          store.subsequencesMovingDistanceHashTable.delete(
            props.data.subsequences[i]
          );
        }
      }
    }
  } else if (movingAction.value == "resize-left") {
    movingDistance.value = Math.max(
      mouseDistance.value + scrollDistance,
      -boundaryAdjustment - originalLeft.value
    );
    const width = Math.max(
      originalWidth.value - movingDistance.value,
      columnWidth + boundaryAdjustment
    );
    const left =
      originalLeft.value +
      Math.min(
        movingDistance.value,
        blockWidth.value - (columnWidth + boundaryAdjustment)
      );
    clone.style.width = width + "px";
    clone.style.left = left + "px";
    setBackBoard(width, left);
  }
};

const removeGanttBlockAndSetDate = (): void => {
  if (isMovingProactively.value) {
    // 設置屬標樣式
    document.body.style.cursor = "default";

    // 取消禁止反選
    const body = document.body;
    body.style.userSelect = "unset";

    // 關閉 autoScroll
    store.isSettingGanttBlock = false;
  }

  // 移除 clone
  const clone = document.getElementById("clone" + props.data.id);
  if (clone && clone.parentNode) {
    clone.parentNode.removeChild(clone);
  }

  // 遞迴更新接續任務日期
  const updateSequences = (
    dependency: Task | Milestone,
    originalLastDate: Date
  ) => {
    dependency.subsequences.forEach((sub) => {
      const subsequence = store.hashTable.get(sub);
      if (!subsequence) return;
      // 定位依賴任務
      const index = subsequence.index.split("-");
      let access: Section | Task | Milestone =
        store.project.sections[Number(index[1])];
      for (let i = 2; i < index.length; i++) {
        access = (access as Section | Task).tasks[Number(index[i])];
      }

      // 如果當前任務原先結束時間就晚於接續任務起始，那就不要更新了
      if (access.start_date) {
        if (originalLastDate.getTime() >= access.start_date.getTime()) {
          return;
        }
      }
      if (dependency.type == "task") {
        if (dependency.end_date && access.start_date) {
          // 當前任務時間>=接續任務時間
          if (dependency.end_date.getTime() >= access.start_date.getTime()) {
            let newLastDate = new Date();
            // 更改依賴任務

            if (access.type == "task") {
              if (access.start_date && access.end_date) {
                newLastDate = new Date(access.end_date);
                const duration =
                  (access.end_date.getTime() - access.start_date.getTime()) /
                  (1000 * 60 * 60 * 24);
                const startDate = new Date(dependency.end_date as Date);
                const endDate = new Date(dependency.end_date as Date);
                // 右推時不超過右側邊界
                if (
                  (endDate.getTime() - props.startDate.getTime()) /
                    (1000 * 60 * 60 * 24) >=
                  props.totalDays - 2
                ) {
                  startDate.setDate(startDate.getDate() - duration);
                } else {
                  startDate.setDate(startDate.getDate() + 1);
                  endDate.setDate(endDate.getDate() + 1 + duration);
                }

                access.start_date = startDate;
                access.end_date = endDate;
              }
            } else if (access.type == "milestone") {
              newLastDate = access.start_date;
              if (access.start_date) {
                const startDate = new Date(dependency.end_date as Date);
                // 右推時不超過右側邊界
                if (
                  (startDate.getTime() - props.startDate.getTime()) /
                    (1000 * 60 * 60 * 24) <
                  props.totalDays - 2
                ) {
                  startDate.setDate(startDate.getDate() + 1);
                }
                access.start_date = startDate;
              }
            }

            // 修改後續接續任務
            updateSequences(access as Task | Milestone, newLastDate);
          }
        }
      } else if (dependency.type == "milestone") {
        if (dependency.start_date && access.start_date) {
          if (dependency.start_date.getTime() >= access.start_date.getTime()) {
            const newLastDate = access.start_date;
            // 更改依賴任務
            if (access.type == "task") {
              if (access.start_date && access.end_date) {
                const dateGap =
                  (access.end_date.getTime() - access.start_date.getTime()) /
                  (1000 * 60 * 60 * 24);
                const startDate = new Date(dependency.start_date);
                startDate.setDate(startDate.getDate() + 1);
                const endDate = new Date(dependency.start_date);
                endDate.setDate(endDate.getDate() + 1 + dateGap);
                access.start_date = startDate;
                access.end_date = endDate;
              }
            } else if (access.type == "milestone") {
              if (access.start_date) {
                const startDate = new Date(dependency.start_date);
                startDate.setDate(startDate.getDate() + 1);
                access.start_date = startDate;
              }
            }
            // 修改後續接續任務
            updateSequences(access as Task | Milestone, newLastDate);
          }
        }
      }
    });
  };
  // 遞迴更新本身任務日期
  const updateDate = (
    object: Project | Section | Task | Milestone,
    movingDate: number
  ) => {
    if (object.type == "project") {
      object.sections.forEach((section) => updateDate(section, movingDate));
    } else if (object.type == "section") {
      object.tasks.forEach((task) => updateDate(task, movingDate));
    } else if (object.type == "task") {
      if (object.tasks.length) {
        object.tasks.forEach((task) => updateDate(task, movingDate));
      } else {
        // 改自己日期
        if (object.start_date && object.end_date) {
          const originalLastDate = object.end_date;

          const startDate = new Date(object.start_date);
          const endDate = new Date(object.end_date);
          startDate.setDate(startDate.getDate() + movingDate);
          endDate.setDate(endDate.getDate() + movingDate);
          object.start_date = startDate;
          object.end_date = endDate;

          // 待所有自主更新都完成後判斷是否需要更改接續任務日期
          nextTick(() => {
            updateSequences(object, originalLastDate);
          });
        }
      }
    } else {
      // 改自己日期
      if (object.start_date) {
        const originalLastDate = object.start_date;

        const startDate = new Date(object.start_date);
        startDate.setDate(startDate.getDate() + movingDate);
        object.start_date = startDate;

        // 待所有自主更新都完成後判斷是否需要更改依賴日期
        nextTick(() => {
          updateSequences(object, originalLastDate);
        });
      }
    }
  };

  if (movingAction.value == "move") {
    document.body.removeEventListener("mousemove", moveGanttBlock);
    // 更新日期
    if (isMovingProactively.value) {
      store.updatedDateList.clear();
      store.enableUpdateMultiTasks = true;

      // 計算移動天數
      const movingDate = Math.round(movingDistance.value / columnWidth);
      updateDate(currentData.value, movingDate);

      // 移除背板
      isSelected.value = false;
      removeBackBoard();
    }

    if (isMovingProactively.value) {
      setTimeout(() => {
        store.enableUpdateMultiTasks = false;
        const deepCopyOfProjectId: string = JSON.parse(
          JSON.stringify(store.project.id)
        );
        debouncedUpdateTaskAPI(
          deepCopyOfProjectId,
          Array.from(store.updatedDateList.values())
        );
      }, 0);
    }
  } else if (movingAction.value == "resize-right") {
    document.body.removeEventListener("mousemove", resizeGanttBlock);

    // 移除背板
    isSelected.value = false;
    removeBackBoard();

    if (props.data.end_date) {
      const originalLastDate = props.data.end_date;

      // 更新本身任務結束日期
      const count = Math.round(movingDistance.value / columnWidth);
      store.updatedDateList.clear();
      store.enableUpdateMultiTasks = true;
      const endDate = new Date(props.data.end_date as Date);
      endDate.setDate(endDate.getDate() + count);
      currentData.value.end_date = endDate;
      setTimeout(() => {
        store.enableUpdateMultiTasks = false;
        const deepCopyOfProjectId: string = JSON.parse(
          JSON.stringify(store.project.id)
        );
        debouncedUpdateTaskAPI(
          deepCopyOfProjectId,
          Array.from(store.updatedDateList.values())
        );
      }, 0);

      // 更新接續任務日期
      updateSequences(currentData.value as Task | Milestone, originalLastDate);
    }
  } else if (movingAction.value == "resize-left") {
    document.body.removeEventListener("mousemove", resizeGanttBlock);

    // 移除背板
    isSelected.value = false;
    removeBackBoard();

    // 修改起始日期
    const count = Math.round(movingDistance.value / columnWidth);
    store.updatedDateList.clear();
    store.enableUpdateMultiTasks = true;
    const startDate = new Date(props.data.start_date as Date);
    startDate.setDate(startDate.getDate() + count);
    currentData.value.start_date = startDate;
    setTimeout(() => {
      store.enableUpdateMultiTasks = false;
      const deepCopyOfProjectId: string = JSON.parse(
        JSON.stringify(store.project.id)
      );
      debouncedUpdateTaskAPI(
        deepCopyOfProjectId,
        Array.from(store.updatedDateList.values())
      );
    }, 0);
  }

  // 顯示原本的 block
  originalBlock.value?.classList.remove("hidden");

  // 關閉監聽
  document.body.removeEventListener("mouseup", removeGanttBlockAndSetDate);

  // inti
  movingAction.value = undefined;
  originalBlock.value = undefined;
  originalClientX.value = 0;
  originalWidth.value = 0;
  originalLeft.value = 0;
  store.selectedRowId = "";
  setTimeout(() => {
    isMoving.value = false;
    movingDistance.value = 0;
    isMovingByDependency.value = false;
    store.subsequencesMovingDistanceHashTable.clear();
  }, 0);
};

const originalClientXSvg = ref<number>(0);
const originalClientYSvg = ref<number>(0);
const originalOffsetXSvg = ref<number>(0);
const originalOffsetYSvg = ref<number>(0);
const createDependencyLine = (event: MouseEvent): void => {
  originalClientXSvg.value = event.clientX;
  originalClientYSvg.value = event.clientY;
  originalOffsetXSvg.value = event.offsetX;
  originalOffsetYSvg.value = event.offsetY;
  store.isAddingDependencyOrSubsequence = "dependency";
  store.originalDependencyTrace = trace.value;
  store.originalDependencyId = props.data.id;
  nextTick(() => {
    ganttBlock.value?.classList.add("!cursor-default");
    ganttBlock.value?.parentElement?.classList.add("!z-20");
  });

  const container = document.getElementById("GanttContent");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "svg";
  svg.style.width = "0px";
  svg.style.height = "0px";
  svg.style.position = "absolute";
  // svg.style.border = '1px solid #1D2939';
  svg.classList.add("z-10");
  container?.appendChild(svg);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.id = "path";
  const d = ``;
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#1D2939");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill", "none");
  svg.appendChild(path);

  const body = document.body;
  body.style.userSelect = "none";
  body.addEventListener("mousemove", drawDependencyLine);
  body.addEventListener("mouseup", removeDependencyLine);
};

const drawDependencyLine = (event: MouseEvent): void => {
  const svg = document.getElementById("svg") as HTMLElement;
  // svg基礎設定，上左長寬移動方向
  const breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0);
  const breakpointY = topDistance.value + 12;
  let isMovingLeft = false;
  if (store.expectedDependentTargetInfo.isSet) {
    isMovingLeft =
      store.expectedDependentTargetInfo.left -
        (props.data.type == "milestone" ? milestonePaddingLeft : 0) -
        boundaryAdjustment +
        store.expectedDependentTargetInfo.width <=
      breakpointX;
  } else {
    isMovingLeft =
      event.clientX - originalClientXSvg.value <
      columnWidth - originalOffsetXSvg.value;
  }
  const isMovingDown =
    originalClientYSvg.value - event.clientY < originalOffsetYSvg.value;
  let leftPoint = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    leftPoint = isMovingLeft
      ? store.expectedDependentTargetInfo.left -
        boundaryAdjustment +
        store.expectedDependentTargetInfo.width
      : breakpointX - columnWidth;
  } else {
    leftPoint = isMovingLeft
      ? breakpointX +
        (event.clientX - originalClientXSvg.value) +
        (originalOffsetXSvg.value - columnWidth) +
        6
      : breakpointX - columnWidth;
  }
  let topPoint = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    topPoint = isMovingDown
      ? breakpointY
      : store.expectedDependentTargetInfo.top + 12;
  } else {
    topPoint = isMovingDown
      ? breakpointY
      : breakpointY +
        event.clientY -
        originalClientYSvg.value +
        originalOffsetYSvg.value +
        6;
  }
  let width = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    width = isMovingLeft
      ? breakpointX -
        (store.expectedDependentTargetInfo.left +
          store.expectedDependentTargetInfo.width -
          boundaryAdjustment)
      : store.expectedDependentTargetInfo.left +
        store.expectedDependentTargetInfo.width -
        boundaryAdjustment -
        breakpointX +
        columnWidth * 2;
  } else {
    width = isMovingLeft
      ? originalClientXSvg.value -
        event.clientX +
        columnWidth -
        originalOffsetXSvg.value +
        boundaryAdjustment -
        6
      : event.clientX -
        originalClientXSvg.value -
        columnWidth +
        originalOffsetXSvg.value +
        boundaryAdjustment +
        columnWidth * 2;
  }
  let height = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    height = isMovingDown
      ? store.expectedDependentTargetInfo.top +
        12 +
        store.expectedDependentTargetInfo.height -
        topPoint
      : breakpointY + 12 - store.expectedDependentTargetInfo.top;
  } else {
    height = isMovingDown
      ? originalOffsetYSvg.value + event.clientY - originalClientYSvg.value - 6
      : originalClientYSvg.value -
        event.clientY -
        originalOffsetYSvg.value -
        6 +
        24;
  }

  // 在滑鼠移動不超過起始點左右最小範圍時至少保持最小樣式
  if (!store.expectedDependentTargetInfo.isSet) {
    leftPoint = Math.min(leftPoint, breakpointX - columnWidth);
  }
  topPoint = Math.min(topPoint, breakpointY);
  width = Math.max(width, columnWidth + boundaryAdjustment);
  height = Math.max(height, 24);

  // milestone 調整
  if (props.data.type == "milestone") {
    if (isMovingLeft) {
      // 差一天不需要加調整
      if (
        breakpointX !=
        store.expectedDependentTargetInfo.left -
          boundaryAdjustment +
          store.expectedDependentTargetInfo.width
      ) {
        width += milestonePaddingLeftAfterRotation;
      }
    }
  }
  if (store.expectedDependentTargetInfo.type == "milestone") {
    if (isMovingLeft) {
      leftPoint -= milestonePaddingLeftAfterRotation;
      width += milestonePaddingLeftAfterRotation;
    }
  }

  // 畫線
  const path = document.getElementById("path") as HTMLElement;
  let d = "";
  if (isMovingLeft) {
    path.setAttribute("stroke", "#1D2939");
    // 依賴與序列是 milestone 時的調整
    const milestoneEndPointVariance =
      store.expectedDependentTargetInfo.type == "milestone" ? 3 : 0;
    const startX = width;
    const startY = isMovingDown ? 12 : height - 12;
    const endX = 0;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 2), 12);
    const points = [
      { x: startX, y: startY },
      { x: endX + 16.5 + milestoneEndPointVariance, y: startY },
      { x: endX + 16.5 + milestoneEndPointVariance, y: endY },
      { x: endX, y: endY },
    ];
    // 差一天 L 型
    if (
      breakpointX ==
      store.expectedDependentTargetInfo.left -
        boundaryAdjustment +
        store.expectedDependentTargetInfo.width
    ) {
      d = `
        M ${points[1].x} ${points[1].y}
        Q ${points[1].x / 2} ${points[1].y}, ${points[3].x} ${points[3].y}
      `;
    }
    // 差兩天以上 S 型
    else {
      d = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x + curveRadius} ${points[1].y}
        Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
        points[1].y + (isMovingDown ? curveRadius : -curveRadius)
      }
        L ${points[2].x} ${
        points[2].y + (isMovingDown ? -curveRadius : +curveRadius)
      }
        Q ${points[2].x} ${points[2].y}, ${points[2].x - curveRadius} ${
        points[2].y
      }
        L ${points[3].x} ${points[3].y}
      `;
    }
  } else {
    path.setAttribute("stroke", "red");
    // 依賴與序列是milestone時的調整
    const milestoneStartPointVariance =
      props.data.type == "milestone" ? milestonePaddingLeftAfterRotation : 0;
    const milestoneEndPointVariance =
      store.expectedDependentTargetInfo.type == "milestone"
        ? milestonePaddingLeftAfterRotation
        : 0;
    const startX = 33 + milestoneStartPointVariance;
    const startY = isMovingDown ? 12 : height - 12;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 4), 12);
    const points = [
      { x: startX, y: startY },
      { x: startX - 16.5 - milestoneStartPointVariance, y: startY },
      {
        x: startX - 16.5 - milestoneStartPointVariance,
        y: endY - (isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      {
        x: width - 16.5,
        y: endY - (isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      { x: width - 16.5, y: endY },
      { x: width - 33 - milestoneEndPointVariance, y: endY },
    ];
    d = `
      M ${points[0].x} ${points[0].y}
      L ${points[1].x + curveRadius} ${points[1].y}
      Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
      points[1].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      L ${points[2].x} ${
      points[2].y + (isMovingDown ? -curveRadius : curveRadius)
    }
      Q ${points[2].x} ${points[2].y}, ${points[2].x + curveRadius} ${
      points[2].y
    }
      L ${points[3].x - curveRadius} ${points[3].y}
      Q ${points[3].x} ${points[3].y}, ${points[3].x} ${
      points[3].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      T${points[4].x - curveRadius} ${points[4].y}
      L ${points[5].x} ${points[5].y}
    `;
  }

  svg.style.left = leftPoint + "px";
  svg.style.top = topPoint + "px";
  svg.style.width = width + "px";
  svg.style.height = height + "px";
  path.setAttribute("d", d);
};

const removeDependencyLine = (): void => {
  // 移除 svg
  const svg = document.getElementById("svg");
  if (svg && svg.parentNode) {
    svg.parentNode.removeChild(svg);
  }

  store.isAddingDependencyOrSubsequence = undefined;
  store.originalDependencyTrace = [];
  store.originalDependencyId = "";
  store.expectedDependentTargetInfo.isSet = false;
  store.expectedDependentTargetInfo.left = 0;
  store.expectedDependentTargetInfo.top = 0;
  store.expectedDependentTargetInfo.width = 0;
  store.expectedDependentTargetInfo.height = 0;
  const body = document.body;
  body.style.userSelect = "default";
  body.removeEventListener("mousemove", drawDependencyLine);
  body.removeEventListener("mouseup", removeDependencyLine);
};

const createSubsequenceLine = (event: MouseEvent): void => {
  originalClientXSvg.value = event.clientX;
  originalClientYSvg.value = event.clientY;
  originalOffsetXSvg.value =
    event.offsetX - (props.data.type == "milestone" ? 14 : 0);
  originalOffsetYSvg.value = event.offsetY;
  store.isAddingDependencyOrSubsequence = "subsequence";
  store.originalDependencyTrace = trace.value;
  store.originalDependencyId = props.data.id;
  nextTick(() => {
    ganttBlock.value?.classList.add("!cursor-default");
    ganttBlock.value?.parentElement?.classList.add("!z-20");
  });

  const container = document.getElementById("GanttContent");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "svg";
  svg.style.width = "0px";
  svg.style.height = "0px";
  svg.style.position = "absolute";
  // svg.style.border = '1px solid #1D2939';
  svg.classList.add("z-10");
  container?.appendChild(svg);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.id = "path";
  const d = ``;
  path.setAttribute("d", d);
  path.setAttribute("stroke", "#1D2939");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill", "none");
  svg.appendChild(path);

  const body = document.body;
  body.style.userSelect = "none";
  body.addEventListener("mousemove", drawSubsequenceLine);
  body.addEventListener("mouseup", removeSubsequenceLine);
};

const drawSubsequenceLine = (event: MouseEvent): void => {
  const svg = document.getElementById("svg") as HTMLElement;
  // svg基礎設定，上左長寬移動方向
  const breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    blockWidth.value -
    boundaryAdjustment;
  const breakpointY = topDistance.value + 12;
  let isMovingRight = false;
  if (store.expectedDependentTargetInfo.isSet) {
    isMovingRight = store.expectedDependentTargetInfo.left >= breakpointX;
  } else {
    isMovingRight =
      originalClientXSvg.value - event.clientX < originalOffsetXSvg.value;
  }
  const isMovingDown =
    originalClientYSvg.value - event.clientY < originalOffsetYSvg.value;
  let leftPoint = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    leftPoint = isMovingRight
      ? breakpointX
      : store.expectedDependentTargetInfo.left - columnWidth;
  } else {
    leftPoint = isMovingRight
      ? breakpointX
      : breakpointX +
        event.clientX -
        originalClientXSvg.value +
        originalOffsetXSvg.value -
        columnWidth;
  }

  let topPoint = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    topPoint = isMovingDown
      ? breakpointY
      : store.expectedDependentTargetInfo.top + 12;
  } else {
    topPoint = isMovingDown
      ? breakpointY
      : breakpointY +
        event.clientY -
        originalClientYSvg.value +
        originalOffsetYSvg.value +
        6;
  }
  let width = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    width = isMovingRight
      ? store.expectedDependentTargetInfo.left - leftPoint
      : breakpointX -
        store.expectedDependentTargetInfo.left +
        boundaryAdjustment +
        columnWidth * 2;
  } else {
    width = isMovingRight
      ? originalOffsetXSvg.value + event.clientX - originalClientXSvg.value - 6
      : originalClientXSvg.value -
        event.clientX -
        originalOffsetXSvg.value +
        columnWidth * 2;
  }
  let height = 0;
  if (store.expectedDependentTargetInfo.isSet) {
    height = isMovingDown
      ? store.expectedDependentTargetInfo.top +
        12 +
        store.expectedDependentTargetInfo.height -
        topPoint
      : breakpointY + 12 - store.expectedDependentTargetInfo.top;
  } else {
    height = isMovingDown
      ? originalOffsetYSvg.value + event.clientY - originalClientYSvg.value - 6
      : originalClientYSvg.value -
        event.clientY -
        originalOffsetYSvg.value -
        6 +
        24;
  }

  // 在滑鼠移動不超過起始點左右最小範圍時至少保持最小樣式
  leftPoint = Math.min(leftPoint, breakpointX);
  topPoint = Math.min(topPoint, breakpointY);
  width = Math.max(width, columnWidth + boundaryAdjustment);
  height = Math.max(height, 24);

  // milestone 調整
  if (props.data.type == "milestone") {
    if (isMovingRight) {
      leftPoint -= milestonePaddingLeftAfterRotation;
      width += milestonePaddingLeftAfterRotation;
    }
  }
  if (store.expectedDependentTargetInfo.type == "milestone") {
    if (isMovingRight) {
      // 差一天不需要加調整
      if (breakpointX != store.expectedDependentTargetInfo.left) {
        width += milestonePaddingLeftAfterRotation;
      }
    }
  }

  // 畫線
  const path = document.getElementById("path") as HTMLElement;
  let d = "";
  if (isMovingRight) {
    path.setAttribute("stroke", "#1D2939");
    // 依賴與序列是 milestone 時的調整
    const milestoneStartPointVariance = props.data.type == "milestone" ? 3 : 0;

    const startX = 0;
    const startY = isMovingDown ? 12 : height - 12;
    const endX = width;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 2), 12);
    const points = [
      { x: startX, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: endY },
      { x: endX, y: endY },
    ];
    // 差一天 L 型
    if (breakpointX == store.expectedDependentTargetInfo.left) {
      d = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x - curveRadius} ${points[1].y}
        Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
        points[1].y + (isMovingDown ? curveRadius : -curveRadius)
      }
        L ${points[2].x} ${points[2].y - (isMovingDown ? 12 : -curveRadius)}
      `;
    }
    // 差兩天以上 S 型
    else {
      d = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x - curveRadius} ${points[1].y}
        Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
        points[1].y + (isMovingDown ? curveRadius : -curveRadius)
      }
        L ${points[2].x} ${
        points[2].y + (isMovingDown ? -curveRadius : curveRadius)
      }
        Q ${points[2].x} ${points[2].y}, ${points[2].x + curveRadius} ${
        points[2].y
      }
        L ${points[3].x} ${points[3].y}
      `;
    }
  } else {
    path.setAttribute("stroke", "red");
    const milestoneStartPointVariance = props.data.type == "milestone" ? 3 : 0;
    const milestoneEndPointVariance =
      store.expectedDependentTargetInfo.type == "milestone"
        ? milestonePaddingLeftAfterRotation
        : 0;
    const startX =
      width -
      columnWidth -
      boundaryAdjustment * 2 -
      milestoneStartPointVariance;
    const startY = isMovingDown ? 12 : height - 12;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 4), 12);
    const points = [
      { x: startX, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: startY },
      {
        x: startX + 16.5 + milestoneStartPointVariance,
        y: startY + (isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      {
        x: 16.5,
        y: startY + +(isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      { x: 16.5, y: endY },
      { x: 33 + milestoneEndPointVariance, y: endY },
    ];
    d = `
      M ${points[0].x} ${points[0].y}
      L ${points[1].x - curveRadius} ${points[1].y}
      Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
      points[1].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      T ${points[2].x - curveRadius} ${points[2].y}
      L ${points[3].x + curveRadius} ${points[3].y}
      Q ${points[3].x} ${points[3].y}, ${points[3].x} ${
      points[3].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      L ${points[4].x} ${
      points[4].y + (isMovingDown ? -curveRadius : curveRadius)
    }
      Q ${points[4].x} ${points[4].y}, ${points[4].x + curveRadius} ${
      points[4].y
    }
      L ${points[5].x} ${points[5].y}
    `;
  }

  svg.style.left = leftPoint + "px";
  svg.style.top = topPoint + "px";
  svg.style.width = width + "px";
  svg.style.height = height + "px";
  path.setAttribute("d", d);
};

const removeSubsequenceLine = (): void => {
  // 移除 svg
  const svg = document.getElementById("svg");
  if (svg && svg.parentNode) {
    svg.parentNode.removeChild(svg);
  }

  store.isAddingDependencyOrSubsequence = undefined;
  store.originalDependencyTrace = [];
  store.originalDependencyId = "";
  store.expectedDependentTargetInfo.isSet = false;
  store.expectedDependentTargetInfo.left = 0;
  store.expectedDependentTargetInfo.top = 0;
  store.expectedDependentTargetInfo.width = 0;
  store.expectedDependentTargetInfo.height = 0;
  const body = document.body;
  body.style.userSelect = "default";
  body.removeEventListener("mousemove", drawSubsequenceLine);
  body.removeEventListener("mouseup", removeSubsequenceLine);
};

const showPreviewDependencyOrSubSequenceLine = (event: MouseEvent): void => {
  // 非設定依賴關係時
  if (!store.isAddingDependencyOrSubsequence) return;

  // 不能放自己
  if (store.originalDependencyId == props.data.id) return;

  // show preview dependent line
  const target = event.target as HTMLElement;
  const parentElement = target.parentElement;
  if (parentElement) {
    parentElement.classList.add("z-30");
  }

  store.expectedDependentTargetInfo.isSet = true;
  store.expectedDependentTargetInfo.type = props.data.type as
    | "task"
    | "milestone";
  store.expectedDependentTargetInfo.left =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0);
  store.expectedDependentTargetInfo.top = topDistance.value;
  store.expectedDependentTargetInfo.width = blockWidth.value;
  store.expectedDependentTargetInfo.height = 24;
};

const hidePreviewDependencyOrSubSequenceLine = (event: MouseEvent): void => {
  // 非設定依賴關係時
  if (!store.isAddingDependencyOrSubsequence) return;

  // show preview dependent line
  const target = event.target as HTMLElement; // 将 event.target 断言为 HTMLElement 类型
  const parentElement = target.parentElement;
  if (parentElement) {
    parentElement.classList.remove("z-30");
  }
  store.expectedDependentTargetInfo.isSet = false;
  store.expectedDependentTargetInfo.left = 0;
  store.expectedDependentTargetInfo.top = 0;
  store.expectedDependentTargetInfo.width = 0;
  store.expectedDependentTargetInfo.height = 0;
};

const setDependencyOrSubsequence = (): void => {
  // 不能放自己
  if (store.originalDependencyId == props.data.id) return;

  // 增添依賴
  if (store.isAddingDependencyOrSubsequence == "dependency") {
    // 取得主體
    let originalData: Project | Section | Task = store.project;
    if (store.originalDependencyTrace.length > 1) {
      originalData =
        originalData.sections[Number(store.originalDependencyTrace[1])];
      for (let i = 2; i < store.originalDependencyTrace.length; i++) {
        originalData = originalData.tasks[
          Number(store.originalDependencyTrace[i])
        ] as Task;
      }
    }

    // 檢查依賴關係是否已經存在
    if (
      (originalData as Task | Milestone).subsequences.includes(props.data.id) ||
      (props.data as Task | Milestone).subsequences.includes(
        store.originalDependencyId
      )
    ) {
      toast.add({
        severity: "warn",
        summary: "warn",
        detail: "倚賴關係已經存在",
        closable: false,
        life: 3000,
      });
      return;
    }

    // 新增主體後續任務
    (currentData.value as Task | Milestone).subsequences.push(
      store.originalDependencyId
    );
    updateTaskAPI(store.project.id, props.data.id, {
      subsequences: (props.data as Task | Milestone).subsequences,
    });
  }
  // 增添子序列
  else if (store.isAddingDependencyOrSubsequence == "subsequence") {
    // 取得主體
    let originalData: Project | Section | Task = store.project;
    if (store.originalDependencyTrace.length > 1) {
      originalData =
        originalData.sections[Number(store.originalDependencyTrace[1])];
      for (let i = 2; i < store.originalDependencyTrace.length; i++) {
        originalData = originalData.tasks[
          Number(store.originalDependencyTrace[i])
        ] as Task;
      }
    }

    // 檢查依賴關係是否已經存在
    if (
      (originalData as Task | Milestone).subsequences.includes(props.data.id) ||
      (props.data as Task | Milestone).subsequences.includes(
        store.originalDependencyId
      )
    ) {
      toast.add({
        severity: "warn",
        summary: "warn",
        detail: "倚賴關係已經存在",
        closable: false,
        life: 3000,
      });
      return;
    }

    // 新增主體後續任務
    (originalData as Task | Milestone).subsequences.push(props.data.id);
    updateTaskAPI(store.project.id, originalData.id, {
      subsequences: (originalData as Task | Milestone).subsequences,
    });
  }
  // 修改目標依賴任務
  // 功能上暫時不需要當知道前任務的依賴項
  // (currentData.value as Task | Milestone).dependencies.push(store.originalDependencyId);
};

// 渲染 dependencies and subsequences 用
const getLeftDistance = (date: Date | undefined): number => {
  if (!date) return 0;
  const duration =
    (date.getTime() - props.startDate.getTime()) / (1000 * 60 * 60 * 24); // 從畫布起始時間計算差額
  return duration * columnWidth - boundaryAdjustment;
};

//目標高度
const getTopDistance = (id: string): number => {
  const height = store.hashTable.get(id)?.height || 0;
  const rowHigh = 48; // 每層 row 高
  return height * rowHigh;
};

const getLeftPoint = (subsequenceStartDate: Date | undefined): number => {
  if (!subsequenceStartDate) return 0;
  let breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    blockWidth.value -
    boundaryAdjustment;
  const isMovingRight = breakpointX <= getLeftDistance(subsequenceStartDate);
  let milestoneAdjustment = 0;
  if (props.data.type == "milestone") {
    if (isMovingRight) {
      milestoneAdjustment += milestonePaddingLeftAfterRotation;
    }
  }

  return (
    (isMovingRight
      ? breakpointX
      : getLeftDistance(subsequenceStartDate) - columnWidth) -
    milestoneAdjustment
  );
};

const getTopPoint = (
  subsequenceId: string,
  subsequenceIndex: string | undefined
): number => {
  if (!subsequenceIndex) return 0;
  const isMovingDown =
    store.projectSequence.findIndex((el) => el.id == props.data.id) <
    store.projectSequence.findIndex((el) => el.id == subsequenceId);
  const breakpointY = topDistance.value + 12;
  return isMovingDown ? breakpointY : getTopDistance(subsequenceId) + 12;
};

const getWidth = (
  subsequenceId: string,
  subsequenceStartDate: Date | undefined
): number => {
  if (!subsequenceStartDate) return 0;
  let breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    blockWidth.value -
    boundaryAdjustment;
  const isMovingRight = breakpointX <= getLeftDistance(subsequenceStartDate);
  let milestoneAdjustment = 0;
  if (props.data.type == "milestone") {
    if (isMovingRight) {
      milestoneAdjustment += milestonePaddingLeftAfterRotation;
    }
  }
  if (store.hashTable.get(subsequenceId)?.type == "milestone") {
    if (isMovingRight) {
      // 差一天不需要加調整
      if (breakpointX != getLeftDistance(subsequenceStartDate)) {
        milestoneAdjustment += milestonePaddingLeftAfterRotation;
      }
    }
  }

  return (
    (isMovingRight
      ? Math.max(
          getLeftDistance(subsequenceStartDate) - breakpointX,
          columnWidth + boundaryAdjustment
        )
      : breakpointX -
        getLeftDistance(subsequenceStartDate) +
        boundaryAdjustment +
        columnWidth * 2) + milestoneAdjustment
  );
};

const getHeight = (
  subsequenceId: string,
  subsequenceIndex: string | undefined
): number => {
  if (!subsequenceIndex) return 0;
  const isMovingDown =
    props.data.height < (store.hashTable.get(subsequenceId)?.height || 0);
  return isMovingDown
    ? // ? getTopDistance(subsequenceId) + 12 + 24 - topDistance.value - 12
      getTopDistance(subsequenceId) + 12 + 24 - topDistance.value - 12
    : topDistance.value - getTopDistance(subsequenceId) + 24;
};

const getIsMovingRight = (subsequenceStartDate: Date | undefined): boolean => {
  let breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    blockWidth.value -
    boundaryAdjustment;
  return breakpointX <= getLeftDistance(subsequenceStartDate);
};

const getPath = (
  subsequenceStartDate: Date | undefined,
  subsequenceId: string,
  subsequenceIndex: string | undefined
): string => {
  if (!subsequenceStartDate || !subsequenceIndex) return "";
  let breakpointX =
    leftDistance.value -
    (props.data.type == "milestone"
      ? milestonePaddingLeft + boundaryAdjustment
      : 0) +
    blockWidth.value -
    boundaryAdjustment;
  const isMovingRight = breakpointX <= getLeftDistance(subsequenceStartDate);
  const isNextDay = breakpointX == getLeftDistance(subsequenceStartDate);
  const isMovingDown =
    props.data.height < (store.hashTable.get(subsequenceId)?.height || 0);
  const width = getWidth(subsequenceId, subsequenceStartDate);
  const height = getHeight(subsequenceId, subsequenceIndex);

  let path = "";
  if (isMovingRight) {
    const milestoneStartPointVariance =
      props.data.type == "milestone" ? milestonePaddingLeftAfterRotation : 0;
    const startX = 0;
    const startY = isMovingDown ? 12 : height - 12;
    const endX = width;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 2), 12);
    const points = [
      { x: startX, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: endY },
      { x: endX, y: endY },
    ];
    // 差一天 L 型
    if (isNextDay) {
      path = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x - curveRadius} ${points[1].y}
        Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
        points[1].y + (isMovingDown ? curveRadius : -curveRadius)
      }
        L ${points[2].x} ${points[2].y - (isMovingDown ? 12 : -curveRadius)}
      `;
    }
    // 差兩天以上 S 型
    else {
      path = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x - curveRadius} ${points[1].y}
        Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
        points[1].y + (isMovingDown ? curveRadius : -curveRadius)
      }
        L ${points[2].x} ${
        points[2].y + (isMovingDown ? -curveRadius : curveRadius)
      }
        Q ${points[2].x} ${points[2].y}, ${points[2].x + curveRadius} ${
        points[2].y
      }
        L ${points[3].x} ${points[3].y}
      `;
    }
  } else {
    const milestoneStartPointVariance =
      props.data.type == "milestone" ? milestonePaddingLeftAfterRotation : 0;
    const milestoneEndPointVariance =
      store.hashTable.get(subsequenceId)?.type == "milestone"
        ? milestonePaddingLeftAfterRotation
        : 0;
    const startX =
      width -
      columnWidth -
      boundaryAdjustment * 2 -
      milestoneStartPointVariance;
    const startY = isMovingDown ? 12 : height - 12;
    const endY = isMovingDown ? height - 12 : 12;
    const curveRadius = Math.min(Math.abs((height - 24) / 4), 12);
    const points = [
      { x: startX, y: startY },
      { x: startX + 16.5 + milestoneStartPointVariance, y: startY },
      {
        x: startX + 16.5 + milestoneStartPointVariance,
        y: startY + (isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      {
        x: 16.5,
        y: startY + +(isMovingDown ? curveRadius * 2 : -curveRadius * 2),
      },
      { x: 16.5, y: endY },
      { x: 33 + milestoneEndPointVariance, y: endY },
    ];

    path = `
      M ${points[0].x} ${points[0].y}
      L ${points[1].x - curveRadius} ${points[1].y}
      Q ${points[1].x} ${points[1].y}, ${points[1].x} ${
      points[1].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      T ${points[2].x - curveRadius} ${points[2].y}
      L ${points[3].x + curveRadius} ${points[3].y}
      Q ${points[3].x} ${points[3].y}, ${points[3].x} ${
      points[3].y + (isMovingDown ? curveRadius : -curveRadius)
    }
      L ${points[4].x} ${
      points[4].y + (isMovingDown ? -curveRadius : curveRadius)
    }
      Q ${points[4].x} ${points[4].y}, ${points[4].x + curveRadius} ${
      points[4].y
    }
      L ${points[5].x} ${points[5].y}
    `;
  }

  return path;
};

const styleInfo = computed(() => {
  let width: number = 0;
  let transition: string;
  if (props.data.type == "milestone") {
    width = props.data.finished_percentage ? 100 : 0;
    transition = "none";
  } else {
    width =
      typeof props.data.finished_percentage === "object"
        ? Math.round(
            (props.data.finished_percentage.completedDays /
              props.data.finished_percentage.totalDays) *
              100
          )
        : props.data.finished_percentage;
    transition = "all";
  }

  let color: string;
  if (props.data.type == "project") {
    color = "#06506F";
  } else if (ownTasks.value) {
    color = "#A6AAB1";
  } else if (props.data.type == "milestone") {
    color = "#fb923c";
  } else {
    color = "#0B95D0";
  }

  let radius: string;
  if (width == 100) {
    radius = "0.18rem";
  } else {
    radius = "0.18rem 0 0 0.18rem";
  }

  return {
    "--width": `${width}%`,
    "--background-color": color,
    "--transition": transition,
    "--radius": radius,
  };
});

const isNearToView = computed<boolean>(() => {
  const rowHeight = 48;
  const marginX = store.scrollPanelWidth;
  const marginY = store.scrollPanelHeight;
  const leftThreshold = store.scrollPanelLeft - marginX;
  const rightThreshold =
    store.scrollPanelLeft + store.scrollPanelWidth + marginX;
  const topThreshold = store.scrollPanelTop - marginY;
  const bottomThreshold =
    store.scrollPanelTop + store.scrollPanelHeight + marginY;
  const constrainX =
    leftDistance.value + blockWidth.value >= leftThreshold &&
    rightThreshold >= leftDistance.value;
  const constrainY =
    props.data.height * rowHeight >= topThreshold &&
    props.data.height * rowHeight <= bottomThreshold;
  return constrainX && constrainY;
});
</script>

<style scoped>
.ganttBlock::before {
  content: "";
  position: absolute;
  width: var(--width);
  height: 100%;
  background-color: var(--background-color);
  top: 0;
  left: 0;
  transition-property: var(--transition);
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  border-radius: var(--radius);
}
</style>
