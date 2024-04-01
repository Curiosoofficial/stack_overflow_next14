import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getTimeStamp = (createdAt: Date): string => {
  const currentDate: Date = new Date();
  const createdDate: Date = createdAt;
  const timeDifference: number = Math.floor((currentDate.getTime() - createdDate.getTime()) / 1000);

  // Calculate time difference in seconds, minutes, hours, days, months, and years
  const secondsInMinute: number = 60;
  const secondsInHour: number = secondsInMinute * 60;
  const secondsInDay: number = secondsInHour * 24;
  const secondsInMonth: number = secondsInDay * 30;
  const secondsInYear: number = secondsInMonth * 12;

  const yearsDifference: number = Math.floor(timeDifference / secondsInYear);
  const monthsDifference: number = Math.floor(timeDifference / secondsInMonth);
  const daysDifference: number = Math.floor(timeDifference / secondsInDay);
  const hoursDifference: number = Math.floor(timeDifference / secondsInHour);
  const minutesDifference: number = Math.floor(timeDifference / secondsInMinute);

  // Format the timestamp based on the time difference
  if (yearsDifference > 0) {
    return `${yearsDifference} year${yearsDifference > 1 ? 's' : ''} ago`;
  } else if (monthsDifference > 0) {
    return `${monthsDifference} month${monthsDifference > 1 ? 's' : ''} ago`;
  } else if (daysDifference > 0) {
    return `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
  } else if (hoursDifference > 0) {
    return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
  } else if (minutesDifference > 0) {
    return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
  } else {
    return `Less than a minute ago`;
  }
};

export const formatBigNumber = (number: number): string => {
  if (number >= 1000000) {
    const result = (number / 1000000).toFixed(2);
    return result + 'M';
  } else if (number >= 1000) {
    const result = (number / 1000).toFixed(2);
    return result + 'K';
  } else {
    return number.toString();
  }
};




