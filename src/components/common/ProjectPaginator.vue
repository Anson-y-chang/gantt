<template>
  <div
    style="box-shadow: 0px -4px 12px 0px #f0f0f0"
    class="w-full h-20 px-2 md:px-16 bg-white flex justify-end items-center gap-x-4 md:gap-x-10 text-primary"
  >
    <span class="hidden md:inline">每頁資訊</span>
    <DropDown
      v-model="perPage"
      :options="pageOptions"
      optionLabel="label"
      optionValue="value"
      class="w-32 md:w-[136px] border border-[#98A2B3]"
      pt:input="text-sm md:text-base"
      @change="changePerPage"
    />
    <span class="text-sm md:text-base">共 {{ props.totalDataCount }} 筆</span>
    <div class="flex items-center gap-x-2 md:gap-x-10">
      <button
        type="button"
        aria-label="First Page"
        class="disabled:cursor-not-allowed"
        :class="{
          'text-primary': currentPage !== 1,
          'text-tertiary': currentPage === 1
        }"
        :disabled="currentPage === 1"
        @click="changePage('first')"
      >
        <LeftEndIcon />
      </button>
      <button
        type="button"
        aria-label="Previous Page"
        class="disabled:cursor-not-allowed"
        :class="{
          'text-primary': currentPage !== 1,
          'text-tertiary': currentPage === 1
        }"
        :disabled="currentPage === 1"
        @click="changePage('previous')"
      >
        <LeftIcon />
      </button>
      <span class="font-medium">{{ currentPage }}</span>
      <button
        type="button"
        aria-label="Next Page"
        class="disabled:cursor-not-allowed"
        :class="{
          'text-primary': currentPage !== props.lastPage,
          'text-tertiary': currentPage === props.lastPage
        }"
        :disabled="currentPage === props.lastPage"
        @click="changePage('next')"
      >
        <RightIcon />
      </button>
      <button
        type="button"
        aria-label="Last Page"
        class="disabled:cursor-not-allowed"
        :class="{
          'text-primary': currentPage !== props.lastPage,
          'text-tertiary': currentPage === props.lastPage
        }"
        :disabled="currentPage === props.lastPage"
        @click="changePage('last')"
      >
        <RightEndIcon />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import DropDown from 'primevue/dropdown';
import LeftEndIcon from '@/assets/icons/left-end.svg';
import LeftIcon from '@/assets/icons/left.svg';
import RightIcon from '@/assets/icons/right.svg';
import RightEndIcon from '@/assets/icons/right-end.svg';

const props = defineProps<{ totalDataCount?: number; lastPage: number }>();
const currentPage = defineModel<number>('currentPage');
const perPage = defineModel<number>('perPage');

const pageOptions = ref([
  { label: '100 　 筆', value: 100 },
  { label: '60　　筆', value: 60 },
  { label: '30　　筆', value: 30 },
  { label: '10　　筆', value: 10 }
]);

const queryClient = useQueryClient();

const changePerPage = () => {
  if (!perPage.value) return;
  currentPage.value = 1;
  queryClient.invalidateQueries({ queryKey: ['projects'] });
};

const changePage = (direction: 'first' | 'previous' | 'next' | 'last') => {
  if (!currentPage.value) return;

  let newPage = currentPage.value;
  switch (direction) {
    case 'first':
      newPage = 1;
      break;
    case 'previous':
      if (currentPage.value > 1) {
        newPage -= 1;
      }
      break;
    case 'next':
      if (currentPage.value < props.lastPage) {
        newPage += 1;
      }
      break;
    case 'last':
      newPage = props.lastPage;
      break;
  }
  currentPage.value = newPage;
  queryClient.invalidateQueries({ queryKey: ['projects'] });
};
</script>
