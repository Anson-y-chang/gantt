<template>
  <div
    class="flex-1"
    :class="{
      'absolute left-[24px] w-full z-10 ': showInput,
      'overflow-hidden': !showInput,
    }"
    style="max-width: calc(100% - 32px)"
  >
    <div class="relative">
      <div
        v-if="!showInput"
        @click="toggleInput"
        class="w-full h-[30px] border border-transparent rounded p-1 hover:border-light hover:bg-white cursor-text"
        :class="{ 'hover:!border-primary': isSelected }"
      >
        <div class="whitespace-nowrap cursor-text overflow-hidden">
          {{ data.name }}
        </div>
      </div>
      <input
        v-else
        ref="input"
        class="w-full p-1 outline-none border border-primary rounded pr-7"
        type="text"
        v-model="currentData.name"
        @blur="toggleInput"
        @keydown.enter="blurAndAdd"
        @keydown.esc="blur"
        @focus="selectContent"
      />
      <Button
        v-show="showInput"
        class="w-[16px] h-[16px] p-0.5 rounded absolute top-1.5 right-2 hover:bg-primary-200"
        @click="toggleInput"
      >
        <img :src="checkSolidIcon" alt="" class="-translate-y-[1px]" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import type { Project, Section, Task, Milestone } from "@/types/schedule";

// icon
const checkSolidIcon = new URL(
  "@/assets/icons/check-solid.svg",
  import.meta.url
).href;

// init
const { project } = useScheduleStore();
const props = defineProps<{
  data: Section | Task | Milestone;
  rowIndex: string;
  editingName: boolean;
  isSelected: boolean;
  isMilestone: boolean;
}>();
const emit = defineEmits([
  "rename",
  "addTask",
  "deleteRow",
  "createTask",
  "updateTaskName",
]);
const trace = computed(() => {
  return props.rowIndex.split("-");
});

// function:input
const showInput = ref<boolean>(false);
const input = ref<HTMLInputElement>();

const currentData = computed(() => {
  let current: Section | Task = project.sections[Number(trace.value[0])];
  for (let i = 1; i < trace.value.length; i++) {
    current = current.tasks[Number(trace.value[i])] as Task;
  }
  return current;
});

const originalNameValue = ref<string>(props.data.name);
const toggleInput = (): void => {
  if (showInput.value) {
    // 無任務名稱
    if (props.data.name.trim() == "") {
      // 還未在DB建立資料可直接刪除
      if (props.data.id.slice(0, 4) == "temp") {
        emit("deleteRow");
      }
      // 不然就回上一動
      else {
        currentData.value.name = originalNameValue.value;
      }
    }
    // 不然就發API更新名稱
    else {
      if (props.data.id.slice(0, 4) != "temp") {
        emit("updateTaskName");
      } else {
        let parentData: Project | Section | Task = project;
        for (let i = 0; i < trace.value.length - 1; i++) {
          if (i == 0) {
            parentData = project.sections[Number(trace.value[i])] as Section;
          } else {
            parentData = (parentData as Section | Task).tasks[
              Number(trace.value[i])
            ] as Task;
          }
        }

        const formerId =
          parentData.type == "project"
            ? parentData.sections[
                Number(trace.value[trace.value.length - 1]) - 1
              ]?.id
            : parentData.tasks[Number(trace.value[trace.value.length - 1]) - 1]
                ?.id;

        emit("createTask", formerId);
      }
    }

    emit("rename", false);
    showInput.value = false;
  } else {
    originalNameValue.value = props.data.name;
    emit("rename", true);
    showInput.value = true;
  }
};

const selectContent = (event: Event) => {
  const target = event.target as HTMLInputElement;
  target.select();
};

// through key down event to invoke blur preventing event conflict
const blur = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  target.blur();
};

const blurAndAdd = (event: Event): void => {
  blur(event);
  // 任務無內容則刪除
  if (props.data.name && !props.isMilestone) {
    emit("addTask");
  }
};

// activate input when user choose to rename
watch(
  () => props.editingName,
  () => {
    if (props.editingName) {
      showInput.value = true;
      nextTick(() => {
        input.value?.focus();
      });
    }
  }
);
</script>

<style scoped>
/* 反選樣式 */
input:focus::selection {
  background-color: #bde7fa;
  color: #1d2939;
}

/* 適用於 Firefox 瀏覽器 */
input:focus::-moz-selection {
  background-color: #bde7fa;
  color: #1d2939;
}
</style>
