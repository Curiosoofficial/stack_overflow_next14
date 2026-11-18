import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maskiert Sonderzeichen, damit Benutzereingaben sicher in einer RegExp landen.
 * Ohne das stürzt z.B. die Suche nach "c++" ab ("Nothing to repeat"),
 * und lange Muster könnten die Datenbank lahmlegen (ReDoS).
 */
export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const getTimeStamp = (createdAt: Date): string => {
  const currentDate: Date = new Date();
  const createdDate: Date = createdAt;
  const timeDifference: number = Math.floor(
    (currentDate.getTime() - createdDate.getTime()) / 1000
  );

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
  const minutesDifference: number = Math.floor(
    timeDifference / secondsInMinute
  );

  // Format the timestamp based on the time difference
  if (yearsDifference > 0) {
    return `${yearsDifference} year${yearsDifference > 1 ? "s" : ""} ago`;
  } else if (monthsDifference > 0) {
    return `${monthsDifference} month${monthsDifference > 1 ? "s" : ""} ago`;
  } else if (daysDifference > 0) {
    return `${daysDifference} day${daysDifference > 1 ? "s" : ""} ago`;
  } else if (hoursDifference > 0) {
    return `${hoursDifference} hour${hoursDifference > 1 ? "s" : ""} ago`;
  } else if (minutesDifference > 0) {
    return `${minutesDifference} minute${minutesDifference > 1 ? "s" : ""} ago`;
  } else {
    return `Less than a minute ago`;
  }
};

export const formatBigNumber = (number: number): string => {
  if (number >= 1000000) {
    const result = (number / 1000000).toFixed(2);
    return result + "M";
  } else if (number >= 1000) {
    const result = (number / 1000).toFixed(2);
    return result + "K";
  } else {
    return number.toString();
  }
};

export const getJoinedDate = (date: Date): string => {
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  const joinedDate = `Joined ${month} ${year}`;

  return joinedDate;
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return `${window.location.pathname}?${qs.stringify(currentUrl, { skipNull: true })}`;
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({ params, keysToRemove }: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return `${window.location.pathname}?${qs.stringify(currentUrl, { skipNull: true })}`;
};

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[]
}

export const assignBagdes = (params: BadgeParam) => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  }

  const { criteria } = params;

  criteria.forEach((item) =>  {
      const { type, count } = item;
      const badgeLevels: any = BADGE_CRITERIA[type];

      Object.keys(badgeLevels).forEach((level: any) => {
        if (count >= badgeLevels[level]) {
          badgeCounts[level as keyof BadgeCounts] += 1;
        }
      })
  })

  return badgeCounts;
}
