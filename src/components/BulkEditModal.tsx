import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, FileX, Users } from 'lucide-react';
import { BulkEditData, Outcome } from '../types';
import { validateEditForm, ValidationErrors, formatPhone } from '../utils/validation';
import { normalizeAddress, AddressSuggestion as AddressSuggestionType, isAddressNormalizationRequired } from '../utils/addressNormalization';
import { AddressSuggestion } from './AddressSuggestion';

interface BulkEditModalProps {
  selectedIds: string[];
  open: boolean;
  onClose: () => void;
  onSave: (data: BulkEditData) => Promise<boolean>;
  loading: boolean;
}

export const BulkEditModal = ({ selectedIds, open, onClose, onSave, loading }: BulkEditModalProps) => {
  const [formData, setFormData] = useState<BulkEditData>({
    phone: '',
    fax: '',
    email: '',
    chaseAddress: '',
    contactName: '',
    outcome: '' as Outcome,
    reason: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestionType[]>([]);
  const [addressValidationLoading, setAddressValidationLoading] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string | undefined>();
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [pendingAddressValue, setPendingAddressValue] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        phone: '',
        fax: '',
        email: '',
        chaseAddress: '',
        contactName: '',
        outcome: '' as Outcome,
        reason: ''
      });
      setErrors({});
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
      setAddressValidationError(undefined);
      setPendingAddressValue('');
    }
  }, [open]);

  const handleInputChange = (field: keyof BulkEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone) {
      setFormData(prev => ({ ...prev, phone: formatPhone(prev.phone) }));
    }
  };

  const handleAddressBlur = async () => {
    const address = formData.chaseAddress.trim();
    
    if (!address || address.length < 5) {
      return;
    }

    if (isAddressNormalizationRequired(address)) {
      setPendingAddressValue(address);
      setAddressValidationLoading(true);
      setAddressValidationError(undefined);
      setShowAddressSuggestions(true);

      try {
        const result = await normalizeAddress(address);
        setAddressSuggestions(result.suggestions);
        setAddressValidationError(result.error);
      } catch (error) {
        setAddressValidationError('Failed to validate address. Please try again.');
        setAddressSuggestions([]);
      } finally {
        setAddressValidationLoading(false);
      }
    }
  };

  const handleAcceptAddress = (normalizedAddress: string) => {
    setFormData(prev => ({ ...prev, chaseAddress: normalizedAddress }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setAddressValidationError(undefined);
    setPendingAddressValue('');
  };

  const handleCancelAddressValidation = () => {
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setAddressValidationError(undefined);
    setPendingAddressValue('');
  };

  const handleSave = async () => {
    // For bulk edits, reason is always required
    const validationData = {
      ...formData,
      reason: formData.reason // Ensure reason is included in validation
    };

    const validationErrors = validateEditForm(validationData);
    
    // Add custom validation for bulk edit reason
    if (!formData.reason.trim()) {
      validationErrors.reason = 'Reason is required for bulk edits';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const handleApplyPNP004 = async () => {
    const pnpData = {
      ...formData,
      outcome: 'research_failed' as Outcome
    };

    const validationErrors = validateEditForm(pnpData);
    
    // Add custom validation for bulk edit reason
    if (!pnpData.reason.trim()) {
      validationErrors.reason = 'Reason is required for Research Failed';
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const success = await onSave(pnpData);
    if (success) {
      onClose();
    }
  };

  const isPNP004Selected = formData.outcome === 'research_failed';
  const isResearchCompleted = formData.outcome === 'research_completed';
  const hasChanges = Object.entries(formData).some(([key, value]) => 
    key !== 'reason' && key !== 'outcome' && value.trim().length > 0
  ) || formData.outcome.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Edit Attempts
            <Badge variant="default">
              {selectedIds.length} selected
            </Badge>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Only non-empty fields will be applied to selected attempts.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-phone">Phone</Label>
              <Input
                id="bulk-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="555-123-4567 (leave empty to skip)"
                data-testid="bulk-phone-input"
              />
              {errors.phone && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phone}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-fax">Fax</Label>
              <Input
                id="bulk-fax"
                value={formData.fax}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                placeholder="555-123-4568 (leave empty to skip)"
                data-testid="bulk-fax-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-email">Email</Label>
              <Input
                id="bulk-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@provider.com (leave empty to skip)"
                data-testid="bulk-email-input"
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-contactName">Contact Name</Label>
              <Input
                id="bulk-contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Dr. Smith (leave empty to skip)"
                data-testid="bulk-contact-name-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-chaseAddress">Chase Address</Label>
            <Textarea
              id="bulk-chaseAddress"
              value={formData.chaseAddress}
              onChange={(e) => handleInputChange('chaseAddress', e.target.value)}
              onBlur={handleAddressBlur}
              placeholder="123 Main St, City, State 12345 (leave empty to skip)"
              rows={2}
              data-testid="bulk-address-input"
            />
            {errors.chaseAddress && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.chaseAddress}
              </div>
            )}
            {showAddressSuggestions && (
              <AddressSuggestion
                suggestions={addressSuggestions}
                loading={addressValidationLoading}
                error={addressValidationError}
                onAccept={handleAcceptAddress}
                onCancel={handleCancelAddressValidation}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-outcome">Outcome</Label>
            <Select
              value={formData.outcome || ""}
              onValueChange={(value) => handleInputChange('outcome', value)}
              data-testid="bulk-outcome-select"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome (optional)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research_completed">Research Completed</SelectItem>
                <SelectItem value="research_failed">Research Failed (PNP 004)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-reason">
              Reason {(formData.outcome === 'research_completed' || formData.outcome === 'research_failed') 
                ? `(Required for ${formData.outcome === 'research_completed' ? 'Research Completed' : 'Research Failed'})` 
                : '(Required for audit trail)'}
            </Label>
            <Textarea
              id="bulk-reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder={formData.outcome === 'research_completed' 
                ? "Explain what was completed and any findings..." 
                : formData.outcome === 'research_failed'
                ? "Explain why the research failed..." 
                : "Explain the reason for these bulk changes..."
              }
              rows={3}
              data-testid="bulk-reason-input"
            />
            {errors.reason && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.reason}
              </div>
            )}
          </div>

          {!hasChanges && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Please fill in at least one field or select an outcome to apply changes.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPNP004Selected && (
              <Button
                variant="destructive"
                onClick={handleApplyPNP004}
                disabled={loading || !hasChanges}
                data-testid="bulk-apply-pnp004-button"
              >
                <FileX className="h-4 w-4 mr-2" />
                Mark {selectedIds.length} as Failed
              </Button>
            )}
            {isResearchCompleted && (
              <Button
                variant="default"
                onClick={handleSave}
                disabled={loading || !hasChanges}
                data-testid="bulk-complete-research-button"
              >
                <Save className="h-4 w-4 mr-2" />
                Complete {selectedIds.length} Research
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {!isResearchCompleted && !isPNP004Selected && (
              <Button 
                onClick={handleSave} 
                disabled={loading || !hasChanges}
                data-testid="bulk-save-button"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : `Update ${selectedIds.length} attempts`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};