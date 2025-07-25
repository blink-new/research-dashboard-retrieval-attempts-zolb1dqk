import { RetrievalAttempt, AuditEntry } from '../types';

// Helper function to create dates with specific days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Mock audit entries
const mockAuditEntries: AuditEntry[] = [
  {
    id: 'audit_001',
    attemptId: 'c3d4e5f6-g7h8-9012-cdef-g34567890123',
    field: 'phone',
    from: null,
    to: '(555) 555-1234',
    user: 'agent_smith',
    reason: 'Found contact number through provider directory',
    timestamp: '2024-01-20T10:30:00.000Z'
  },
  {
    id: 'audit_002',
    attemptId: 'c3d4e5f6-g7h8-9012-cdef-g34567890123',
    field: 'email',
    from: null,
    to: 'info@coastalfm.com',
    user: 'agent_smith',
    timestamp: '2024-01-20T10:35:00.000Z'
  }
];

export const mockRetrievalAttempts: RetrievalAttempt[] = [
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-g34567890123',
    retrievalMethod: 'Offsite',
    clientName: 'Aetna',
    demandId: 'D10297',
    providerName: 'Dr. Michael Brown',
    providerNPI: '1234567890',
    providerGroup: 'Coastal Family Medicine',
    startAddress: '987 Coastal Rd, Portland, OR',
    chaseAddress: '654 Harbor St, Portland, OR',
    status: 'research',
    lastActionAt: daysAgo(1), // 1 day ago
    phone: '(555) 555-1234',
    fax: '(555) 555-1235',
    email: 'info@coastalfm.com',
    contactName: 'Lisa Chen',
    researchAgent: 'agent_smith',
    version: 1,
    audit: mockAuditEntries.filter(a => a.attemptId === 'c3d4e5f6-g7h8-9012-cdef-g34567890123')
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-e12345678901',
    retrievalMethod: 'HIH',
    clientName: 'Blue Cross Blue Shield',
    demandId: 'D10298',
    providerName: 'Dr. Sarah Johnson',
    providerNPI: '2345678901',
    providerGroup: 'Metro Health Associates',
    startAddress: '456 Medical Center Dr, Seattle, WA',
    chaseAddress: '456 Medical Center Dr, Seattle, WA',
    status: 'research',
    lastActionAt: daysAgo(2), // 2 days ago
    phone: '(206) 555-0199',
    fax: '(206) 555-0200',
    contactName: 'Jennifer Martinez',
    researchAgent: 'agent_jones',
    version: 1,
    audit: []
  },
  {
    id: 'f7e8d9c0-b1a2-3456-789a-bcdef0123456',
    retrievalMethod: 'Offsite',
    clientName: 'United Healthcare',
    demandId: 'D10299',
    providerName: 'Dr. James Wilson',
    providerNPI: '3456789012',
    providerGroup: 'Westside Medical Group',
    startAddress: '321 Oak Street, Denver, CO',
    chaseAddress: '321 Oak Street, Denver, CO',
    status: 'research',
    lastActionAt: daysAgo(3), // 3 days ago
    phone: '(303) 555-0156',
    email: 'jwilson@westsidemedical.com',
    contactName: 'Dr. James Wilson',
    researchAgent: 'agent_brown',
    version: 1,
    audit: []
  },
  {
    id: '9876543a-bcde-f012-3456-789abcdef012',
    retrievalMethod: 'HIH',
    clientName: 'Cigna',
    demandId: 'D10300',
    providerName: 'Dr. Emily Davis',
    providerNPI: '4567890123',
    providerGroup: 'Northside Family Practice',
    startAddress: '654 Maple Dr, Austin, TX',
    chaseAddress: '654 Maple Dr, Austin, TX',
    status: 'research',
    lastActionAt: daysAgo(5), // 5 days ago
    email: 'edavis@northsidefp.com',
    contactName: 'Dr. Emily Davis',
    researchAgent: 'agent_davis',
    version: 1,
    audit: []
  },
  {
    id: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
    retrievalMethod: 'Offsite',
    clientName: 'Humana',
    demandId: 'D10301',
    providerName: 'Dr. Robert Chen',
    providerNPI: '5678901234',
    providerGroup: 'Downtown Urgent Care',
    startAddress: '987 Broadway, New York, NY',
    chaseAddress: '987 Broadway, New York, NY',
    status: 'research',
    lastActionAt: daysAgo(7), // 7 days ago
    phone: '(212) 555-0187',
    fax: '(212) 555-0188',
    email: 'rchen@downtownurgent.com',
    contactName: 'Sarah Wilson',
    researchAgent: 'agent_smith',
    version: 1,
    audit: []
  },
  {
    id: 'abcd1234-ef56-7890-abcd-ef1234567890',
    retrievalMethod: 'HIH',
    clientName: 'Kaiser Permanente',
    demandId: 'D10302',
    providerName: 'Dr. Lisa Thompson',
    providerNPI: '6789012345',
    providerGroup: 'Eastside Pediatrics',
    startAddress: '147 Cedar Ln, Phoenix, AZ',
    chaseAddress: '147 Cedar Ln, Phoenix, AZ',
    status: 'research',
    lastActionAt: daysAgo(10), // 10 days ago
    phone: '(480) 555-0145',
    contactName: 'Dr. Lisa Thompson',
    researchAgent: 'agent_jones',
    version: 1,
    audit: []
  },
  {
    id: 'def45678-9abc-def0-1234-56789abcdef0',
    retrievalMethod: 'Offsite',
    clientName: 'Anthem',
    demandId: 'D10303',
    providerName: 'Dr. Mark Rodriguez',
    providerNPI: '7890123456',
    providerGroup: 'Valley Orthopedics',
    startAddress: '258 Valley Rd, Las Vegas, NV',
    chaseAddress: '258 Valley Rd, Las Vegas, NV',
    status: 'research',
    lastActionAt: daysAgo(15), // 15 days ago
    email: 'mrodriguez@valleyortho.com',
    contactName: 'Maria Gonzalez',
    researchAgent: 'agent_brown',
    version: 1,
    audit: []
  },
  {
    id: '789abcde-f012-3456-789a-bcdef0123456',
    retrievalMethod: 'HIH',
    clientName: 'Medicaid',
    demandId: 'D10304',
    providerName: 'Dr. Amanda Foster',
    providerNPI: '8901234567',
    providerGroup: 'Lakeside Dermatology',
    startAddress: '369 Lake View Dr, Miami, FL',
    chaseAddress: '987 Ocean View Dr, Portland, OR 97201',
    status: 'research',
    lastActionAt: daysAgo(22), // 22 days ago
    phone: '(305) 555-0173',
    fax: '(305) 555-0174',
    email: 'afoster@lakesidederm.com',
    contactName: 'Dr. Amanda Foster',
    researchAgent: 'agent_davis',
    version: 1,
    audit: []
  },
  {
    id: 'xyz12345-6789-abcd-ef01-23456789abcd',
    retrievalMethod: 'Offsite',
    clientName: 'Medicare',
    demandId: 'D10305',
    providerName: 'Dr. Kevin Park',
    providerNPI: '9012345678',
    providerGroup: 'Riverside Cardiology',
    startAddress: '741 River St, Chicago, IL',
    chaseAddress: '741 River St, Chicago, IL',
    status: 'research',
    lastActionAt: daysAgo(30), // 30 days ago
    phone: '(312) 555-0198',
    email: 'kpark@riversidecardio.com',
    contactName: 'Dr. Kevin Park',
    researchAgent: 'agent_smith',
    version: 1,
    audit: []
  },
  {
    id: 'abc98765-4321-dcba-9876-543210fedcba',
    retrievalMethod: 'HIH',
    clientName: 'Tricare',
    demandId: 'D10306',
    providerName: 'Dr. Rachel Green',
    providerNPI: '0123456789',
    providerGroup: 'Military Family Health',
    startAddress: '852 Base Rd, San Diego, CA',
    chaseAddress: '852 Base Rd, San Diego, CA',
    status: 'research',
    lastActionAt: daysAgo(25), // 25 days ago
    phone: '(619) 555-0167',
    fax: '(619) 555-0168',
    email: 'rgreen@militaryfh.com',
    contactName: 'Rachel Green',
    researchAgent: 'agent_jones',
    version: 1,
    audit: []
  }
];

// Helper function to get unique values for filters
export const getUniqueValues = (field: keyof RetrievalAttempt): string[] => {
  const values = mockRetrievalAttempts
    .map(attempt => attempt[field])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  return [...new Set(values)].sort();
};