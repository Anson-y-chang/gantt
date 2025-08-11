<template>
  <button type="button" aria-label="員工資訊" :class="$attrs.class" @click="openUserInfo">
    <slot />
  </button>
  <OverlayPanel ref="op" class="p-4 w-80" :class="$attrs.class">
    <div class="flex justify-between items-center gap-x-16">
      <div class="flex flex-col w-1/2">
        <span class="text-xl font-bold">{{ userInfo?.name }}</span>
        <span class="text-tertiary text-sm font-semibold">{{ userInfo?.job_title }}</span>
      </div>
      <div class="w-1/2">
        <button type="button" class="btn-primary w-full" @click="authStore.logout()">登出</button>
      </div>
    </div>
    <div class="mt-8 flex justify-between items-center gap-x-16">
      <div class="flex flex-col w-1/2">
        <span class="text-tertiary text-sm font-semibold">員工編號</span>
        <span class="font-semibold">{{ userInfo?.employee_no }}</span>
      </div>
      <div class="flex flex-col w-1/2">
        <span class="text-tertiary text-sm font-semibold">部門</span>
        <span class="font-semibold">{{ userInfo?.department }}</span>
      </div>
    </div>
  </OverlayPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import OverlayPanel from 'primevue/overlaypanel';
import { useAuthStore } from '@/stores/auth';
import { fetchEmployee } from '@/api/projects';

const authStore = useAuthStore();

const { data: userInfo } = useQuery({
  queryKey: ['user'],
  queryFn: () => fetchEmployee()
});

const op = ref();
const openUserInfo = (event: Event) => {
  op.value.toggle(event);
};
</script>
