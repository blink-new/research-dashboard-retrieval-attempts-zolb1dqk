import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { AddressSuggestion as AddressSuggestionType, AddressValidationResult } from '../utils/addressNormalization';

interface AddressSuggestionProps {
  suggestions: AddressSuggestionType[];
  loading: boolean;
  error?: string;
  onAccept: (normalizedAddress: string) => void;
  onCancel: () => void;
}

export const AddressSuggestion = ({ 
  suggestions, 
  loading, 
  error, 
  onAccept, 
  onCancel 
}: AddressSuggestionProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="mt-2">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Validating address...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-2 border-red-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={onCancel}>
              Continue with original
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="mt-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          Address Suggestions
        </CardTitle>
        <p className="text-xs text-gray-600">
          Please select a normalized address or keep the original:
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedSuggestion === suggestion.normalized
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedSuggestion(suggestion.normalized)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.normalized}
                </div>
                {suggestion.original !== suggestion.normalized && (
                  <div className="text-xs text-gray-500 mt-1">
                    Original: {suggestion.original}
                  </div>
                )}
                {suggestion.components && Object.keys(suggestion.components).length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.components.streetNumber && (
                      <span className="mr-2">#{suggestion.components.streetNumber}</span>
                    )}
                    {suggestion.components.city && (
                      <span className="mr-2">{suggestion.components.city}</span>
                    )}
                    {suggestion.components.state && (
                      <span className="mr-2">{suggestion.components.state}</span>
                    )}
                    {suggestion.components.zipCode && (
                      <span>{suggestion.components.zipCode}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                >
                  {getConfidenceLabel(suggestion.confidence)}
                </Badge>
                {selectedSuggestion === suggestion.normalized && (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button 
            size="sm" 
            onClick={() => selectedSuggestion && onAccept(selectedSuggestion)}
            disabled={!selectedSuggestion}
            data-testid="accept-address-button"
          >
            Accept Selected
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onCancel}
            data-testid="cancel-address-button"
          >
            Keep Original
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};