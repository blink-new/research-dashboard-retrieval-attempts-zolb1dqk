import { RetrievalAttempt, SortState } from '../types';
import { getDaysInResearch } from './status';

export const sortAttempts = (
  attempts: RetrievalAttempt[],
  sortState: SortState
): RetrievalAttempt[] => {
  return [...attempts].sort((a, b) => {
    const aValue = a[sortState.field];
    const bValue = b[sortState.field];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortState.direction === 'asc' ? 1 : -1;
    if (bValue == null) return sortState.direction === 'asc' ? -1 : 1;

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortState.direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortState.direction === 'asc' ? comparison : -comparison;
    }

    // For dates (ISO strings)
    if (sortState.field === 'lastActionAt') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      const comparison = aDate - bDate;
      return sortState.direction === 'asc' ? comparison : -comparison;
    }

    // For days in research (virtual field)
    if (sortState.field === 'daysInResearch') {
      const aDays = getDaysInResearch(a.lastActionAt);
      const bDays = getDaysInResearch(b.lastActionAt);
      const comparison = aDays - bDays;
      return sortState.direction === 'asc' ? comparison : -comparison;
    }

    // Default string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return sortState.direction === 'asc' ? comparison : -comparison;
  });
};

export const toggleSortDirection = (currentDirection: 'asc' | 'desc'): 'asc' | 'desc' => {
  return currentDirection === 'asc' ? 'desc' : 'asc';
};