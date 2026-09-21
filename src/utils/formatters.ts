import {
  formatCalendarDate,
  formatGregorianDate,
  formatHijriDate,
  formatDualDate,
  getHijriDateParts,
  useCalendar,
  getActiveCalendarType,
  setActiveCalendarType,
  FormatOptions,
} from "./calendarUtils";
import { CalendarType } from "../types/erp";

export {
  formatCalendarDate,
  formatGregorianDate,
  formatHijriDate,
  formatDualDate,
  getHijriDateParts,
  useCalendar,
  getActiveCalendarType,
  setActiveCalendarType,
};

export function formatNumber(num: number | undefined | null, decimals: number = 2): string {
  if (num === undefined || num === null || isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(amount: number, currencyCode: string = "YER"): string {
  return `${formatNumber(amount)} ${currencyCode}`;
}

export function formatDate(
  dateString: string | number | Date | undefined | null,
  optionsOrType?: FormatOptions | CalendarType
): string {
  if (!dateString) return "";
  return formatCalendarDate(dateString, optionsOrType);
}

