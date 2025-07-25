import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditEntry } from '../types';

interface AuditLogProps {
  auditEntries: AuditEntry[];
}

export const AuditLog = ({ auditEntries }: AuditLogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case 'phone':
        return 'Phone';
      case 'fax':
        return 'Fax';
      case 'email':
        return 'Email';
      case 'contactName':
        return 'Contact Name';
      case 'chaseAddress':
        return 'Chase Address';
      case 'status':
        return 'Status';
      case 'outcome':
        return 'Outcome';
      default:
        return field;
    }
  };

  const formatValue = (value: string | null) => {
    if (value === null) return <span className="text-gray-400 italic">empty</span>;
    if (value === '') return <span className="text-gray-400 italic">cleared</span>;
    return <span className="font-mono text-sm">{value}</span>;
  };

  if (auditEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No audit entries yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Timestamp</TableHead>
            <TableHead className="w-24">User</TableHead>
            <TableHead className="w-24">Field</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditEntries
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-gray-600">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {entry.user}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {getFieldDisplayName(entry.field)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    {formatValue(entry.from)}
                    <span className="text-gray-400">→</span>
                    {formatValue(entry.to)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {entry.reason || '-'}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};