export interface AddressSuggestion {
  original: string;
  normalized: string;
  confidence: number;
  components: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface AddressValidationResult {
  isValid: boolean;
  suggestions: AddressSuggestion[];
  error?: string;
}

const normalizeStreetType = (streetType: string): string => {
  const streetTypeMap: Record<string, string> = {
    'st': 'Street',
    'street': 'Street',
    'ave': 'Avenue',
    'avenue': 'Avenue',
    'rd': 'Road',
    'road': 'Road',
    'dr': 'Drive',
    'drive': 'Drive',
    'blvd': 'Boulevard',
    'boulevard': 'Boulevard',
    'ln': 'Lane',
    'lane': 'Lane',
    'ct': 'Court',
    'court': 'Court',
    'pl': 'Place',
    'place': 'Place',
    'way': 'Way',
    'cir': 'Circle',
    'circle': 'Circle'
  };

  return streetTypeMap[streetType.toLowerCase()] || streetType;
};

const parseCityStateZip = (cityStateZip: string): { city: string; state: string; zip: string } => {
  // Try to parse "City, ST 12345" format
  const match = cityStateZip.match(/^(.+?),?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/i);
  if (match) {
    return {
      city: match[1].trim(),
      state: match[2].toUpperCase(),
      zip: match[3]
    };
  }

  // Fallback - try to extract what we can
  const parts = cityStateZip.split(/[,\s]+/);
  const zipMatch = cityStateZip.match(/\d{5}(?:-\d{4})?/);
  const stateMatch = cityStateZip.match(/\b[A-Z]{2}\b/i);

  return {
    city: parts[0] || '',
    state: stateMatch ? stateMatch[0].toUpperCase() : '',
    zip: zipMatch ? zipMatch[0] : ''
  };
};

const basicAddressNormalization = (address: string): string => {
  return address
    // Normalize spacing
    .replace(/\s+/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, l => l.toUpperCase())
    // Fix common abbreviations
    .replace(/\bSt\b/gi, 'Street')
    .replace(/\bAve\b/gi, 'Avenue')
    .replace(/\bRd\b/gi, 'Road')
    .replace(/\bDr\b/gi, 'Drive')
    .replace(/\bBlvd\b/gi, 'Boulevard')
    .replace(/\bLn\b/gi, 'Lane')
    .replace(/\bCt\b/gi, 'Court')
    .replace(/\bPl\b/gi, 'Place')
    .trim();
};

// Mock address normalization service
// In a real implementation, this would call a service like Google Places API, SmartyStreets, etc.
export const normalizeAddress = async (address: string): Promise<AddressValidationResult> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!address || address.trim().length < 5) {
    return {
      isValid: false,
      suggestions: [],
      error: 'Address too short for validation'
    };
  }

  const trimmedAddress = address.trim();

  // Mock normalization logic - in reality this would be a proper address validation service
  const mockSuggestions: AddressSuggestion[] = [];

  // Common address patterns and their normalized versions
  const addressPatterns = [
    {
      pattern: /(\d+)\s+(.*?)\s+(st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|ln|lane|ct|court|pl|place|way|cir|circle)\s*,?\s*(.+)/i,
      normalize: (match: RegExpMatchArray) => {
        const [, number, streetName, streetType, cityStateZip] = match;
        const normalizedStreetType = normalizeStreetType(streetType);
        const { city, state, zip } = parseCityStateZip(cityStateZip);
        
        return {
          original: trimmedAddress,
          normalized: `${number} ${streetName} ${normalizedStreetType}, ${city}, ${state} ${zip}`,
          confidence: 0.95,
          components: {
            streetNumber: number,
            streetName: streetName.trim(),
            city: city,
            state: state,
            zipCode: zip
          }
        };
      }
    }
  ];

  // Try to match and normalize the address
  for (const { pattern, normalize } of addressPatterns) {
    const match = trimmedAddress.match(pattern);
    if (match) {
      try {
        const suggestion = normalize(match);
        mockSuggestions.push(suggestion);
      } catch (error) {
        // Continue to next pattern if normalization fails
      }
    }
  }

  // If no patterns matched, create a basic suggestion with common fixes
  if (mockSuggestions.length === 0) {
    const basicNormalized = basicAddressNormalization(trimmedAddress);
    if (basicNormalized !== trimmedAddress) {
      mockSuggestions.push({
        original: trimmedAddress,
        normalized: basicNormalized,
        confidence: 0.75,
        components: {}
      });
    }
  }

  // Always add the original as a fallback option
  if (mockSuggestions.length > 0) {
    mockSuggestions.push({
      original: trimmedAddress,
      normalized: trimmedAddress,
      confidence: 0.5,
      components: {}
    });
  }

  return {
    isValid: mockSuggestions.length > 0,
    suggestions: mockSuggestions
  };
};

export const isAddressNormalizationRequired = (address: string): boolean => {
  if (!address || address.trim().length < 5) {
    return false;
  }

  // Check if address looks like it might need normalization
  const hasCommonAbbreviations = /\b(st|ave|rd|dr|blvd|ln|ct|pl)\b/i.test(address);
  const hasInconsistentSpacing = /\s{2,}/.test(address);
  const hasLowercaseStreetTypes = /\b(street|avenue|road|drive|boulevard|lane|court|place)\b/g.test(address);

  return hasCommonAbbreviations || hasInconsistentSpacing || !hasLowercaseStreetTypes;
};