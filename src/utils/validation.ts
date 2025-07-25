export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$|^[(]?[\d]{3}[)]?[\s-]?[\d]{3}[\s-]?[\d]{4}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAddress = (address: string): boolean => {
  if (!address) return true; // Optional field
  return address.trim().length >= 5; // Basic presence check
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone; // Return as-is if not 10 digits
};

export interface ValidationErrors {
  phone?: string;
  email?: string;
  chaseAddress?: string;
  reason?: string;
}

export const validateEditForm = (data: {
  phone: string;
  email: string;
  chaseAddress: string;
  outcome: string;
  reason?: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email address format';
  }

  if (data.chaseAddress && !validateAddress(data.chaseAddress)) {
    errors.chaseAddress = 'Address must be at least 5 characters';
  }

  if ((data.outcome === 'research_completed' || data.outcome === 'research_failed') && !validateRequired(data.reason || '')) {
    errors.reason = `Reason is required for ${data.outcome === 'research_completed' ? 'Research Completed' : 'Research Failed'}`;
  }

  return errors;
};