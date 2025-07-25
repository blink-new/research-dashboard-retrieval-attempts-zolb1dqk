import { RetrievalAttemptStatus, Outcome } from '../types';

// Valid transitions from research status
export const VALID_TRANSITIONS: Record<RetrievalAttemptStatus, RetrievalAttemptStatus[]> = {
  research: [
    'research', // Remain in research when edits saved but not handed off
    'researched_success',
    'research_unable_to_locate',
    'ready_for_outreach',
    'reroute_to_method', // TODO: Implement specific method routing
    'cancelled_failed', // Research completed
    'blocked_external' // PNP 004 failed
  ],
  researched_success: [],
  research_unable_to_locate: [],
  ready_for_outreach: [],
  reroute_to_method: [],
  cancelled_failed: [],
  blocked_external: []
};

export const getStatusFromOutcome = (outcome: Outcome): RetrievalAttemptStatus => {
  switch (outcome) {
    case 'research_failed':
      return 'blocked_external'; // PNP 004 - blocked external
    case 'research_completed':
      return 'cancelled_failed'; // Research completed - cancelled failed
    default:
      return 'research'; // Remain in research for regular edits
  }
};

export const isValidTransition = (
  from: RetrievalAttemptStatus,
  to: RetrievalAttemptStatus
): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) || false;
};

export const getStatusDisplayName = (status: RetrievalAttemptStatus): string => {
  switch (status) {
    case 'research':
      return 'Research';
    case 'researched_success':
      return 'Researched Success';
    case 'research_unable_to_locate':
      return 'Unable to Locate';
    case 'ready_for_outreach':
      return 'Ready for Outreach';
    case 'reroute_to_method':
      return 'Reroute to Method';
    case 'cancelled_failed':
      return 'Cancelled - Failed';
    case 'blocked_external':
      return 'Blocked (External)';
    default:
      return status;
  }
};

export const getStatusVariant = (status: RetrievalAttemptStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'research':
      return 'outline';
    case 'researched_success':
      return 'default';
    case 'research_unable_to_locate':
      return 'destructive';
    case 'ready_for_outreach':
      return 'secondary';
    case 'reroute_to_method':
      return 'outline';
    case 'cancelled_failed':
      return 'destructive';
    case 'blocked_external':
      return 'destructive';
    default:
      return 'outline';
  }
};

// SLA configuration
export const SLA_DAYS = 3; // Configurable SLA threshold

export const isOverdue = (lastActionAt: string): boolean => {
  const lastAction = new Date(lastActionAt);
  const now = new Date();
  const diffInDays = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays > SLA_DAYS;
};

export const getOverdueDays = (lastActionAt: string): number => {
  const lastAction = new Date(lastActionAt);
  const now = new Date();
  const diffInDays = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diffInDays - SLA_DAYS));
};

export const getDaysInResearch = (lastActionAt: string): number => {
  const lastAction = new Date(lastActionAt);
  const now = new Date();
  const diffInDays = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diffInDays);
};

export const getRowColorClass = (daysInResearch: number): string => {
  // Color scale from green (short time) to red (long time)
  if (daysInResearch <= 1) return 'bg-green-50 hover:bg-green-100';
  if (daysInResearch <= 3) return 'bg-lime-50 hover:bg-lime-100';
  if (daysInResearch <= 7) return 'bg-yellow-50 hover:bg-yellow-100';
  if (daysInResearch <= 14) return 'bg-orange-50 hover:bg-orange-100';
  if (daysInResearch <= 30) return 'bg-red-50 hover:bg-red-100';
  return 'bg-red-100 hover:bg-red-150';
};

export const getDaysBadgeColor = (daysInResearch: number): string => {
  // Badge color scale from green to red
  if (daysInResearch <= 1) return 'bg-green-100 text-green-800 border-green-200';
  if (daysInResearch <= 3) return 'bg-lime-100 text-lime-800 border-lime-200';
  if (daysInResearch <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (daysInResearch <= 14) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (daysInResearch <= 30) return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-red-200 text-red-900 border-red-300';
};

// Generate specific audit messages for outcomes
export const getOutcomeAuditMessage = (outcome: Outcome, reason?: string): string => {
  switch (outcome) {
    case 'research_completed':
      return 'Retrieval coordinates changed as a result of research, retrieval attempt cancelled, new retrieval attempt dispatched';
    case 'research_failed':
      return `PNP4 invalid contact information${reason ? ` - ${reason}` : ''}`;
    default:
      return reason || 'Status updated';
  }
};