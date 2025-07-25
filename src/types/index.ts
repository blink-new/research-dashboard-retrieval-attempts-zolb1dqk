export type RetrievalAttemptStatus =
  | "research"
  | "researched_success"
  | "research_unable_to_locate"
  | "ready_for_outreach"
  | "reroute_to_method"
  | "cancelled_failed"
  | "blocked_external";

export interface RetrievalAttempt {
  id: string;                  // UUID format
  retrievalMethod: "Offsite" | "HIH";
  clientName: string;
  demandId: string;
  providerName: string;
  providerNPI: string;         // Provider NPI number
  providerGroup: string;
  startAddress: string;
  chaseAddress: string;
  status: RetrievalAttemptStatus;
  lastActionAt: string;        // ISO
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  researchAgent?: string;
  version: number;             // for optimistic concurrency
  audit?: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  attemptId: string;
  field: "phone" | "fax" | "email" | "contactName" | "chaseAddress" | "status" | "outcome";
  from: string | null;
  to: string | null;
  user: string;
  reason?: string;
  timestamp: string; // ISO
}

export type Outcome =
  | ""
  | "research_completed"
  | "research_failed";

export interface FilterState {
  retrievalMethod: string[];
  clientName: string[];
  demandId: string[];
  providerGroup: string[];
  providerName: string[];
  researchAgent: string[];
  search: string;
  daysInResearch: string; // e.g., "all", "0-3", "4-7", "8-14", "15-30", "30+"
}

export interface SortState {
  field: keyof RetrievalAttempt | 'daysInResearch';
  direction: 'asc' | 'desc';
}

export interface EditFormData {
  phone: string;
  fax: string;
  email: string;
  chaseAddress: string;
  contactName: string;
  outcome: Outcome;
  reason?: string;
}

export interface BulkEditData extends EditFormData {
  reason: string; // Required for bulk edits
}