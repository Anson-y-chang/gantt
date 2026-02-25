<template>
  <Dialog v-model:visible="visible" :closable="false" modal class="w-[384px] aspect-square">
    <div class="flex flex-col items-center justify-center">
      <img :src="imgUrl" alt="warn" />
      <p class="mt-8 px-6 text-lg font-bold text-primary">{{ props.config.message }}</p>
      <div class="mt-[94px] flex gap-x-16">
        <button
          type="button"
          class="btn-outline"
          @click="
            () => {
              props.config.leftButton.command();
              onClose();
            }
          "
        >
          {{ props.config.leftButton.text }}
        </button>
        <button
          type="button"
          class="btn-primary"
          autofocus
          @click="
            () => {
              props.config.rightButton.command();
              onClose();
            }
          "
        >
          {{ props.config.rightButton.text }}
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';

type ButtonConfig = {
  text: string;
  command: () => void;
};

type Config = {
  message: string;
  leftButton: ButtonConfig;
  rightButton: ButtonConfig;
};

const visible = defineModel<boolean>();
const props = defineProps<{ config: Config }>();

const imgUrl = new URL('@/assets/state/warn.svg', import.meta.url).href;

const onClose = () => {
  visible.value = false;
};
</script>
