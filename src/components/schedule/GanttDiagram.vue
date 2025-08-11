<template>
  <div class="overflow-hidden relative grow w-0">
    <!-- header:date -->
    <div
      ref="ganttHeader"
      class="h-full overflow-x-scroll overflow-y-hidden"
      style="scrollbar-width: none"
      @scroll="scrollBody"
    >
      <!-- month -->
      <div class="w-max -translate-x-[1px]">
        <div
          v-for="(month, index) in dateList"
          :key="index"
          class="inline-block px-2 h-12 leading-[48px] border-l border-b border-light bg-white whitespace-nowrap sticky -left-1"
          :style="{
            width: `${33 * month.dates.length}px`
          }"
        >
          {{ month.period }}
        </div>
      </div>
      <!-- date -->
      <div class="flex" style="height: calc(100% - 48px)">
        <div
          v-for="(month, index) in dateList"
          :key="index"
          class="flex"
          :style="{
            width: `${33 * month.dates.length}px !important`
          }"
        >
          <template v-for="(date, index) in month.dates" :key="index">
            <div
              class="w-[33px] border-r border-light flex flex-col justify-start items-center box-content"
              :class="{
                'bg-slate-100': !workDays[date.getDay() % 7].is_work_day,
                '!bg-primary-1': date.getTime() == localToUTC(new Date()).getTime()
              }"
            >
              <div>
                {{ date.getDate() }}
              </div>
              <div>
                {{ toMandarinDay(date.getDay()) }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- body:gantt -->
    <div
      id="GanttScrollPanel"
      ref="GanttScrollPanel"
      class="absolute top-24 left-0 w-full overflow-auto"
      @scroll="handleScroll"
      @mousemove="autoScroll"
      style="height: calc(100% - 96px)"
    >
      <div
        id="GanttContent"
        class="relative min-h-full overflow-hidden"
        :style="{
          width: `${totalDays * 33 - scrollbarWidth}px`,
          height: ganttContentHeight + 'px'
        }"
      >
        <GanttGroup
          :data="store.project"
          rowIndex="0"
          :startDate="dateListStartDate"
          :totalDays
          :workDays
          :parentIsMoving="false"
          :parentMovingDistance="0"
          :isShow="true"
        ></GanttGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue';
import { useScheduleStore } from '@/stores/schedule';
import GanttGroup from '@/components/schedule/GanttGroup.vue';
import { localToUTC } from '@/utils';

// init
const store = useScheduleStore();
const props = defineProps(['workDays', 'dateTime']);
const emit = defineEmits(['scroll']);

// 創建一個ResizeObserver實例更新 scroll panel info
const resizeObserver = new ResizeObserver(() => {
  const target = GanttScrollPanel.value as HTMLElement;
  store.scrollPanelLeft = target.scrollLeft;
  store.scrollPanelWidth = target.clientWidth;
});

onMounted(() => {
  // 監聽resize
  const element = GanttScrollPanel.value as HTMLElement;
  resizeObserver.observe(element);

  // 初次設定日期
  setDateList();
});

// 初次資料載入後
const lock = ref<boolean>(false);
watch(
  () => store.project.id,
  () => {
    if (lock.value) return;
    nextTick(() => {
      scrollToView();
    });
    lock.value = true;
  }
);

onBeforeUnmount(() => {
  // 移除監聽resize
  const element = GanttScrollPanel.value as HTMLElement;
  resizeObserver.unobserve(element);
});

// set date
const dateList = reactive<{ period: string; dates: Date[] }[]>([]);

const setDateList = () => {
  dateList.length = 0;
  const date = new Date(props.dateTime.start_date);
  const endDate = new Date(props.dateTime.end_date);
  // 起始日往前一個月
  date.setMonth(date.getMonth() - 1);
  endDate.setMonth(endDate.getMonth() + 1);
  const duration = (endDate.getTime() - date.getTime()) / 86400000;
  store.dateRange.start_date = new Date(date);
  store.dateRange.end_date = endDate;
  for (let i = 0; i <= duration + 0; i++) {
    const monthIndex = date.getMonth();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const currentPeriod = monthNames[monthIndex] + ', ' + date.getFullYear();
    const target = dateList.find((el) => el.period == currentPeriod);

    if (target) {
      target.dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    } else {
      dateList.push({
        period: currentPeriod,
        dates: [new Date(date)]
      });
      date.setDate(date.getDate() + 1);
    }
  }
};

const dateListStartDate = computed(() => {
  if (dateList[0]?.dates[0]) {
    return new Date(dateList[0].dates[0]);
  }
  return new Date();
});

const totalDays = computed(() => {
  return dateList.reduce((acc, month) => month.dates.length + acc, 0);
});

