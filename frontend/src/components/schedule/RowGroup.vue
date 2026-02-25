<template>
  <div
    :draggable="isDraggable"
    @dragstart="dragstart"
    @drag="drag"
    @dragend="dragend"
    class="relative"
    :class="{
      hidden: store.filterSelf && !data.isAssignedToCurrentUser,
    }"
  >
    <!-- main row -->
    <RowHeader
      :data
      :rowIndex
      :dragCollapse
      @collapse="collapse"
      @enableDrag="isDraggable = true"
      @disableDrag="isDraggable = false"
      :workDays
      :members
      :parent_id
      :isShow
    ></RowHeader>
    <!-- sub row -->
    <template v-if="isNotMilestone(data)">
      <RowGroup
        v-for="(element, index) in data.tasks"
        v-show="!data.is_collapsed && dragCollapse"
        :key="element.id"
        :data="element"
        :rowIndex="rowIndex + '-' + index"
        :workDays
        :members
        :parent_id="data.id"
        :isShow="
          isShow &&
          !data.is_collapsed &&
          (!store.filterSelf || element.isAssignedToCurrentUser)
        "
      ></RowGroup>
    </template>
    <!-- add task row  -->
    <div
      v-if="isSection"
      v-show="!(data as Section).is_collapsed && dragCollapse"
      class="flex list-row"
    >
      <div v-if="store.viewSetting.order" class="w-[41px]"></div>
      <div class="w-[69px]"></div>
      <div class="grow">
        <Button
          class="ml-5 p-2 flex items-center cursor-pointer select-none hover:bg-primary-200"
          @click="addTask"
          :disabled="isLastChildCreated || store.filterSelf"
        >
          <img :src="addIcon" alt="add_task" class="inline-block mr-3 w-4" />
          <span>新增任務</span>
        </Button>
      </div>
      <div class="w-[107px]"></div>
      <div class="w-[107px]"></div>
      <div class="w-[86px]"></div>
      <div class="w-[107px]"></div>
      <div class="w-[86px]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, nextTick } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import RowHeader from "./RowHeader.vue";
import { type Milestone, type Task, type Section } from "@/types/schedule";
import { nanoid } from "nanoid";
import { useToast } from "primevue/usetoast";

// icon
const addIcon = new URL("@/assets/icons/add.svg", import.meta.url).href;

// init
const toast = useToast();
const props = defineProps<{
  parent_id: string;
  data: Section | Task | Milestone;
  rowIndex: string;
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
  isShow: boolean;
}>();
const { project } = useScheduleStore();
const store = useScheduleStore();
// const authStore = useAuthStore();
const isSection = computed(() => {
  return props.data.type == "section";
});
const isNotMilestone = (
  data: Section | Task | Milestone
): data is Section | Task => {
  return "tasks" in data;
};
const currentData = computed((): Section | Task | Milestone => {
  let current: Section | Task | Milestone =
    project.sections[Number(props.rowIndex.split("-")[0])];
  for (let i = 1; i < props.rowIndex.split("-").length; i++) {
    current = current.tasks[Number(props.rowIndex.split("-")[i])] as Task;
  }
  return current;
});
const isDraggable = ref<boolean>(false);

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
    after?: string;
    start_date?: Date;
    end_date?: Date;
    finished_percentage?: number;
    duration_in_days?: number;
    todos?: { isFinished: boolean; value: string; id: string }[];
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

// add task to the last
const addTask = (): void => {
  const tempId = "temp" + nanoid();
  project.sections[Number(props.rowIndex)].tasks.push({
    name: "",
    start_date: undefined,
    end_date: undefined,
    duration_in_days: undefined,
    assignees: [],
    finished_percentage: 0,
    tasks: [],
    id: tempId,
    type: "task",
    is_collapsed: false,
    description: "",
    dependencies: [],
    subsequences: [],
    todos: [],
    isHovered: false,
    height: 1,
    occupiedRow: 1,
    isAssignedToCurrentUser: false,
  });

  store.selectedRowId = tempId;
};

// collapse
const collapse = (isCollapsed?: boolean): void => {
  if (currentData.value) {
    if (isCollapsed != undefined) {
      (currentData.value as Section | Task).is_collapsed = isCollapsed;
    } else {
      (currentData.value as Section | Task).is_collapsed = !(
        props.data as Section | Task
      ).is_collapsed;
    }
  }
};

