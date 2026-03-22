// Address validation utilities
export const validateAddress = (data) => {
  const errors = {};

  // Full Name validation
  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length < 2) {
    errors.full_name = 'Please enter a valid full name (minimum 2 characters)';
  }

  // Phone Number validation (basic international format)
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!data.phone_number || !phoneRegex.test(data.phone_number.replace(/\s+/g, ''))) {
    errors.phone_number = 'Please enter a valid phone number';
  }

  // Email validation (optional if logged in, but validate format if provided)
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // House Number
  if (!data.house_number || typeof data.house_number !== 'string' || data.house_number.trim().length < 1) {
    errors.house_number = 'Please enter house/flat number';
  }

  // Street/Area
  if (!data.street || typeof data.street !== 'string' || data.street.trim().length < 3) {
    errors.street = 'Please enter a valid street/area (minimum 3 characters)';
  }

  // City
  if (!data.city || typeof data.city !== 'string' || data.city.trim().length < 2) {
    errors.city = 'Please enter a valid city (minimum 2 characters)';
  }

  // State
  if (!data.state || typeof data.state !== 'string' || data.state.trim().length < 2) {
    errors.state = 'Please enter a valid state (minimum 2 characters)';
  }

  // Postal Code (basic validation for common formats)
  const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
  if (!data.postal_code || !postalCodeRegex.test(data.postal_code)) {
    errors.postal_code = 'Please enter a valid postal code';
  }

  // Country
  if (!data.country || typeof data.country !== 'string' || data.country.trim().length < 2) {
    errors.country = 'Please select a country';
  }

  // Delivery Instructions (optional, just check length if provided)
  if (data.delivery_instructions && typeof data.delivery_instructions === 'string' && data.delivery_instructions.length > 500) {
    errors.delivery_instructions = 'Delivery instructions must be 500 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize address data (prevent injection)
export const sanitizeAddress = (data) => {
  return {
    full_name: (data.full_name || '').trim().substring(0, 100),
    phone_number: (data.phone_number || '').trim().substring(0, 20),
    email: (data.email || '').trim().toLowerCase().substring(0, 100),
    house_number: (data.house_number || '').trim().substring(0, 50),
    street: (data.street || '').trim().substring(0, 100),
    city: (data.city || '').trim().substring(0, 50),
    state: (data.state || '').trim().substring(0, 50),
    postal_code: (data.postal_code || '').trim().substring(0, 20),
    country: (data.country || '').trim().substring(0, 50),
    delivery_instructions: (data.delivery_instructions || '').trim().substring(0, 500),
  };
};
