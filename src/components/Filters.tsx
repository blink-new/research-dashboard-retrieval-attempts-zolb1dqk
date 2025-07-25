import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, Clock } from 'lucide-react';
import { FilterState } from '../types';
import { getUniqueValues } from '../fixtures/mockRetrievalAttempts';

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterPopoverProps {
  title: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  testId: string;
}

const FilterPopover = ({ title, options, selected, onSelectionChange, testId }: FilterPopoverProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onSelectionChange(newSelected);
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          data-testid={testId}
        >
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{title}</h4>
            {selected.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`${testId}-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <label
                  htmlFor={`${testId}-${option}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export const Filters = ({ filters, onFiltersChange }: FiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      retrievalMethod: [],
      clientName: [],
      demandId: [],
      providerGroup: [],
      providerName: [],
      researchAgent: [],
      search: '',
      daysInResearch: 'all'
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    (key !== 'search' && key !== 'daysInResearch' && Array.isArray(value) && value.length > 0) ||
    (key === 'daysInResearch' && value !== 'all')
  );

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 border-b">
      <div className="flex items-center gap-1 mr-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterPopover
          title="Retrieval Method"
          options={getUniqueValues('retrievalMethod')}
          selected={filters.retrievalMethod}
          onSelectionChange={(selected) => updateFilter('retrievalMethod', selected)}
          testId="filter-retrieval-method"
        />

        <FilterPopover
          title="Client Name"
          options={getUniqueValues('clientName')}
          selected={filters.clientName}
          onSelectionChange={(selected) => updateFilter('clientName', selected)}
          testId="filter-client-name"
        />

        <FilterPopover
          title="Demand ID"
          options={getUniqueValues('demandId')}
          selected={filters.demandId}
          onSelectionChange={(selected) => updateFilter('demandId', selected)}
          testId="filter-demand-id"
        />

        <FilterPopover
          title="Provider Group"
          options={getUniqueValues('providerGroup')}
          selected={filters.providerGroup}
          onSelectionChange={(selected) => updateFilter('providerGroup', selected)}
          testId="filter-provider-group"
        />

        <FilterPopover
          title="Provider Name"
          options={getUniqueValues('providerName')}
          selected={filters.providerName}
          onSelectionChange={(selected) => updateFilter('providerName', selected)}
          testId="filter-provider-name"
        />

        <FilterPopover
          title="Research Agent"
          options={getUniqueValues('researchAgent')}
          selected={filters.researchAgent}
          onSelectionChange={(selected) => updateFilter('researchAgent', selected)}
          testId="filter-research-agent"
        />

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <Select
            value={filters.daysInResearch || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, daysInResearch: value })}
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Days in research..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="0-3">0-3 days</SelectItem>
              <SelectItem value="4-7">4-7 days</SelectItem>
              <SelectItem value="8-14">8-14 days</SelectItem>
              <SelectItem value="15-30">15-30 days</SelectItem>
              <SelectItem value="30+">30+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
            data-testid="clear-all-filters"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};