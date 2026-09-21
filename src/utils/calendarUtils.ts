import { useState, useEffect } from "react";
import { CalendarType } from "../types/erp";

export const HIJRI_MONTH_NAMES_AR = [
  "محرّم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوّال",
  "ذو القعدة",
  "ذو الحجة",
];

export const GREGORIAN_MONTH_NAMES_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const ARABIC_WEEKDAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const STORAGE_KEY = "medo_erp_calendar_type";
const EVENT_NAME = "medo_calendar_type_changed";

/**
 * Gets the current active calendar preference (GREGORIAN, HIJRI, or DUAL)
 */
export function getActiveCalendarType(): CalendarType {
  if (typeof window === "undefined") return "GREGORIAN";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "HIJRI" || saved === "GREGORIAN" || saved === "DUAL") {
      return saved;
    }
  } catch (e) {
    console.error("Failed to read calendar type from localStorage", e);
  }
  return "GREGORIAN";
}

/**
 * Sets the active calendar preference and dispatches a notification event to all listening components
 */
export function setActiveCalendarType(type: CalendarType): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, type);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type } }));
  } catch (e) {
    console.error("Failed to save calendar type to localStorage", e);
  }
}

/**
 * Subscribes to calendar type change events
 */
export function subscribeToCalendarChanges(callback: (type: CalendarType) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ type: CalendarType }>;
    if (customEvent.detail && customEvent.detail.type) {
      callback(customEvent.detail.type);
    } else {
      callback(getActiveCalendarType());
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(getActiveCalendarType());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

/**
 * Parses any date input safely into a valid JavaScript Date object
 */
export function parseSafeDate(dateInput: string | number | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // Handle "YYYY-MM-DD" or ISO strings
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

export interface DateParts {
  year: number;
  month: number; // 1-12
  monthName: string;
  day: number;
  weekdayName: string;
  formatted: string;
}

/**
 * Converts a Gregorian Date into exact Hijri date parts (using Intl Umm al-Qura calendar standard)
 */
export function getHijriDateParts(dateInput: string | number | Date | null | undefined): DateParts | null {
  const d = parseSafeDate(dateInput);
  if (!d) return null;

  try {
    // Attempt standard Intl DateTimeFormat with Umm al-Qura calendar
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(d);
    let day = d.getDate();
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === "day") day = parseInt(part.value, 10);
      if (part.type === "month") month = parseInt(part.value, 10);
      if (part.type === "year") year = parseInt(part.value, 10);
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = HIJRI_MONTH_NAMES_AR[monthIndex] || `شهر ${month}`;
    const weekdayName = ARABIC_WEEKDAYS[d.getDay()] || "";

    return {
      year,
      month,
      monthName,
      day,
      weekdayName,
      formatted: `${day} ${monthName} ${year} هـ`,
    };
  } catch (err) {
    // Fallback approximation if Umm al-Qura is not supported in the environment
    const jd = Math.floor(d.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = HIJRI_MONTH_NAMES_AR[monthIndex] || `شهر ${month}`;
    const weekdayName = ARABIC_WEEKDAYS[d.getDay()] || "";

    return {
      year,
      month,
      monthName,
      day,
      weekdayName,
      formatted: `${day} ${monthName} ${year} هـ`,
    };
  }
}

/**
 * Formats a date into a Hijri date string
 */
export function formatHijriDate(
  dateInput: string | number | Date | null | undefined,
  style: "short" | "medium" | "full" | "numeric" = "medium"
): string {
  const parts = getHijriDateParts(dateInput);
  if (!parts) return typeof dateInput === "string" ? dateInput : "";

  const pad = (n: number) => n.toString().padStart(2, "0");

  switch (style) {
    case "numeric":
      return `${parts.year}/${pad(parts.month)}/${pad(parts.day)} هـ`;
    case "short":
      return `${parts.day} ${parts.monthName} ${parts.year}هـ`;
    case "full":
      return `${parts.weekdayName}، ${parts.day} ${parts.monthName} ${parts.year} هـ`;
    case "medium":
    default:
      return `${parts.day} ${parts.monthName} ${parts.year} هـ`;
  }
}

/**
 * Formats a date into a Gregorian date string in Arabic
 */
export function formatGregorianDate(
  dateInput: string | number | Date | null | undefined,
  style: "short" | "medium" | "full" | "numeric" = "medium"
): string {
  const d = parseSafeDate(dateInput);
  if (!d) return typeof dateInput === "string" ? dateInput : "";

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const monthName = GREGORIAN_MONTH_NAMES_AR[d.getMonth()] || `شهر ${month}`;
  const weekdayName = ARABIC_WEEKDAYS[d.getDay()] || "";

  const pad = (n: number) => n.toString().padStart(2, "0");

  switch (style) {
    case "numeric":
      return `${year}/${pad(month)}/${pad(day)} م`;
    case "short":
      return `${year}-${pad(month)}-${pad(day)}`;
    case "full":
      return `${weekdayName}، ${day} ${monthName} ${year} م`;
    case "medium":
    default:
      return `${day} ${monthName} ${year}`;
  }
}

/**
 * Formats a date showing both Gregorian and Hijri dates together
 */
export function formatDualDate(
  dateInput: string | number | Date | null | undefined,
  style: "compact" | "detailed" = "compact"
): string {
  const d = parseSafeDate(dateInput);
  if (!d) return typeof dateInput === "string" ? dateInput : "";

  const gregShort = formatGregorianDate(d, "medium");
  const hijriShort = formatHijriDate(d, "short");

  if (style === "detailed") {
    return `${gregShort} م (الموافق: ${hijriShort})`;
  }
  return `${gregShort} م / ${hijriShort}`;
}

export interface FormatOptions {
  style?: "short" | "medium" | "full" | "numeric";
  showTime?: boolean;
  type?: CalendarType; // If omitted, uses active user/system setting
}

/**
 * Universal date formatter respecting the current or specified calendar type
 */
export function formatCalendarDate(
  dateInput: string | number | Date | null | undefined,
  options?: FormatOptions | CalendarType
): string {
  const d = parseSafeDate(dateInput);
  if (!d) return typeof dateInput === "string" ? dateInput : "";

  let calendarType: CalendarType = getActiveCalendarType();
  let style: "short" | "medium" | "full" | "numeric" = "medium";
  let showTime = false;

  if (typeof options === "string") {
    calendarType = options;
  } else if (options) {
    if (options.type) calendarType = options.type;
    if (options.style) style = options.style;
    if (options.showTime) showTime = options.showTime;
  }

  let baseDateFormatted = "";

  if (calendarType === "HIJRI") {
    baseDateFormatted = formatHijriDate(d, style);
  } else if (calendarType === "DUAL") {
    baseDateFormatted = formatDualDate(d, style === "full" ? "detailed" : "compact");
  } else {
    baseDateFormatted = formatGregorianDate(d, style);
  }

  if (showTime) {
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "م" : "ص";
    const hour12 = hours % 12 || 12;
    return `${baseDateFormatted} - ${hour12}:${minutes} ${ampm}`;
  }

  return baseDateFormatted;
}

/**
 * React Hook providing active calendar type, toggling, and formatting functions with automatic re-renders on change
 */
export function useCalendar() {
  const [calendarType, setCalendarTypeState] = useState<CalendarType>(() => getActiveCalendarType());

  useEffect(() => {
    const unsubscribe = subscribeToCalendarChanges((newType) => {
      setCalendarTypeState(newType);
    });
    return unsubscribe;
  }, []);

  const setCalendarType = (type: CalendarType) => {
    setActiveCalendarType(type);
    setCalendarTypeState(type);
  };

  const toggleCalendar = () => {
    const nextType: CalendarType =
      calendarType === "GREGORIAN" ? "HIJRI" : calendarType === "HIJRI" ? "DUAL" : "GREGORIAN";
    setCalendarType(nextType);
  };

  const today = new Date();

  return {
    calendarType,
    setCalendarType,
    toggleCalendar,
    formatDate: (date: string | number | Date | null | undefined, style?: "short" | "medium" | "full" | "numeric") =>
      formatCalendarDate(date, { type: calendarType, style }),
    formatWithTime: (date: string | number | Date | null | undefined) =>
      formatCalendarDate(date, { type: calendarType, showTime: true }),
    formatHijri: (date: string | number | Date | null | undefined, style?: "short" | "medium" | "full" | "numeric") =>
      formatHijriDate(date, style),
    formatGregorian: (date: string | number | Date | null | undefined, style?: "short" | "medium" | "full" | "numeric") =>
      formatGregorianDate(date, style),
    formatDual: (date: string | number | Date | null | undefined) => formatDualDate(date),
    todayFormatted: formatCalendarDate(today, { type: calendarType, style: "full" }),
    todayGregorian: formatGregorianDate(today, "full"),
    todayHijri: formatHijriDate(today, "full"),
  };
}
