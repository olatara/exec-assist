import { format, parseISO } from 'date-fns';

/**
 * Formats a date into different string representations.
 * 
 * @param {string | Date} date - The date to format, can be either a Date object or an ISO string.
 * @param {string} formatString - The desired format for the date. Uses date-fns format string options.
 * 
 * Supported Format Examples:
 * - "P" - Formats the date in locale-sensitive short format (e.g., 09/15/2024).
 * - "p" - Formats the time in locale-sensitive short format (e.g., 1:30 PM).
 * - "Pp" - Combines both date and time (e.g., 09/15/2024 1:30 PM).
 * - "Pp zzzz" - Formats date and time with timezone (e.g., 09/15/2024 1:30 PM GMT+2).
 * - "yyyy-MM-dd" - ISO 8601 date format (e.g., 2024-09-15).
 * - "HH:mm:ss" - Time format with hours, minutes, and seconds (e.g., 13:30:00).
 * - "EEEE, MMMM do yyyy" - Full date format with day, month, and year (e.g., Sunday, September 15th 2024).
 * 
 * @returns {string} - The formatted date string.
 * 
 * @example
 * // Format to full date with time and timezone
 * formatDate(new Date(), "Pp zzzz");
 * // Output: "09/15/2024 1:30 PM GMT+2"
 * 
 * @example
 * // Format to ISO date
 * formatDate(new Date(), "yyyy-MM-dd");
 * // Output: "2024-09-15"
 * 
 * @example
 * // Format to custom full date
 * formatDate(new Date(), "EEEE, MMMM do yyyy");
 * // Output: "Sunday, September 15th 2024"
 */
export const formatDate = (date: string | Date, formatString: string): string => {
  // If the date is a string, parse it into a Date object, otherwise use it as-is
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};
