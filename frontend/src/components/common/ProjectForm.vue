<template>
  <ConfirmModal v-model="isShowModal" :config="modalConfig" />
  <Sidebar
    v-model:visible="computedVisible"
    position="right"
    class="project-form w-[504px] max-w-full"
    blockScroll
  >
    <template #header>
      <h3 class="text-2xl text-primary font-bold">{{ props.title }}</h3>
    </template>
    <form
      v-if="formData"
      @submit.prevent="onSubmit"
      class="mt-5 flex flex-col justify-between h-[calc(100%-20px)] text-primary relative pr-0.5"
    >
      <div class="flex-1 flex flex-col gap-y-10 overflow-y-auto pb-6 custom-scrollbar">
        <div class="px-6">
          <label for="project-name" class="font-bold text-sm">
            專案名稱<span class="text-[#EE4552]">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            v-model="formData.name"
            class="w-full mt-4 input-primary"
            placeholder="請輸入"
            @input="isDataChange = true"
          />
        </div>
        <div class="px-6">
          <label for="project-name" class="font-bold text-sm">
            專案日期<span class="text-[#EE4552]">*</span>
          </label>
          <div class="flex justify-center items-center gap-x-4">
            <Calendar
              v-model="formData.project_date.start_date"
              @update:modelValue="
                () => {
                  if (!formData) return;
                  if (!formData.project_date.start_date) return;
                  formData.project_date.start_date = localToUTC(
                    new Date(formData.project_date.start_date)
                  );
                }
              "
              :manualInput="false"
              showIcon
              placeholder="選擇日期"
              dateFormat="yy-mm-dd"
              :maxDate="formData.project_date.end_date ? formData.project_date.end_date : undefined"
              class="border border-grey-500 w-1/2 mt-2 rounded h-12 px-4"
              style="border-color: #667085"
              pt:input="border-none outline-none border-none"
              @date-select="isDataChange = true"
            />
            <Calendar
              v-model="formData.project_date.end_date"
              @update:modelValue="
                () => {
                  if (!formData) return;
                  if (!formData.project_date.end_date) return;
                  formData.project_date.end_date = localToUTC(
                    new Date(formData.project_date.end_date)
                  );
                }
              "
              :manualInput="false"
              showIcon
              dateFormat="yy-mm-dd"
              placeholder="選擇日期"
              :minDate="
                formData.project_date.start_date ? formData.project_date.start_date : undefined
              "
              class="border w-1/2 h-12 mt-2 rounded px-4"
              style="border-color: #667085"
              pt:input="border-none outline-none border-none"
              @date-select="isDataChange = true"
            />
          </div>
        </div>
        <div v-if="'risk_coefficient' in formData" class="px-6">
          <div for="task-settings" class="font-bold text-sm flex justify-between items-center">
            <div>專案時程(任務)設定<span class="text-[#EE4552]">*</span></div>
            <div class="relative group">
              <QuestionIcon class="cursor-pointer" />
              <RiskCoefficientDescription />
            </div>
          </div>
          <div class="mt-4 space-y-6 text-sm text-primary">
            <div>
              當進度落後大於
              <InputNumber
                v-model="formData.risk_coefficient.existence_risk"
                suffix="%"
                :min="0"
                :max="100"
                placeholder="0%"
                :pt:input:root="[
                  'border w-[60px] px-1 rounded text-sm mx-1',
                  {
                    'border-[#EE4552]':
                      isDataChange &&
                      formData.risk_coefficient.schedule_delay <=
                        formData.risk_coefficient.existence_risk,
                    'border-light':
                      formData.risk_coefficient.schedule_delay >
                      formData.risk_coefficient.existence_risk
                  }
                ]"
                @input="isDataChange = true"
              />
              時，標記為「存在風險」。
            </div>
            <div>
              當進度落後大於
              <InputNumber
                v-model="formData.risk_coefficient.schedule_delay"
                suffix="%"
                :min="0"
                :max="100"
                placeholder="0%"
                :pt:input:root="[
                  'border w-[60px] px-1 rounded text-sm mx-1',
                  {
                    'border-[#EE4552]':
                      isDataChange &&
                      formData.risk_coefficient.schedule_delay <=
                        formData.risk_coefficient.existence_risk,
                    'border-light':
                      formData.risk_coefficient.schedule_delay >
                      formData.risk_coefficient.existence_risk
                  }
                ]"
                @input="isDataChange = true"
              />

              時，標記為「進度落後」。
            </div>
            <div class="text-danger text-xs">*存在風險百分比不得≥進度落後百分比</div>
          </div>
        </div>
        <div v-if="props.title === '編輯專案' && 'creator' in formData" class="px-6">
          <div class="font-bold text-sm">專案建立者</div>
          <div
            class="w-6 h-6 mt-2 rounded-full bg-primary flex justify-center items-center text-xs text-white font-bold"
            v-tooltip.bottom="{
              value: `${formData.creator?.department} ${formData.creator?.name}`,
              pt: { text: 'text-xs' }
            }"
          >
            {{ formData.creator?.name?.[0] }}
          </div>
        </div>
        <div v-if="props.title === '編輯專案' && 'status' in formData" class="flex flex-col px-6">
          <div class="font-bold text-sm">專案狀態</div>
          <div class="flex items-center mt-2 gap-x-6">
            <div class="flex items-center gap-x-1">
              <input
                type="radio"
                id="in-progress"
                name="project-status"
                class="form-radio"
                :value="ProjectStatus.InProgress"
                v-model="formData.status"
                @input="isDataChange = true"
              />
              <label for="in-progress" class="ml-1">進行中</label>
            </div>
            <div class="flex items-center gap-x-1">
              <input
                type="radio"
                id="completed"
                class="form-radio"
                name="project-status"
                :value="ProjectStatus.Completed"
                v-model="formData.status"
                @input="isDataChange = true"
              />
              <label for="completed" class="ml-1">已完成</label>
            </div>
          </div>
        </div>
        <div class="flex flex-col px-6">
          <label for="members" class="font-bold text-sm flex justify-between">
            專案成員
            <div class="relative group">
              <QuestionIcon class="cursor-pointer" />
              <AuthRoleDescription />
            </div>
          </label>

          <div
            v-for="(member, index) in formData.members"
            :key="member.employee_id"
            class="mt-4 flex items-center gap-x-4 hover:bg-[#E1F3FD] transition rounded-lg px-1 py-2"
          >
            <div class="w-3 font-bold ml-1">{{ index + 1 }}</div>
            <Dropdown
              v-model="formData.members[index]"
              :options="availableOptions(index)"
              :loading="!employees"
              filter
              optionLabel="name"
              placeholder="選擇成員"
              filterPlaceholder="搜尋姓名"
              class="w-[182px] border border-[#667085] rounded p-0.5"
              @change="handleMemberChange(index, formData!.members[index])"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value.employee_id" class="flex items-center">
                  <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center">
                  <div>{{ slotProps.option.department + ' ' + slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <Dropdown
              :disabled="!formData.members[index].employee_id"
              v-model="formData.members[index].role_level"
              :options="roleLevelOptions"
              placeholder="選擇權限角色"
              class="w-[182px] border border-[#667085] rounded p-0.5"
              @change="isDataChange = true"
            >
              <template #value="slotProps">
                <span v-if="slotProps.value">
                  {{ roleLevelMap[slotProps.value] }}
                </span>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                {{ roleLevelMap[slotProps.option] }}
              </template>
            </Dropdown>
            <button
              type="button"
              @click="removeMemberSelect(index)"
              class="w-8 h-8 rounded-full btn-white-hover flex justify-center items-center"
            >
              <DeleteIcon color="#1D2939" />
            </button>
          </div>
          <button
            id="add-member"
            type="button"
            class="w-8 h-8 mt-2 bg-[#F2F4F7] flex justify-center items-center rounded-full cursor-pointer btn-white-hover"
            @click="incrementMemberSelect"
          >
            <AddUserIcon />
          </button>
        </div>
        <div
          v-if="props.title === '新增專案' || route.path.includes('schedule')"
          class="flex flex-col px-6"
        >
          <label for="name" class="font-bold text-sm">工作日設定</label>
          <div class="flex gap-2 mt-4">
            <button
              v-for="(day, index) in formData?.work_days_setting"
              :key="index"
              class="px-4 py-1.5 text-white font-bold rounded-full transition"
              :class="day.is_work_day ? 'bg-primary' : 'bg-disable'"
              type="button"
              @click="onToggle(day)"
            >
              {{ day.name }}
            </button>
          </div>
        </div>
        <template v-if="props.title === '編輯專案' && 'columns' in formData">
          <div v-for="col in customizedColumns" :key="col.id" class="px-6">
            <div>
              <label :for="'customized column' + col.id" class="font-bold text-sm">
                {{ col.column_name }}
              </label>
              <input
                :id="'customized column' + col.id"
                type="text"
                v-model="formData.columns!.find((c) => c.id === col.id)!.data"
                class="w-full mt-4 input-primary"
                placeholder="請輸入"
                @input="isDataChange = true"
              />
            </div>
          </div>
        </template>
      </div>
      <div
        class="sticky bottom-0 px-5 sm:px-6 pt-3 flex gap-x-4 sm:gap-x-6 justify-end border-t border-light"
      >
        <button
          id="remove-project"
          v-if="props.title === '編輯專案'"
          type="button"
          class="flex justify-center items-center gap-x-2 px-3 sm:px-6 py-[11px] text-danger font-bold rounded-lg hover:bg-[#FFF0F0] transition text-sm sm:text-base"
          :disabled="isRemovePending"
          @click="onDelete"
        >
          <DeleteIcon color="#FB0707" />
          <span>刪除專案</span>
        </button>
        <button type="button" @click="onClose" class="text-sm sm:text-base btn-outline">
          取消
        </button>
        <button
          type="submit"
          :disabled="isFormDataEmpty || isRiskHigh || isCreatePending || isUpdatePending"
          class="text-sm sm:text-base btn-primary"
        >
          儲存
        </button>
      </div>
    </form>
  </Sidebar>
</template>

<script setup lang="ts">
import { type Ref, ref, inject, computed, watch, watchEffect, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useToast } from 'primevue/usetoast';
import Sidebar from 'primevue/sidebar';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

import {
  type Employee,
  type Column,
  type ColumnData,
  type Week,
  type Project,
  type ProjectFormData,
  type ProjectSubmitData,
  ProjectStatus
} from '@/types/project';
import { RoleLevelType, roleLevelMap } from '@/types/project';
import { createProject, updateProject, removeProject } from '@/api/projects';
import { useScheduleStore } from '@/stores/schedule';
import { useAuthStore } from '@/stores/auth';
import { localToUTC } from '@/utils';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import RiskCoefficientDescription from '@/components/projects/RiskCoefficientDescription.vue';
import AuthRoleDescription from '@/components/projects/AuthRoleDescription.vue';
import QuestionIcon from '@/assets/icons/question.svg';
import AddUserIcon from '@/assets/icons/add-user.svg';
import DeleteIcon from '@/assets/icons/delete.svg';

const roleLevelOptions = [
  RoleLevelType.Admin,
  RoleLevelType.Editor,
  RoleLevelType.Replyer,
  RoleLevelType.Viewer
];

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const projects = defineModel<Project[]>('projects');
const totalDataCount = defineModel<number>('totalDataCount');

const props = defineProps<{
  title: string;
  project?: Project;
  columns?: Column[];
  isOrg?: boolean;
}>();

const formData = ref<ProjectFormData | null>(null);
const employees = inject<Ref<Employee[]>>('employees', ref([]));

const visible = defineModel<boolean>();
const computedVisible = computed({
  get: () => visible.value,
  set: (newVal) => {
    if (!newVal && isDataChange.value) {
      isShowModal.value = true;
      modalConfig.value = {
        message: '資料變更尚未儲存，是否儲存編輯',
        leftButton: {
          text: '關閉視窗',
          command: onClose
        },
        rightButton: {
          text: '儲存編輯',
          command: onSubmit
        }
      };
    } else {
      visible.value = false;
      isDataChange.value = false;
    }
  }
});
const isShowModal = ref<boolean>(false);
const modalConfig = ref({
  message: '',
  leftButton: {
    text: '',
    command: () => {}
  },
  rightButton: {
    text: '',
    command: () => {}
  }
});
const isDataChange = ref<boolean>(false);

const selectedMemberIds = ref<number[]>([]);

const availableOptions = computed(() => {
  return (index: number) => {
    if (!employees.value) return [];

    const creatorId =
      props.title === '新增專案'
        ? authStore.currentEmployeeId
        : formData.value?.creator?.employee_id;

    const allMembers = toRaw(employees.value)
      // 過濾掉專案建立者
      .filter((member: Employee) => member.employee_id !== creatorId);
    // 取得其他下拉式選單中已選取的成員 ID 列表，排除目前下拉選單中已選取的成員
    const selectedMembersForOthers = formData
      .value!.members.filter((_, i) => i !== index)
      .map((member) => member.employee_id);

    return allMembers.filter((member: Employee) => {
      // 該成員是否已被其他下拉選單選擇
      const isSelected = selectedMembersForOthers.includes(member.employee_id!);
      // 該成員是否是目前下拉選單中已選取的成員
      const isCurrentMember = formData.value!.members[index]?.employee_id === member.employee_id;
      // 如果該成員既沒有被其他下拉選單選擇，也不是當前下拉選單中已選擇的成員，那麼它就不會被過濾掉
      return !isSelected || isCurrentMember;
    });
  };
});

// 檢查是否有人員沒有選擇權限角色
const hasSelectedMemberWithoutRole = computed(() => {
  if (!formData.value) return false;
  return formData.value.members.some((member) => member.employee_id && !member.role_level);
});

const handleMemberChange = (index: number, selectedMember: Employee | null) => {
  isDataChange.value = true;
  if (selectedMember) {
    // 如果選擇了一個新的成員，將其 ID 新增至 selectedMemberIds 中
    selectedMemberIds.value = Array.from(
      new Set([...selectedMemberIds.value, selectedMember.employee_id])
    );
  } else {
    // 如果取消選擇了一個成員
    const memberId = formData.value!.members[index].employee_id;
    // 從 selectedMemberIds 移除該成員的 ID
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => id !== memberId);
    formData.value!.members = formData.value!.members.map((member, i) => {
      if (i === index) {
        // 將該成員的 id 屬性設為空字串，觸發所有下拉選單的重新渲染
        return { ...member, id: '' };
      }
      return member;
    });
  }
};

const newMember: Employee = {
  employee_id: 0,
  name: '',
  department: ''
};

const initFormData = () => {
  formData.value = {
    name: '',
    risk_coefficient: {
      existence_risk: 0,
      schedule_delay: 0
    },
    members: [newMember],
    project_date: {
      start_date: null,
      end_date: null
    },
    work_days_setting: [
      { name: '日', is_work_day: false },
      { name: '一', is_work_day: true },
      { name: '二', is_work_day: true },
      { name: '三', is_work_day: true },
      { name: '四', is_work_day: true },
      { name: '五', is_work_day: true },
      { name: '六', is_work_day: false }
    ],
    is_org: props.isOrg
  };
};

watchEffect(() => {
  if (props.title === '編輯專案' && visible.value && props.project) {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { can_modify, ...filteredData } = props.project;
    formData.value = JSON.parse(JSON.stringify(filteredData));
  } else {
    initFormData();
  }
});

watchEffect(() => {
  if (
    formData.value &&
    typeof formData.value.project_date.start_date === 'string' &&
    typeof formData.value.project_date.end_date === 'string'
  ) {
    formData.value.project_date.start_date = new Date(formData.value.project_date.start_date);
    formData.value.project_date.end_date = new Date(formData.value.project_date.end_date);
  }
});

const isRiskHigh = computed<boolean>(() => {
  const { risk_coefficient } = formData.value!;
  return risk_coefficient?.existence_risk >= risk_coefficient?.schedule_delay;
});

const isFormDataEmpty = computed<boolean>(() => {
  const {
    name,
    project_date: { start_date, end_date }
  } = formData.value!;
  const isNameEmpty = !name;
  const isDateEmpty = !start_date || !end_date;
  return isNameEmpty || isDateEmpty || hasSelectedMemberWithoutRole.value;
});

const customizedColumns = computed(() => {
  return props.columns?.filter((column: Column) => column.is_customized);
});

const queryClient = useQueryClient();

const { mutate: createMutate, isPending: isCreatePending } = useMutation({
  mutationFn: createProject
});

const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
  mutationFn: updateProject
});

