import { format, differenceInDays, addDays, eachDayOfInterval, isWeekend } from 'date-fns';
import parseISO from 'date-fns/parseISO';

export const formatDate = (date: string | Date, Dformat: string = 'MMM dd, yyyy'): string => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  try {
    return format(dateObj, Dformat);
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Invalid Date';
  }
};

export const calculateLeaveDays = (startDate: string, endDate: string, countWeekends: boolean = false): number => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (end < start) return 0;

    if (countWeekends) {
      return differenceInDays(end, start) + 1;
    } else {
      const interval = eachDayOfInterval({ start, end });
      return interval.filter(day => !isWeekend(day)).length;
    }
  } catch (error) {
    console.error("Error calculating leave days:", startDate, endDate, error);
    return 0;
  }
};

export const getDaysArray = (start: Date, end: Date): Date[] => {
  const arr = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// Add more date utility functions as needed