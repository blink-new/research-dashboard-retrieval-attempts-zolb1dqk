import { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { Filters } from './components/Filters';
import { ResultsTable } from './components/ResultsTable';
import { EditModal } from './components/EditModal';
import { BulkEditModal } from './components/BulkEditModal';
import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { RetrievalAttempt } from './types';
import { useRetrievalAttempts } from './hooks/useRetrievalAttempts';
import { toggleSortDirection } from './utils/sorting';

function App() {
  const {
    attempts,
    totalCount,
    filteredCount,
    loading,
    error,
    filters,
    setFilters,
    sortState,
    setSortState,
    updateAttempt,
    bulkUpdateAttempts,
    clearError
  } = useRetrievalAttempts();

  // UI state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingAttempt, setEditingAttempt] = useState<RetrievalAttempt | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  // Search handling
  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
  };

  // Selection handling
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Edit handling
  const handleEditAttempt = (attempt: RetrievalAttempt) => {
    setEditingAttempt(attempt);
  };

  const handleCloseEditModal = () => {
    setEditingAttempt(null);
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingAttempt) return false;
    const success = await updateAttempt(editingAttempt.id, data);
    return success;
  };

  // Bulk edit handling
  const handleBulkEdit = () => {
    setShowBulkEdit(true);
  };

  const handleCloseBulkEdit = () => {
    setShowBulkEdit(false);
  };

  const handleSaveBulkEdit = async (data: any) => {
    const success = await bulkUpdateAttempts(selectedIds, data);
    if (success) {
      setSelectedIds([]);
    }
    return success;
  };

  // Sort handling
  const handleSortChange = (newSortState: any) => {
    setSortState(newSortState);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Retrieval Method',
      'Client Name',
      'Demand ID',
      'Provider Name',
      'Provider Group',
      'Start Address',
      'Chase Address',
      'Status',
      'Last Action',
      'Phone',
      'Fax',
      'Email',
      'Contact Name',
      'Research Agent'
    ];

    const csvData = attempts.map(attempt => [
      attempt.id,
      attempt.retrievalMethod,
      attempt.clientName,
      attempt.demandId,
      attempt.providerName,
      attempt.providerGroup,
      attempt.startAddress,
      attempt.chaseAddress,
      attempt.status,
      attempt.lastActionAt,
      attempt.phone || '',
      attempt.fax || '',
      attempt.email || '',
      attempt.contactName || '',
      attempt.researchAgent || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `research-attempts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 hover:bg-red-100 rounded p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-screen">
        {/* Toolbar */}
        <Toolbar
          search={filters.search}
          onSearchChange={handleSearchChange}
          selectedCount={selectedIds.length}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onBulkEdit={handleBulkEdit}
          onClearSelection={handleClearSelection}
          onExportCSV={handleExportCSV}
          filters={filters}
        />

        {/* Filters */}
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Results Table */}
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}
          
          {!loading && (
            <ResultsTable
              attempts={attempts}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onEditAttempt={handleEditAttempt}
              sortState={sortState}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        attempt={editingAttempt}
        open={!!editingAttempt}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        loading={loading}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        selectedIds={selectedIds}
        open={showBulkEdit}
        onClose={handleCloseBulkEdit}
        onSave={handleSaveBulkEdit}
        loading={loading}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;