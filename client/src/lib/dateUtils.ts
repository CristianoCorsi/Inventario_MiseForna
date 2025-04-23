import { Loan } from "@shared/schema";
import { isBefore, isAfter, format, formatDistance, formatRelative } from "date-fns";

/**
 * Checks if a loan is overdue
 * @param loan The loan to check
 * @returns True if the loan is overdue
 */
export function isOverdue(loan: Loan): boolean {
  // If the loan is already returned, it's not overdue
  if (loan.status === "returned") {
    return false;
  }
  
  // If the loan has an "overdue" status, return true
  if (loan.status === "overdue") {
    return true;
  }
  
  // Check if the due date is before the current date
  const dueDate = new Date(loan.dueDate);
  const now = new Date();
  
  return isBefore(dueDate, now);
}

/**
 * Calculates the number of days overdue for a loan
 * @param loan The loan to check
 * @returns Number of days overdue, or 0 if not overdue
 */
export function getDaysOverdue(loan: Loan): number {
  if (!isOverdue(loan)) {
    return 0;
  }
  
  const dueDate = new Date(loan.dueDate);
  const now = new Date();
  
  // Calculate the difference in days
  const differenceInTime = now.getTime() - dueDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays;
}

/**
 * Formats a due date with appropriate styling based on status
 * @param dueDate The due date to format
 * @param status The loan status
 * @returns Formatted due date information
 */
export function formatDueDate(dueDate: Date | string, status: string): { 
  formatted: string;
  relative: string;
  isOverdue: boolean;
} {
  const date = new Date(dueDate);
  const now = new Date();
  const isOverdueStatus = status === "overdue" || (status === "active" && isBefore(date, now));
  
  return {
    formatted: format(date, "MMM d, yyyy"),
    relative: formatDistance(date, now, { addSuffix: true }),
    isOverdue: isOverdueStatus
  };
}

/**
 * Calculates the loan duration in days
 * @param loanDate Start date of the loan
 * @param returnDate Return date (or due date if not returned)
 * @returns Number of days for the loan period
 */
export function getLoanDuration(loanDate: Date | string, returnDate: Date | string | undefined, dueDate: Date | string): number {
  const start = new Date(loanDate);
  const end = returnDate ? new Date(returnDate) : new Date(dueDate);
  
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays;
}
