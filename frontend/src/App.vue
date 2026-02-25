<template>
  <div class="w-full 2xl:w-screen h-screen flex flex-col">
    <projectSchedule
      :currentUserRole="1"
      :projectId="'01jc059mb1hmz23dskf9j41fsw'"
      :workDays
      :members
      :dateTime
      :projectName="'test_project'"
      :creator="members[0]"
    ></projectSchedule>
  </div>
</template>

<script setup lang="ts">
import projectSchedule from "@/views/schedule/project-schedule.vue";
const workDays = [
  {
    is_work_day: false,
    name: "日",
  },
  {
    is_work_day: true,
    name: "一",
  },
  {
    is_work_day: true,
    name: "二",
  },
  {
    is_work_day: true,
    name: "三",
  },
  {
    is_work_day: true,
    name: "四",
  },
  {
    is_work_day: true,
    name: "五",
  },
  {
    is_work_day: false,
    name: "六",
  },
];

const members = [
  {
    department: "test dep",
    employee_id: 1123,
    is_builder: true,
    name: "testy",
    role_level: 1,
  },
];

const dateTime = {
  start_date: new Date(),
  end_date: new Date(),
};
</script>

<style>
@import url("primevue/resources/themes/aura-light-noir/theme.css");
</style>
