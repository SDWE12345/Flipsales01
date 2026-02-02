// lib/utils/upi-validator.js - Enhanced UPI Validation & QR Generation

/**
 * Validate UPI ID format
 * Format: username@bankcode or phonenumber@bankcode
 */
export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    throw new Error('UPI ID is required');
  }

  const trimmedUpi = upiId.trim().toLowerCase();
  
  // UPI ID regex: alphanumeric + dots/underscores @ alphanumeric
  const upiRegex = /^[a-z0-9.\-_]{3,}@[a-z]{3,}$/i;
  
  if (!upiRegex.test(trimmedUpi)) {
    throw new Error('Invalid UPI ID format. Example: user@paytm or 9876543210@paytm');
  }

  // Check for common UPI providers
  const validProviders = [
    'paytm', 'phonepe', 'gpay', 'googlepay', 'amazonpay', 
    'bhim', 'ybl', 'axisbank', 'sbi', 'icici', 'hdfc',
    'okaxis', 'oksbi', 'okicici', 'okhdfc', 'ibl', 'federal'
  ];

  const [username, provider] = trimmedUpi.split('@');
  
  if (username.length < 3) {
    throw new Error('UPI username must be at least 3 characters');
  }

  return trimmedUpi;
}

/**
 * Validate IFSC Code format
 */
export function validateIfscCode(ifsc) {
  if (!ifsc) return null;
  
  const trimmedIfsc = ifsc.trim().toUpperCase();
  
  // IFSC format: 4 letters (bank) + 0 + 6 alphanumeric (branch)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(trimmedIfsc)) {
    throw new Error('Invalid IFSC code format. Example: SBIN0001234');
  }
  
  return trimmedIfsc;
}

/**
 * Validate Account Number
 */
export function validateAccountNumber(accountNumber) {
  if (!accountNumber) return null;
  
  const trimmed = accountNumber.trim();
  
  // Account numbers are typically 9-18 digits
  const accountRegex = /^[0-9]{9,18}$/;
  
  if (!accountRegex.test(trimmed)) {
    throw new Error('Invalid account number. Should be 9-18 digits');
  }
  
  return trimmed;
}

/**
 * Generate UPI payment URL
 * Used for creating payment links and QR codes
 */
export function generateUpiPaymentUrl(params) {
  const {
    upiId,
    payeeName,
    amount,
    transactionNote,
    merchantCode,
    transactionId
  } = params;

  if (!upiId) {
    throw new Error('UPI ID is required for payment URL');
  }

  // UPI URL format: upi://pay?parameters
  const urlParams = new URLSearchParams();
  
  urlParams.append('pa', upiId); // Payee address (UPI ID)
  
  if (payeeName) {
    urlParams.append('pn', payeeName); // Payee name
  }
  
  if (merchantCode) {
    urlParams.append('mc', merchantCode); // Merchant code
  }
  
  if (transactionId) {
    urlParams.append('tr', transactionId); // Transaction reference ID
  }
  
  if (transactionNote) {
    urlParams.append('tn', transactionNote); // Transaction note
  }
  
  if (amount) {
    urlParams.append('am', amount.toString()); // Amount
    urlParams.append('cu', 'INR'); // Currency
  }
  
  return `upi://pay?${urlParams.toString()}`;
}

/**
 * Parse UPI QR code data
 */
export function parseUpiQrCode(qrData) {
  try {
    if (!qrData.startsWith('upi://pay?')) {
      throw new Error('Invalid UPI QR code format');
    }

    const url = new URL(qrData);
    const params = new URLSearchParams(url.search);

    return {
      upiId: params.get('pa'),
      payeeName: params.get('pn'),
      merchantCode: params.get('mc'),
      transactionId: params.get('tr'),
      transactionNote: params.get('tn'),
      amount: params.get('am'),
      currency: params.get('cu') || 'INR'
    };
  } catch (error) {
    throw new Error('Failed to parse UPI QR code: ' + error.message);
  }
}

/**
 * Sanitize UPI data for database storage
 */
export function sanitizeUpiData(data) {
  const sanitized = {};

  if (data.upiId) {
    sanitized.upiId = validateUpiId(data.upiId);
  }

  if (data.upiName) {
    sanitized.upiName = data.upiName.trim().slice(0, 100);
  }

  if (data.merchantCode) {
    sanitized.merchantCode = data.merchantCode.trim().toUpperCase().slice(0, 50);
  }

  if (data.merchantName) {
    sanitized.merchantName = data.merchantName.trim().slice(0, 100);
  }

  if (data.ifscCode) {
    sanitized.ifscCode = validateIfscCode(data.ifscCode);
  }

  if (data.accountNumber) {
    sanitized.accountNumber = validateAccountNumber(data.accountNumber);
  }

  if (data.bankName) {
    sanitized.bankName = data.bankName.trim().slice(0, 100);
  }

  if (data.qrCode) {
    // Validate if it's a base64 image or URL
    if (data.qrCode.startsWith('data:image/')) {
      // Base64 image
      sanitized.qrCode = data.qrCode.slice(0, 500000); // Max 500KB
    } else if (data.qrCode.startsWith('http')) {
      // URL
      sanitized.qrCode = data.qrCode.slice(0, 2000);
    } else if (data.qrCode.startsWith('upi://')) {
      // UPI URL
      sanitized.qrCode = data.qrCode.slice(0, 500);
    }
  }

  if (data.isActive !== undefined) {
    sanitized.isActive = Boolean(data.isActive);
  }

  return sanitized;
}

/**
 * Get popular UPI providers
 */
export function getUpiProviders() {
  return [
    { code: 'paytm', name: 'Paytm' },
    { code: 'phonepe', name: 'PhonePe' },
    { code: 'gpay', name: 'Google Pay' },
    { code: 'amazonpay', name: 'Amazon Pay' },
    { code: 'bhim', name: 'BHIM' },
    { code: 'ybl', name: 'Yes Bank' },
    { code: 'axisbank', name: 'Axis Bank' },
    { code: 'sbi', name: 'State Bank of India' },
    { code: 'icici', name: 'ICICI Bank' },
    { code: 'hdfc', name: 'HDFC Bank' },
    { code: 'okaxis', name: 'Axis Bank (OK)' },
    { code: 'oksbi', name: 'SBI (OK)' },
    { code: 'okicici', name: 'ICICI (OK)' },
    { code: 'okhdfc', name: 'HDFC (OK)' },
    { code: 'ibl', name: 'IndusInd Bank' },
    { code: 'federal', name: 'Federal Bank' }
  ];
}