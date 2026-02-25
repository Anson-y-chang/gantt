// 計算有多少工作日
export const countWorkDays = (
  startDate: Date,
  endDate: Date,
  workDays: Array<{ is_work_day: boolean; name: string }>
): number => {
  const start_date = new Date(startDate);
  const end_date = new Date(endDate);

  const workDayRatio =
    workDays.reduce((acc, cur) => {
      if (cur.is_work_day) {
        acc++;
      }
      return acc;
    }, 0) / 7;
  const dateDiscrepancy = (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const remainder = dateDiscrepancy % 7;
  let totalDays = (dateDiscrepancy - remainder) * workDayRatio;

  for (let i = 0; i < remainder; i++) {
    if (workDays[(start_date.getDay() + i) % 7].is_work_day) {
      totalDays++;
    }
  }

  return totalDays;
};

// 天數轉日期，暫時沒人用，如果確定不用可刪除
export const countToDate = (
  count: number,
  startDate: Date,
  workDays: Array<{ is_work_day: boolean; name: string }>
): Date => {
  const distanceCount = count;
  const divisor = workDays.reduce((acc, { is_work_day }) => (is_work_day ? acc + 1 : acc), 0);
  const dividend = 7;
  const remainder = count % divisor;

  let remainderDays = 0;
  let workdays = 0;
  for (let i = 0; i < 7 && workdays < remainder; i++) {
    if (workDays[(startDate.getDay() + 1 + i) % 7].is_work_day) {
      workdays++;
    }
    remainderDays++;
  }
  const totalDays = ((distanceCount - remainder) / divisor) * dividend + remainderDays;

  const date = new Date(startDate);
  date.setDate(date.getDate() + totalDays);

  return date;
};

export const isAccessible = (authRequirement: number, userAuthLevel: number) => {
  return authRequirement >= userAuthLevel;
};
