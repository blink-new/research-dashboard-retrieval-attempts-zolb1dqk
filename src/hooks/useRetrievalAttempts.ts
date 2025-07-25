import { useState, useCallback, useMemo } from 'react';
import { RetrievalAttempt, FilterState, SortState, EditFormData, BulkEditData, AuditEntry } from '../types';
import { mockRetrievalAttempts } from '../fixtures/mockRetrievalAttempts';
import { filterAttempts } from '../utils/filtering';
import { sortAttempts } from '../utils/sorting';
import { getStatusFromOutcome, getOutcomeAuditMessage } from '../utils/status';
import { useToast } from './use-toast';

// Mock API functions with latency simulation
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

const mockApiError = () => Math.random() < 0.1; // 10% chance of error

export const useRetrievalAttempts = () => {
  const [attempts, setAttempts] = useState<RetrievalAttempt[]>(
    mockRetrievalAttempts.filter(attempt => attempt.status === 'research')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    retrievalMethod: [],
    clientName: [],
    demandId: [],
    providerGroup: [],
    providerName: [],
    researchAgent: [],
    search: '',
    daysInResearch: 'all'
  });

  const [sortState, setSortState] = useState<SortState>({
    field: 'lastActionAt',
    direction: 'desc'
  });

  // Apply filters and sorting
  const filteredAndSortedAttempts = useMemo(() => {
    const filtered = filterAttempts(attempts, filters);
    return sortAttempts(filtered, sortState);
  }, [attempts, filters, sortState]);

  // Update single attempt
  const updateAttempt = useCallback(async (id: string, data: EditFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await mockApiDelay();
      
      if (mockApiError()) {
        throw new Error('Failed to update attempt. Please try again.');
      }

      const currentAttempt = attempts.find(a => a.id === id);
      if (!currentAttempt) {
        throw new Error('Attempt not found');
      }

      // Create audit entries for changed fields
      const auditEntries: AuditEntry[] = [];
      const timestamp = new Date().toISOString();
      const user = 'current_user'; // In real app, get from auth context

      if (data.phone !== (currentAttempt.phone || '')) {
        auditEntries.push({
          id: `audit_${Date.now()}_phone`,
          attemptId: id,
          field: 'phone',
          from: currentAttempt.phone || null,
          to: data.phone || null,
          user,
          timestamp
        });
      }

      if (data.fax !== (currentAttempt.fax || '')) {
        auditEntries.push({
          id: `audit_${Date.now()}_fax`,
          attemptId: id,
          field: 'fax',
          from: currentAttempt.fax || null,
          to: data.fax || null,
          user,
          timestamp
        });
      }

      if (data.email !== (currentAttempt.email || '')) {
        auditEntries.push({
          id: `audit_${Date.now()}_email`,
          attemptId: id,
          field: 'email',
          from: currentAttempt.email || null,
          to: data.email || null,
          user,
          timestamp
        });
      }

      if (data.chaseAddress !== currentAttempt.chaseAddress) {
        auditEntries.push({
          id: `audit_${Date.now()}_address`,
          attemptId: id,
          field: 'chaseAddress',
          from: currentAttempt.chaseAddress,
          to: data.chaseAddress,
          user,
          timestamp
        });
      }

      if (data.contactName !== (currentAttempt.contactName || '')) {
        auditEntries.push({
          id: `audit_${Date.now()}_contact`,
          attemptId: id,
          field: 'contactName',
          from: currentAttempt.contactName || null,
          to: data.contactName || null,
          user,
          timestamp
        });
      }

      // Handle outcome changes
      const newStatus = getStatusFromOutcome(data.outcome);
      if (data.outcome && newStatus !== currentAttempt.status) {
        auditEntries.push({
          id: `audit_${Date.now()}_outcome`,
          attemptId: id,
          field: 'status',
          from: currentAttempt.status,
          to: newStatus,
          user,
          reason: getOutcomeAuditMessage(data.outcome, data.reason),
          timestamp
        });
      }

      // Optimistic update
      setAttempts(prev => prev.map(attempt => 
        attempt.id === id 
          ? {
              ...attempt,
              phone: data.phone || undefined,
              fax: data.fax || undefined,
              email: data.email || undefined,
              chaseAddress: data.chaseAddress,
              contactName: data.contactName || undefined,
              status: newStatus,
              lastActionAt: timestamp,
              version: attempt.version + 1,
              audit: [...(attempt.audit || []), ...auditEntries]
            }
          : attempt
      ));

      toast({
        title: "Success",
        description: "Attempt updated successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [attempts, toast]);

  // Bulk update attempts
  const bulkUpdateAttempts = useCallback(async (ids: string[], data: BulkEditData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await mockApiDelay();
      
      if (mockApiError()) {
        throw new Error('Failed to bulk update attempts. Please try again.');
      }

      const timestamp = new Date().toISOString();
      const user = 'current_user';

      // Optimistic update
      setAttempts(prev => prev.map(attempt => {
        if (!ids.includes(attempt.id)) return attempt;

        const auditEntries: AuditEntry[] = [];
        const updatedAttempt = { ...attempt };

        // Only update non-empty fields
        if (data.phone.trim()) {
          if (data.phone !== (attempt.phone || '')) {
            auditEntries.push({
              id: `audit_${Date.now()}_${attempt.id}_phone`,
              attemptId: attempt.id,
              field: 'phone',
              from: attempt.phone || null,
              to: data.phone,
              user,
              reason: data.reason,
              timestamp
            });
          }
          updatedAttempt.phone = data.phone;
        }

        if (data.fax.trim()) {
          if (data.fax !== (attempt.fax || '')) {
            auditEntries.push({
              id: `audit_${Date.now()}_${attempt.id}_fax`,
              attemptId: attempt.id,
              field: 'fax',
              from: attempt.fax || null,
              to: data.fax,
              user,
              reason: data.reason,
              timestamp
            });
          }
          updatedAttempt.fax = data.fax;
        }

        if (data.email.trim()) {
          if (data.email !== (attempt.email || '')) {
            auditEntries.push({
              id: `audit_${Date.now()}_${attempt.id}_email`,
              attemptId: attempt.id,
              field: 'email',
              from: attempt.email || null,
              to: data.email,
              user,
              reason: data.reason,
              timestamp
            });
          }
          updatedAttempt.email = data.email;
        }

        if (data.chaseAddress.trim()) {
          if (data.chaseAddress !== attempt.chaseAddress) {
            auditEntries.push({
              id: `audit_${Date.now()}_${attempt.id}_address`,
              attemptId: attempt.id,
              field: 'chaseAddress',
              from: attempt.chaseAddress,
              to: data.chaseAddress,
              user,
              reason: data.reason,
              timestamp
            });
          }
          updatedAttempt.chaseAddress = data.chaseAddress;
        }

        if (data.contactName.trim()) {
          if (data.contactName !== (attempt.contactName || '')) {
            auditEntries.push({
              id: `audit_${Date.now()}_${attempt.id}_contact`,
              attemptId: attempt.id,
              field: 'contactName',
              from: attempt.contactName || null,
              to: data.contactName,
              user,
              reason: data.reason,
              timestamp
            });
          }
          updatedAttempt.contactName = data.contactName;
        }

        // Handle outcome
        const newStatus = getStatusFromOutcome(data.outcome);
        if (data.outcome && newStatus !== attempt.status) {
          auditEntries.push({
            id: `audit_${Date.now()}_${attempt.id}_outcome`,
            attemptId: attempt.id,
            field: 'status',
            from: attempt.status,
            to: newStatus,
            user,
            reason: getOutcomeAuditMessage(data.outcome, data.reason),
            timestamp
          });
          updatedAttempt.status = newStatus;
        }

        return {
          ...updatedAttempt,
          lastActionAt: timestamp,
          version: attempt.version + 1,
          audit: [...(attempt.audit || []), ...auditEntries]
        };
      }));

      toast({
        title: "Success",
        description: `${ids.length} attempts updated successfully`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    attempts: filteredAndSortedAttempts,
    totalCount: attempts.length,
    filteredCount: filteredAndSortedAttempts.length,
    loading,
    error,
    filters,
    setFilters,
    sortState,
    setSortState,
    updateAttempt,
    bulkUpdateAttempts,
    clearError: () => setError(null)
  };
};