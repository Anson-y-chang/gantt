import { RoleLevelType } from "@/types/project";

// 將阿拉伯數字轉為中文
export const toChineseNumber = (num: number): string => {
  // 如果不是整數或是負數，則返回空字串
  if (!Number.isInteger(num) || num < 0) return "";

  // 定義中文數字和單位
  const chineseNumbers = [
    "零",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
  ];
  const chineseUnits = [
    "",
    "十",
    "百",
    "千",
    "萬",
    "十",
    "百",
    "千",
    "億",
    "十",
    "百",
    "千",
    "兆",
    "十",
    "百",
    "千",
  ];

  // 如果數字為零，直接返回 '零'
  if (num === 0) return chineseNumbers[0];

  // 初始化結果字串和零標誌
  let result = "";
  let zeroFlag = false;

  // 遍歷數字的每一位
  for (let i = 0; i < num.toString().length; i++) {
    // 取得當前位數的數字和單位
    const digit = parseInt(num.toString()[i]);
    const unit = chineseUnits[num.toString().length - 1 - i];

    // 如果數字不為零
    if (digit !== 0) {
      // 如果前一位是零，則在結果字串中加上零並將 zeroFlag 設為 false
      if (zeroFlag) {
        result += chineseNumbers[0];
        zeroFlag = false;
      }
      // 如果不是「一十」，則在結果字串中加上該位數的中文表示
      if (!(digit === 1 && unit === "十")) {
        result += chineseNumbers[digit];
      }
      // 加上單位
      result += unit;
    } else {
      // 如果數字為零，設置零標誌為 true
      zeroFlag = true;
    }
  }

  // 如果結果字串以零結尾，則去掉末尾的零
  return result.endsWith(chineseNumbers[0]) ? result.slice(0, -1) : result;
};

// 將日期格式化為 yyyy/mm/dd
export const formatDate = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// 檢查是否有管理權限或編輯權限
export const checkPermission = (role: RoleLevelType): boolean => {
  if (role === RoleLevelType.Admin || role === RoleLevelType.Editor)
    return true;
  return false;
};

// 用 canvas 測量文本寬度
export const calculateTextWidth = (element: HTMLElement): number => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    const style = window.getComputedStyle(element);
    const font = `${style.fontSize} ${style.fontFamily}`;
    context.font = font;
    return context.measureText(element.textContent || "").width;
  }
  return 0;
};

export const getTimeDifference = (
  date: string,
  options = { detailed: false, future: true }
) => {
  const now = new Date();
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date");
  }

  if (!options.detailed) {
    // 重置為午夜時分，只比較日期
    now.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
  }

  const diff = targetDate.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const isPast = diff < 0;
  const isFuture = diff > 0;

  if (days === 0 && !options.detailed) {
    return "今天";
  }

  if (options.detailed) {
    if (days > 0) {
      return `${days} 天${isPast ? "前" : "後"}`;
    } else if (hours > 0) {
      return `${hours} 小時${isPast ? "前" : "後"}`;
    } else if (minutes > 0) {
      return `${minutes} 分鐘${isPast ? "前" : "後"}`;
    } else {
      return isPast ? "剛剛" : "即將";
    }
  } else {
    if (isFuture && !options.future) {
      return `${days} 天後`;
    }
    return `${days} 天${isPast ? "前" : "後"}`;
  }
};
// 將 local 00:00:000 轉 UTC 00:00:000
export const localToUTC = (date: Date): Date => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};
