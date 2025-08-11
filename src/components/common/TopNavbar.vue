<template>
  <nav
    class="w-full fixed top-[68px] lg:top-0 h-[84px] flex justify-between items-center bg-white z-10 px-12 shadow-md"
  >
    <ul class="flex gap-12 h-full">
      <li
        v-for="({ name, tab }, index) in props.tabs"
        :key="index"
        class="nav-item px-2 h-full text-lg cursor-pointer transition flex items-center relative hover:font-bold hover:text-primary"
        :class="{
          'active font-bold': tab === props.currentTab,
          'text-tertiary': tab !== props.currentTab
        }"
        @click="emit('update', tab)"
      >
        {{ name }}
      </li>
    </ul>
    <UserInfo class="hidden lg:block mr-[-18px]">
      <UserIcon color="#1D2939" class="hover:text-[#0B95D0] transition-colors" />
    </UserInfo>
  </nav>
</template>

<script setup lang="ts">
import UserInfo from '@/components/common/UserInfo.vue';
import UserIcon from '@/assets/icons/user.svg';

type Tabs = {
  name: string;
  tab: number;
}[];

const props = defineProps<{
  tabs: Tabs;
  currentTab: number;
}>();
const emit = defineEmits(['update']);
</script>

<style scoped>
.nav-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: transparent;
  transition: background-color 0.3s;
}

.nav-item.active::before,
.nav-item:hover::before {
  background-color: #0b95d0;
}
</style>
