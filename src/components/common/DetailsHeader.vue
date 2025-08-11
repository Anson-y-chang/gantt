<template>
  <ProjectForm
    v-if="props.project && props.project.can_modify"
    title="編輯專案"
    :columns="props.columns"
    :project="props.project"
    v-model="isShowEditSidebar"
  />
  <header
    class="w-full h-24 flex justify-between items-center px-2 md:px-6 py-4 border-light text-nowrap"
    :class="{ 'border-b': route.name != 'schedule' }"
  >
    <template v-if="props.project">
      <div class="flex gap-x-1 md:gap-x-4 items-center">
        <button
          type="button"
          aria-label="返回"
          class="flex gap-x-4 px-1 md:px-2 py-1 rounded-lg btn-white-hover"
          @click="backToLastPage"
        >
          <ReturnIcon class="scale-75 md:scale-100" />
          <span class="hidden md:block">返回</span>
        </button>
        <h1 class="text-base md:text-3xl font-bold md:ml-4 max-w-32 sm:max-w-none truncate">
          {{ project?.name }}
        </h1>
        <div
          v-if="props.project.status"
          class="rounded-full bg-primary text-xs md:text-base text-white px-2 md:px-4 py-1 font-bold"
        >
          <template v-if="props.project.status === ProjectStatus.InProgress">進行中</template>
          <template v-else-if="props.project.status === ProjectStatus.Completed">已完成</template>
        </div>
        <button
          v-if="props.project.can_modify"
          type="button"
          aria-label="編輯專案"
          class="flex flex-col justify-center items-center w-8 h-8 rounded-full btn-white-hover"
          @click="openEditSidebar"
        >
          <EditIcon />
        </button>
      </div>
      <MemberDetails
        v-if="route.name === 'list'"
        btn-class="px-2 py-1 rounded text-xs font-bold border border-button md:btn-outline"
        :creator="props.project.creator"
        :members="props.project.members"
      >
        查看專案成員
      </MemberDetails>
    </template>
  </header>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ProjectStatus, type Column, type Project } from '@/types/project';
import ProjectForm from '@/components/common/ProjectForm.vue';
import MemberDetails from '@/components/common/MemberDetails.vue';
import EditIcon from '@/assets/icons/edit.svg';
import ReturnIcon from '@/assets/icons/return.svg';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  columns: Column[] | undefined;
  project: Project | undefined;
}>();

const isShowEditSidebar = ref(false);

const openEditSidebar = () => {
  isShowEditSidebar.value = true;
};

const backToLastPage = () => {
  const entryRoute = sessionStorage.getItem('entry_route');

  switch (entryRoute) {
    case 'dashboard':
      router.push('/');
      break;
    case 'projects':
      router.push('/p');
      break;
    case 'permission-org-projects':
      router.push('/permission/org-projects');
      break;
    default:
      router.push('/');
      break;
  }
};

onBeforeUnmount(() => {
  sessionStorage.removeItem('entry_route');
});
</script>
