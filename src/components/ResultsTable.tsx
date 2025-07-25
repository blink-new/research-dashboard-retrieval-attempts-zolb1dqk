import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, AlertTriangle } from 'lucide-react';
import { RetrievalAttempt, SortState } from '../types';
import { getStatusDisplayName, getStatusVariant, isOverdue, getOverdueDays, getDaysInResearch, getRowColorClass, getDaysBadgeColor } from '../utils/status';
import { toggleSortDirection } from '../utils/sorting';

interface ResultsTableProps {
  attempts: RetrievalAttempt[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEditAttempt: (attempt: RetrievalAttempt) => void;
  sortState: SortState;
  onSortChange: (sortState: SortState) => void;
}

export const ResultsTable = ({
  attempts,
  selectedIds,
  onSelectionChange,
  onEditAttempt,
  sortState,
  onSortChange
}: ResultsTableProps) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(attempts.map(a => a.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      setSelectAll(false);
    }
  };

  const handleSort = (field: keyof RetrievalAttempt | 'daysInResearch') => {
    if (sortState.field === field) {
      onSortChange({
        field,
        direction: toggleSortDirection(sortState.direction)
      });
    } else {
      onSortChange({
        field,
        direction: 'asc'
      });
    }
  };

  const getSortIcon = (field: keyof RetrievalAttempt | 'daysInResearch') => {
    if (sortState.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortState.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <Edit className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts found</h3>
        <p className="text-gray-500">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                data-testid="select-all-checkbox"
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('id')}
                className="h-8 px-2 font-medium"
              >
                ID
                {getSortIcon('id')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('retrievalMethod')}
                className="h-8 px-2 font-medium"
              >
                Method
                {getSortIcon('retrievalMethod')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('clientName')}
                className="h-8 px-2 font-medium"
              >
                Client
                {getSortIcon('clientName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('demandId')}
                className="h-8 px-2 font-medium"
              >
                Demand ID
                {getSortIcon('demandId')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('providerName')}
                className="h-8 px-2 font-medium"
              >
                Provider
                {getSortIcon('providerName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('providerGroup')}
                className="h-8 px-2 font-medium"
              >
                Provider Group
                {getSortIcon('providerGroup')}
              </Button>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('daysInResearch')}
                className="h-8 px-2 font-medium"
              >
                Days in Research
                {getSortIcon('daysInResearch')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('lastActionAt')}
                className="h-8 px-2 font-medium"
              >
                Last Action
                {getSortIcon('lastActionAt')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('researchAgent')}
                className="h-8 px-2 font-medium"
              >
                Agent
                {getSortIcon('researchAgent')}
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((attempt) => {
            const isSelected = selectedIds.includes(attempt.id);
            const overdue = isOverdue(attempt.lastActionAt);
            const overdueDays = overdue ? getOverdueDays(attempt.lastActionAt) : 0;
            const daysInResearch = getDaysInResearch(attempt.lastActionAt);
            const rowColorClass = getRowColorClass(daysInResearch);

            return (
              <TableRow
                key={attempt.id}
                className={`${isSelected ? 'bg-blue-50' : rowColorClass} transition-colors`}
                data-testid={`table-row-${attempt.id}`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(attempt.id, checked as boolean)}
                    data-testid={`select-row-${attempt.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {attempt.id}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {attempt.retrievalMethod}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {attempt.clientName}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {attempt.demandId}
                </TableCell>
                <TableCell>
                  {attempt.providerName}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {attempt.providerGroup}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="space-y-1">
                    {attempt.phone && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">P:</span>
                        <span>{attempt.phone}</span>
                      </div>
                    )}
                    {attempt.fax && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">F:</span>
                        <span>{attempt.fax}</span>
                      </div>
                    )}
                    {attempt.email && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">E:</span>
                        <span className="truncate max-w-32">{attempt.email}</span>
                      </div>
                    )}
                    {attempt.contactName && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">C:</span>
                        <span className="font-medium">{attempt.contactName}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(attempt.status)}>
                    {getStatusDisplayName(attempt.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium border ${getDaysBadgeColor(daysInResearch)}`}
                    >
                      {daysInResearch}d
                    </Badge>
                    {overdue && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(attempt.lastActionAt)}
                </TableCell>
                <TableCell className="text-sm">
                  {attempt.researchAgent || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditAttempt(attempt)}
                    data-testid={`edit-button-${attempt.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};