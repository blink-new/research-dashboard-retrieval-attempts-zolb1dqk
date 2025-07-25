import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, FileX } from 'lucide-react';
import { RetrievalAttempt, EditFormData, Outcome } from '../types';
import { validateEditForm, ValidationErrors, formatPhone } from '../utils/validation';
import { normalizeAddress, AddressSuggestion as AddressSuggestionType, isAddressNormalizationRequired } from '../utils/addressNormalization';
import { AuditLog } from './AuditLog';
import { AddressSuggestion } from './AddressSuggestion';

interface EditModalProps {
  attempt: RetrievalAttempt | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: EditFormData) => Promise<boolean>;
  loading: boolean;
}

export const EditModal = ({ attempt, open, onClose, onSave, loading }: EditModalProps) => {
  const [formData, setFormData] = useState<EditFormData>({
    phone: '',
    fax: '',
    email: '',
    chaseAddress: '',
    contactName: '',
    outcome: '' as Outcome,
    reason: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState('details');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestionType[]>([]);
  const [addressValidationLoading, setAddressValidationLoading] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string | undefined>();
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [pendingAddressValue, setPendingAddressValue] = useState('');

  useEffect(() => {
    if (attempt) {
      setFormData({
        phone: attempt.phone || '',
        fax: attempt.fax || '',
        email: attempt.email || '',
        chaseAddress: attempt.chaseAddress || '',
        contactName: attempt.contactName || '',
        outcome: '' as Outcome,
        reason: ''
      });
      setErrors({});
      setActiveTab('details');
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
      setAddressValidationError(undefined);
      setPendingAddressValue('');
    }
  }, [attempt]);

  const handleInputChange = (field: keyof EditFormData, value: string) => {
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
    const validationErrors = validateEditForm(formData);
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
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const success = await onSave(pnpData);
    if (success) {
      onClose();
    }
  };

  if (!attempt) return null;

  const isPNP004Selected = formData.outcome === 'research_failed';
  const isResearchCompleted = formData.outcome === 'research_completed';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Retrieval Attempt
            <Badge variant="outline" className="font-mono text-xs">
              {attempt.id}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="edit">Edit Contact</TabsTrigger>
            <TabsTrigger value="audit">
              Audit Log
              {attempt.audit && attempt.audit.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                  {attempt.audit.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Retrieval Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">UUID:</span>
                      <span className="ml-2 font-mono">{attempt.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Method:</span>
                      <span className="ml-2">{attempt.retrievalMethod}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Client:</span>
                      <span className="ml-2">{attempt.clientName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Demand ID:</span>
                      <span className="ml-2 font-mono">{attempt.demandId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Provider:</span>
                      <span className="ml-2">{attempt.providerName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Provider NPI:</span>
                      <span className="ml-2 font-mono">{attempt.providerNPI}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Provider Group:</span>
                      <span className="ml-2">{attempt.providerGroup}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className="ml-2 capitalize">{attempt.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Addresses</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Start File Address:</span>
                      <div className="ml-2 text-gray-800">{attempt.startAddress}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Recommended Chase Address:</span>
                      <div className="ml-2 text-gray-800">{attempt.chaseAddress}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Contact Name:</span>
                    <span className="ml-2">{attempt.contactName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="ml-2">{attempt.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fax:</span>
                    <span className="ml-2">{attempt.fax || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2">{attempt.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="555-123-4567"
                  data-testid="edit-phone-input"
                />
                {errors.phone && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleInputChange('fax', e.target.value)}
                  placeholder="555-123-4568"
                  data-testid="edit-fax-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@provider.com"
                  data-testid="edit-email-input"
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Dr. Smith"
                  data-testid="edit-contact-name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chaseAddress">Chase Address</Label>
              <Textarea
                id="chaseAddress"
                value={formData.chaseAddress}
                onChange={(e) => handleInputChange('chaseAddress', e.target.value)}
                onBlur={handleAddressBlur}
                placeholder="123 Main St, City, State 12345"
                rows={2}
                data-testid="edit-address-input"
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
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                value={formData.outcome || ""}
                onValueChange={(value) => handleInputChange('outcome', value)}
                data-testid="edit-outcome-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research_completed">Research Completed</SelectItem>
                  <SelectItem value="research_failed">Research Failed (PNP 004)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.outcome === 'research_completed' || formData.outcome === 'research_failed') && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason (Required for {formData.outcome === 'research_completed' ? 'Research Completed' : 'Research Failed'})
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder={formData.outcome === 'research_completed' 
                    ? "Explain what was completed and any findings..." 
                    : "Explain why the research failed..."
                  }
                  rows={3}
                  data-testid="edit-reason-input"
                />
                {errors.reason && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.reason}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <AuditLog auditEntries={attempt.audit || []} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPNP004Selected && (
              <Button
                variant="destructive"
                onClick={handleApplyPNP004}
                disabled={loading}
                data-testid="apply-pnp004-button"
              >
                <FileX className="h-4 w-4 mr-2" />
                Mark as Failed
              </Button>
            )}
            {isResearchCompleted && (
              <Button
                variant="default"
                onClick={handleSave}
                disabled={loading}
                data-testid="complete-research-button"
              >
                <Save className="h-4 w-4 mr-2" />
                Complete Research
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {!isResearchCompleted && !isPNP004Selected && (
              <Button onClick={handleSave} disabled={loading} data-testid="save-button">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};