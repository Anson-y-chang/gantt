<template>
  <button
    type="button"
    aria-label="查看專案成員"
    :class="$attrs['btn-class']"
    @click="visible = !visible"
  >
    <slot />
  </button>
  <Dialog v-model:visible="visible" dismissableMask modal class="w-[326px]">
    <template #header>
      <h1 class="font-bold text-2xl text-primary">專案成員</h1>
    </template>

    <div class="mt-4">
      <h3 class="font-bold text-sm text-primary">專案建立者</h3>
      <div
        class="rounded-full w-6 h-6 text-xs text-white flex justify-center items-center bg-primary mt-2"
        v-tooltip.bottom="{
          value: `${props.creator.department} ${props.creator.name}`,
          pt: { text: 'text-xs' }
        }"
      >
        {{ props.creator.name![0] }}
      </div>
    </div>
    <div class="mt-6 text-primary">
      <h3 class="font-bold text-sm">專案成員（共 {{ members.length }} 人）</h3>
      <div class="flex flex-wrap mt-2">
        <div
          v-for="(member, index) in props.members"
          :key="member.employee_id"
          class="rounded-full w-6 h-6 text-xs font-bold text-white flex justify-center items-center mx-px my-0.5"
          :style="{ backgroundColor: AVATAR_COLORS[index % 10] }"
          v-tooltip.bottom="{
            value: `${member.department} ${member.name}`,
            pt: { text: 'text-xs' }
          }"
        >
          {{ member.name?.[0] }}
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import type { Employee } from '@/types/project';
import { AVATAR_COLORS } from '@/constants/colors';

const props = defineProps<{
  creator: Employee;
  members: Employee[];
}>();
const visible = ref(false);
</script>
