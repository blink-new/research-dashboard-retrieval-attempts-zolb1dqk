import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Edit, Trash2 } from 'lucide-react';
import { FilterState } from '../types';

interface ToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCount: number;
  totalCount: number;
  filteredCount: number;
  onBulkEdit: () => void;
  onClearSelection: () => void;
  onExportCSV: () => void;
  filters: FilterState;
}

export const Toolbar = ({
  search,
  onSearchChange,
  selectedCount,
  totalCount,
  filteredCount,
  onBulkEdit,
  onClearSelection,
  onExportCSV,
  filters
}: ToolbarProps) => {
  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter.length > 0
  );

  return (
    <div className="flex flex-col gap-4 p-6 bg-white border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Research Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage retrieval attempts in research status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            data-testid="export-csv-button"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by attempt ID (space/comma separated for bulk)..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80"
              data-testid="search-input"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredCount === totalCount 
                ? `${totalCount} attempts` 
                : `${filteredCount} of ${totalCount} attempts`
              }
            </Badge>
            {hasActiveFilters && (
              <Badge variant="outline">
                Filters active
              </Badge>
            )}
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {selectedCount} selected
            </Badge>
            <Button
              variant="default"
              size="sm"
              onClick={onBulkEdit}
              data-testid="bulk-edit-button"
            >
              <Edit className="h-4 w-4 mr-2" />
              Bulk Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              data-testid="clear-selection-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};