const scrollToView = () => {
  let scrollLeft: number = 0;
  const leftThreshold = new Date(props.dateTime.start_date);
  leftThreshold.setDate(leftThreshold.getDate() - 30);
  const rightThreshold = new Date(props.dateTime.end_date);
  rightThreshold.setDate(rightThreshold.getDate() + 30);
  const today = localToUTC(new Date());

  const ganttScrollPanel = document.getElementById('GanttScrollPanel');
  if (!ganttScrollPanel) return;
  // 定位至任務結束日期
  if (store.project.end_date) {
    scrollLeft =
      ((store.project.end_date.getTime() - leftThreshold.getTime()) / 86400000) * 33 -
      (ganttScrollPanel.clientWidth * 3) / 4;
  }
  // 定位今天
  else if (
    leftThreshold.getTime() < today.getTime() &&
    today.getTime() < rightThreshold.getTime()
  ) {
    scrollLeft =
      ((today.getTime() - leftThreshold.getTime()) / 86400000) * 33 -
      (ganttScrollPanel.clientWidth * 2) / 3;
  }

  ganttScrollPanel.scrollLeft = Math.max(scrollLeft, 0);
};

const toMandarinDay = (day: number) => {
  switch (day) {
    case 0:
      return '日';
    case 1:
      return '一';
    case 2:
      return '二';
    case 3:
      return '三';
    case 4:
      return '四';
    case 5:
      return '五';
    case 6:
      return '六';
    default:
      return '';
  }
};

// scroll view
const getScrollbarWidth = (): number => {
  // Create a temporary element
  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'w-[100px] h-[100px] overflow-scroll absolute -top-[9999px]';

  // Append the element to the body
  document.body.appendChild(scrollDiv);

  // Measure the scrollbar width
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

  // Remove the temporary element
  document.body.removeChild(scrollDiv);

  return scrollbarWidth;
};
const scrollbarWidth = ref<number>(0);
scrollbarWidth.value = getScrollbarWidth();

const ganttHeader = ref<HTMLElement>();
const GanttScrollPanel = ref<HTMLElement>();
const scrollHeaderAndListBody = (event: Event) => {
  const target = event.target as HTMLElement;
  const header = ganttHeader.value as HTMLElement;
  header.scrollLeft = target.scrollLeft;
  emit('scroll', target.scrollTop);
};

const handleScroll = (event: Event) => {
  scrollHeaderAndListBody(event);

  const target = event.target as HTMLElement;
  store.scrollPanelLeft = target.scrollLeft;
  store.scrollPanelWidth = target.clientWidth;
  store.scrollPanelTop = target.scrollTop;
  store.scrollPanelHeight = target.clientHeight;
};

const scrollBody = (event: Event) => {
  const target = event.target as HTMLElement;
  const body = GanttScrollPanel.value as HTMLElement;
  body.scrollLeft = target.scrollLeft;
};

const isScrolling = ref<boolean>(false);
const autoScroll = (event: MouseEvent) => {
  if (store.isSettingGanttBlock) {
    const scrollPanel = GanttScrollPanel.value as HTMLElement;
    const rect = scrollPanel.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // 滑鼠在scrollpanel內的x坐標
    const panelWidth = scrollPanel.offsetWidth;
    const thresholdPercentage = 0.15;
    const thresholdLeft = panelWidth * thresholdPercentage; // 左側門檻值
    const thresholdRight = panelWidth * (1 - thresholdPercentage); // 右側門檻值
    const maxSpeed = 20;

    // 左移
    if (mouseX < thresholdLeft) {
      const speed = ((thresholdLeft - mouseX) / (panelWidth * thresholdPercentage)) * maxSpeed;
      isScrolling.value = true;
      scrollView(-speed);
    }
    // 右移
    else if (mouseX > thresholdRight) {
      const speed = ((mouseX - thresholdRight) / (panelWidth * thresholdPercentage)) * maxSpeed;
      isScrolling.value = true;
      scrollView(speed);
    } else {
      isScrolling.value = false;
      clearInterval(scrollInterval.value);
    }
  }
};

const scrollInterval = ref<any>(null);
const scrollView = (speed: number) => {
  if (!isScrolling.value) return;
  const scrollPanel = GanttScrollPanel.value as HTMLElement;

  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = setInterval(() => {
      scrollPanel.scrollLeft += speed;
    }, 16);
  } else {
    scrollInterval.value = setInterval(() => {
      scrollPanel.scrollLeft += speed;
    }, 16);
  }
};

watch(
  () => [store.isAddingDependencyOrSubsequence, store.isSettingGanttBlock],
  () => {
    if (!store.isAddingDependencyOrSubsequence && !store.isSettingGanttBlock) {
      isScrolling.value = false;
      clearInterval(scrollInterval.value);
    }
  }
);

watch(
  () => props.dateTime,
  () => {
    setDateList();
  },
  { deep: true }
);

const ganttContentHeight = computed<number>(() => {
  const lastSection = store.project.sections[store.project.sections.length - 1];
  if (!lastSection) return 0;
  return (lastSection.height + lastSection.occupiedRow) * 48 + (64 - scrollbarWidth.value);
});
</script>

<style scoped></style>
