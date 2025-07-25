import { RetrievalAttempt, FilterState } from '../types';
import { getDaysInResearch } from './status';

export const filterAttempts = (
  attempts: RetrievalAttempt[],
  filters: FilterState
): RetrievalAttempt[] => {
  return attempts.filter(attempt => {
    // Search filter - by ID (contains) or bulk search (space/comma separated)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      
      // Check if it's a bulk search (contains space or comma)
      if (searchTerm.includes(' ') || searchTerm.includes(',')) {
        const searchIds = searchTerm
          .split(/[,\s]+/)
          .map(id => id.trim())
          .filter(id => id.length > 0);
        
        // Check if attempt ID matches any of the search IDs
        const matchesAnyId = searchIds.some(searchId => 
          attempt.id.toLowerCase().includes(searchId)
        );
        
        if (!matchesAnyId) {
          return false;
        }
      } else {
        // Single ID search
        if (!attempt.id.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
    }

    // Multi-select filters
    if (filters.retrievalMethod.length > 0 && !filters.retrievalMethod.includes(attempt.retrievalMethod)) {
      return false;
    }

    if (filters.clientName.length > 0 && !filters.clientName.includes(attempt.clientName)) {
      return false;
    }

    if (filters.demandId.length > 0 && !filters.demandId.includes(attempt.demandId)) {
      return false;
    }

    if (filters.providerGroup.length > 0 && !filters.providerGroup.includes(attempt.providerGroup)) {
      return false;
    }

    if (filters.providerName.length > 0 && !filters.providerName.includes(attempt.providerName)) {
      return false;
    }

    if (filters.researchAgent.length > 0 && attempt.researchAgent && !filters.researchAgent.includes(attempt.researchAgent)) {
      return false;
    }

    // Days in research filter
    if (filters.daysInResearch && filters.daysInResearch !== 'all') {
      const daysInResearch = getDaysInResearch(attempt.lastActionAt);
      
      switch (filters.daysInResearch) {
        case '0-3':
          if (daysInResearch > 3) return false;
          break;
        case '4-7':
          if (daysInResearch < 4 || daysInResearch > 7) return false;
          break;
        case '8-14':
          if (daysInResearch < 8 || daysInResearch > 14) return false;
          break;
        case '15-30':
          if (daysInResearch < 15 || daysInResearch > 30) return false;
          break;
        case '30+':
          if (daysInResearch < 30) return false;
          break;
        default:
          break;
      }
    }

    return true;
  });
};

export const getFilteredCount = (
  totalCount: number,
  filteredCount: number
): string => {
  if (totalCount === filteredCount) {
    return `${totalCount} attempts`;
  }
  return `${filteredCount} of ${totalCount} attempts`;
};