// drag
const initial = ref<{ offsetX: number; offsetY: number }>({
  offsetX: 0,
  offsetY: 0,
}); // 初始化数据记录
const dragCollapse = ref<boolean>(true);
const dragstart = (event: DragEvent): void => {
  if (!store.isDragging) return;
  // init
  const dataTransfer: DataTransfer = event.dataTransfer as DataTransfer;
  dataTransfer.effectAllowed = "move"; // set the mouse icon when drag
  dataTransfer.setData("text/plain", "dummy text"); // preventing firefox from doing nothing when data is empty
  const img = new Image();
  dataTransfer.setDragImage(img, 0, 0);

  // 設定 clone 元素
  const clone = document.createElement("div");
  clone.id = "clone";
  clone.className =
    "absolute z-50 w-[300px] h-12 pl-6 pr-2 py-1 pointer-events-none bg-white opacity-80 border rounded shadow flex items-center truncate";
  clone.innerHTML = props.data.name;
  initial.value.offsetX = event.offsetX - 69;
  initial.value.offsetY = event.offsetY;
  clone.style.left = event.clientX - initial.value.offsetX + "px";
  clone.style.top = event.clientY - initial.value.offsetY + "px";
  document.body.appendChild(clone);

  // 設定資料
  if (store.isDragging == "Section") {
    store.dragData = currentData.value as Section;
  } else if (store.isDragging == "Others") {
    event.stopPropagation();
    store.dragData = currentData.value as Task | Milestone;
    store.dragTrace = props.rowIndex.split("-");
  }

  // 關閉子任務
  setTimeout(() => {
    store.lastShowRowsStatus = (props.data as Section | Task).is_collapsed;
    dragCollapse.value = false;
  }, 0);
};

const drag = (event: DragEvent): void => {
  if (!store.isDragging) return;

  // 調整 clone 位置
  event.stopPropagation();
  const clone = document.getElementById("clone");
  if (clone) {
    clone.style.left = event.clientX - initial.value.offsetX + "px";
    clone.style.top = event.clientY - initial.value.offsetY + "px";
  }
};

const dragend = (event: DragEvent): void => {
  if (!store.isDragging) return;

  event.stopPropagation();
  // del clone
  const clone = document.getElementById("clone");
  if (clone) {
    clone.parentNode?.removeChild(clone);
  }

  if (isSection.value) {
    nextTick(() => {
      // 拖到最後一筆後面沒任務，用after紀錄排序
      if (store.project.sections.length - 1 == Number(props.rowIndex)) {
        updateTaskAPI(store.project.id, props.data.id, {
          parent_id: props.parent_id,
          after: store.project.sections[Number(props.rowIndex) - 1]?.id,
        });
      } else {
        updateTaskAPI(store.project.id, props.data.id, {
          parent_id: props.parent_id,
          before: store.project.sections[Number(props.rowIndex) + 1]?.id,
        });
      }
    });
  }

  dragCollapse.value = true;

  // reset drag info
  store.isDragging = undefined;
  store.dragData = undefined;
  store.dragTrace = [];
  store.lastShowRowsStatus = true;
  store.dragoverId = "";
  store.dragoverTrace = [];
  store.dragoverPosition = undefined;
};

// 控制新增任務按鈕用
const isLastChildCreated = computed(() => {
  if (props.data.type == "section") {
    if (props.data.tasks.length) {
      return props.data.tasks[props.data.tasks.length - 1].id.startsWith(
        "temp"
      );
    } else {
      return false;
    }
  } else {
    return false;
  }
});

// 顯示自己篩選 bottom-up
const isAssignedToCurrentUser = computed(() => {
  if (props.data.type == "task") {
    return props.data.assignees.some(
      // (assignee) => assignee.id == authStore.currentEmployeeId
      (assignee) => assignee.id == 11
    );
  } else {
    return false;
  }
});

const isChildAssignedToCurrentUser = computed(() => {
  if (props.data.type == "milestone") {
    return false;
  } else {
    return props.data.tasks.some(
      (el: Task | Milestone) => el.isAssignedToCurrentUser
    );
  }
});

watchEffect(() => {
  currentData.value.isAssignedToCurrentUser =
    isAssignedToCurrentUser.value || isChildAssignedToCurrentUser.value;
});
</script>

<style scoped>
.list-row > :nth-child(2) {
  padding-left: 8px;
}

/* .list-row > :not(:nth-child(8n + 1)) { */
.list-row > :not(:first-child) {
  border-left: 1px #d0d5dd solid;
}
</style>