const { mutate: removeMutate, isPending: isRemovePending } = useMutation({
  mutationFn: removeProject
});

const incrementMemberSelect = () => {
  if (!formData.value) return;
  formData.value.members.push(newMember);
};
const removeMemberSelect = (index: number) => {
  if (!formData.value) return;
  formData.value.members.splice(index, 1);
};

const handleCreateProject = (submitData: ProjectSubmitData) => {
  if (!submitData) return;

  createMutate(submitData, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.add({ severity: 'success', summary: '新增專案成功', life: 3000 });
      onClose();
    },
    onError: (error) => {
      console.error(error.message);
      toast.add({ severity: 'error', summary: '新增專案失敗', life: 3000 });
    }
  });
};

const handleUpdateProject = (submitData: ProjectSubmitData) => {
  if (!submitData || !(props.columns?.length && 'columns' in submitData)) return;

  if (submitData.creator) delete submitData.creator;

  const customizedColumnIds = customizedColumns.value?.map((col) => col.id);

  // 更新欄位資料
  submitData.columns = submitData.columns!.filter(
    (col: ColumnData) => customizedColumnIds?.includes(col.id) || false
  );

  updateMutate(submitData, {
    onSuccess: () => {
      if (props.project?.project_id && route.path.includes(props.project.project_id)) {
        queryClient.invalidateQueries({ queryKey: ['project', props.project.project_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['columns'] });
      }
      toast.add({ severity: 'success', summary: '專案編輯成功', life: 3000 });
      onClose();
    },
    onError: (error) => {
      console.error(error.message);
      toast.add({ severity: 'error', summary: '專案編輯失敗', life: 3000 });
    }
  });
};

const handleRemoveProject = () => {
  if (!props.project?.project_id) return;
  // 移除專案
  removeMutate(props.project.project_id, {
    onSuccess: () => {
      if (projects.value) {
        projects.value = projects.value.filter(
          (project) => project.project_id !== props.project!.project_id
        );
      }

      if (totalDataCount.value) totalDataCount.value -= 1;

      toast.add({ severity: 'success', summary: '刪除成功', life: 3000 });
      onClose();
      if (route.name === 'list' || route.name === 'schedule') {
        router.push({ name: 'projects' });
      }
    },
    onError: () => {
      toast.add({ severity: 'error', summary: '刪除失敗', life: 3000 });
    }
  });
};

const onToggle = (day: Week): void => {
  day.is_work_day = !day.is_work_day;
  isDataChange.value = true;
};

const onClose = (): void => {
  visible.value = false;
  initFormData();
};

const onSubmit = (): void => {
  if (!formData.value) return;

  if (isFormDataEmpty.value) {
    toast.add({ severity: 'error', summary: '缺少必填資料', life: 3000 });
    return;
  }

  if (isRiskHigh.value) {
    toast.add({ severity: 'error', summary: '存在風險百分比不得≥進度落後百分比', life: 3000 });
    return;
  }

  const filteredProject = JSON.parse(JSON.stringify(formData.value));

  filteredProject.project_date.start_date = new Date(filteredProject.project_date.start_date)!
    .toISOString()
    .split('T')[0];

  filteredProject.project_date.end_date = new Date(filteredProject.project_date.end_date)!
    .toISOString()
    .split('T')[0];

  // 過濾掉 id 為 0 的成員及多餘的資料
  filteredProject.members = filteredProject.members
    .filter((member: Employee) => member.employee_id !== 0)
    .map((member: Employee) => ({
      employee_id: member.employee_id,
      role_level: member.role_level
    }));

  if (props.title === '新增專案') {
    // 編輯專案
    handleCreateProject(filteredProject);
  } else {
    // 新增專案
    handleUpdateProject(filteredProject);
  }
};

const onDelete = (): void => {
  isShowModal.value = true;
  modalConfig.value = {
    message: '是否確定刪除專案？',
    leftButton: {
      text: '取消',
      command: () => (isShowModal.value = false)
    },
    rightButton: {
      text: '確定',
      command: handleRemoveProject
    }
  };
};

watch(
  () => scheduleStore.shouldUpdateFormDate,
  () => {
    if (!scheduleStore.shouldUpdateFormDate) return;
    if (!props.project) return;

    let startDate: Date = new Date(props.project.project_date.start_date);
    if (scheduleStore.shouldUpdateFormDate == 'left') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    let endDate: Date = new Date(props.project.project_date.end_date);
    if (scheduleStore.shouldUpdateFormDate == 'right') {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const { can_modify, ...filteredData } = props.project;
    formData.value = JSON.parse(JSON.stringify(filteredData)) as ProjectFormData;
    formData.value.project_date.start_date = startDate;
    formData.value.project_date.end_date = endDate;

    onSubmit();
    scheduleStore.shouldUpdateFormDate = '';
  }
);
</script>

<style>
.project-form {
  .p-sidebar-content {
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
}
</style>
