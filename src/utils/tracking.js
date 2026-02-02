// utils/tracking.js - Complete Facebook Pixel & Tracking Implementation

let isInitialized = false;
let trackedPurchases = new Set();

/**
 * Initialize Facebook Pixel
 * Call this in _app.js or _document.js
 */
export const initFacebookPixel = (pixelId) => {
  if (isInitialized || !pixelId) return;

  // Facebook Pixel Base Code
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  isInitialized = true;
  console.log('✅ Facebook Pixel initialized:', pixelId);
};

/**
 * Track standard Facebook events
 */
export const fbEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`📊 FB Event: ${eventName}`, params);
  }
};

/**
 * Track custom events
 */
export const fbCustomEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
    console.log(`📊 FB Custom Event: ${eventName}`, params);
  }
};

/**
 * Product View Tracking
 */
export const trackProductView = (product, extraParams = {}) => {
  if (!product) return;

  const params = {
    content_ids: [product.id || product._id],
    content_name: product.title || product.Title,
    content_type: 'product',
    value: parseFloat(product.selling_price || product.price || 0),
    currency: 'INR',
    ...extraParams
  };

  fbEvent('ViewContent', params);
};

/**
 * Add to Cart Tracking
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;

  const params = {
    content_ids: [product.id || product._id],
    content_name: product.title || product.Title,
    content_type: 'product',
    value: parseFloat(product.selling_price || product.price || 0) * quantity,
    currency: 'INR',
    num_items: quantity
  };

  fbEvent('AddToCart', params);
};

/**
 * Initiate Checkout Tracking
 */
export const trackInitiateCheckout = (cartItems) => {
  if (!cartItems || cartItems.length === 0) return;

  const contentIds = cartItems.map(item => item.id || item._id);
  const totalValue = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.selling_price || item.price || 0);
    const qty = parseInt(item.quantity || 1);
    return sum + (price * qty);
  }, 0);

  const params = {
    content_ids: contentIds,
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
    num_items: cartItems.length
  };

  fbEvent('InitiateCheckout', params);
};

/**
 * Add Payment Info Tracking
 */
export const trackAddPaymentInfo = (product, paymentMethod) => {
  if (!product) return;

  const params = {
    content_ids: [product.id || product._id],
    content_type: 'product',
    value: parseFloat(product.selling_price || product.price || 0),
    currency: 'INR',
    payment_method: paymentMethod
  };

  fbEvent('AddPaymentInfo', params);
};

/**
 * Purchase Tracking (MOST IMPORTANT for Conversions)
 */
export const trackPurchase = async (purchaseData) => {
  const {
    productId,
    productName,
    value,
    quantity = 1,
    transactionId,
    clientIp
  } = purchaseData;

  // Prevent duplicate tracking
  if (trackedPurchases.has(transactionId)) {
    console.warn('⚠️ Purchase already tracked:', transactionId);
    return;
  }

  const params = {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: parseFloat(value),
    currency: 'INR',
    num_items: quantity,
    transaction_id: transactionId
  };

  // Client-side tracking
  fbEvent('Purchase', params);

  // Server-side tracking for better accuracy
  try {
    await fetch('/api/track-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: 'Purchase',
        event_id: transactionId,
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: navigator.userAgent,
          fbp: getCookie('_fbp'),
          fbc: getCookie('_fbc')
        },
        custom_data: params
      })
    });

    trackedPurchases.add(transactionId);
    console.log('✅ Purchase tracked successfully:', transactionId);
  } catch (error) {
    console.error('❌ Server-side tracking error:', error);
  }
};

/**
 * Search Tracking
 */
export const trackSearch = (searchQuery) => {
  const params = {
    search_string: searchQuery,
    content_type: 'product'
  };

  fbEvent('Search', params);
};

/**
 * Custom Event Tracking
 */
export const trackCustomEvent = (eventName, params = {}) => {
  fbCustomEvent(eventName, params);
};

/**
 * Identify User (Advanced Matching)
 */
export const identifyUser = (userData) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const { email, phone, firstName, lastName, city, state, zip, country } = userData;

    // Hash sensitive data (basic example - use proper hashing in production)
    const hashedEmail = email ? hashString(email.toLowerCase()) : undefined;
    const hashedPhone = phone ? hashString(phone.toString()) : undefined;

    window.fbq('init', getPixelId(), {
      em: hashedEmail,
      ph: hashedPhone,
      fn: firstName,
      ln: lastName,
      ct: city,
      st: state,
      zp: zip,
      country: country || 'IN'
    });

    console.log('✅ User identified for advanced matching');
  }
};

/**
 * Helper: Check if purchase already tracked
 */
export const isPurchaseTracked = (transactionId) => {
  return trackedPurchases.has(transactionId);
};

/**
 * Helper: Get client IP
 */
export const getClientIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
};

/**
 * Helper: Get cookie value
 */
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

/**
 * Helper: Get stored Pixel ID
 */
const getPixelId = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('pixelId');
  }
  return null;
};

/**
 * Simple hash function (use SHA-256 in production)
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// Export default object with all functions
const tracking = {
  initFacebookPixel,
  fbEvent,
  fbCustomEvent,
  trackProductView,
  trackAddToCart,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackCustomEvent,
  identifyUser,
  isPurchaseTracked,
  getClientIp
};

export default tracking;