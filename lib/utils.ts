import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(amount);
}

export function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " жил";
  }
  interval = seconds / 2592000; // 1 month
  if (interval > 1) {
    return Math.floor(interval) + " сар";
  }
  interval = seconds / 86400; // 1 day
  if (interval > 1) {
    return Math.floor(interval) + " хоног";
  }
  interval = seconds / 3600; // 1 hour
  if (interval > 1) {
    return Math.floor(interval) + " цаг";
  }
  interval = seconds / 60; // 1 minute
  if (interval > 1) {
    return Math.floor(interval) + " минут";
  }
  return Math.floor(seconds) + " секунд";
}
