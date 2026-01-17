// utils/tracking.js
// Comprehensive tracking utilities for e-commerce with enhanced product page tracking

let isInitialized = false;
let trackingQueue = [];

/**
 * Initialize tracking (call this once on app load)
 */
export const initializeTracking = () => {
  if (isInitialized) return;
  
  if (typeof window === 'undefined') return;
  
  // Wait for fbq to be available
  const waitForFbq = setInterval(() => {
    if (window.fbq) {
      clearInterval(waitForFbq);
      console.log('✅ Facebook Pixel Ready');
    }
  }, 100);
  
  // Wait for gtag to be available
  const waitForGtag = setInterval(() => {
    if (window.gtag) {
      clearInterval(waitForGtag);
      console.log('✅ Google Analytics Ready');
    }
  }, 100);
  
  isInitialized = true;
  
  // Process queued events after 1 second to ensure scripts are loaded
  setTimeout(() => {
    if (trackingQueue.length > 0) {
      console.log('📦 Processing queued events:', trackingQueue.length);
      trackingQueue.forEach(({ fn, args }) => fn(...args));
      trackingQueue = [];
    }
  }, 1000);
  
  console.log('📊 Tracking initialized');
};

/**
 * Queue tracking event if not initialized
 */
const queueOrExecute = (fn, args) => {
  if (!isInitialized) {
    trackingQueue.push({ fn, args });
  } else {
    fn(...args);
  }
};

/**
 * Track Product View - Enhanced version
 * Call this when user views a product page
 */
export const trackProductView = (product, additionalData = {}) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  const productTitle = product.title || product.Title || product.name;
  const productPrice = parseFloat(product.price || product.selling_price || product.mrp || 0);
  const productCategory = product.category || product.Category || '';
  const productBrand = product.brand || product.Brand || '';
  const productSku = product.sku || product.SKU || productId;

  const eventData = {
    content_name: productTitle,
    content_ids: [productId],
    content_type: 'product',
    content_category: productCategory,
    value: productPrice,
    currency: 'INR',
    // Enhanced data
    brand: productBrand,
    sku: productSku,
    availability: product.inStock !== false ? 'in stock' : 'out of stock',
    ...additionalData
  };

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', eventData);
  }

  // Google Analytics 4 - Enhanced with item details
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      items: [{
        item_id: productId,
        item_name: productTitle,
        item_brand: productBrand,
        item_category: productCategory,
        price: productPrice,
        currency: 'INR',
        item_variant: product.variant || product.size || product.color || null,
        index: 0,
        quantity: 1
      }],
      value: productPrice,
      currency: 'INR'
    });
  }

  // DataLayer push for GTM
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: productId,
          item_name: productTitle,
          item_brand: productBrand,
          item_category: productCategory,
          price: productPrice,
          currency: 'INR'
        }]
      }
    });
  }

  console.log('📊 Product View Tracked:', eventData);
  return eventData;
};

/**
 * Track Product Impression (for product listings)
 * Call this when products are displayed in a list
 */
export const trackProductImpression = (products, listName = 'Product List') => {
  if (!products || products.length === 0 || typeof window === 'undefined') return;

  const items = products.map((product, index) => ({
    item_id: product._id || product.id || product.productId,
    item_name: product.title || product.Title || product.name,
    item_brand: product.brand || product.Brand || '',
    item_category: product.category || product.Category || '',
    price: parseFloat(product.price || product.selling_price || product.mrp || 0),
    currency: 'INR',
    index: index,
    item_list_name: listName
  }));

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'view_item_list', {
      items: items,
      item_list_name: listName
    });
  }

  // DataLayer push
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item_list',
      ecommerce: {
        items: items
      }
    });
  }

  console.log('👁️ Product Impressions Tracked:', items.length, 'products');
  return items;
};

/**
 * Track Product Click (from listing to product page)
 */
export const trackProductClick = (product, listName = 'Product List', position = 0) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  const productTitle = product.title || product.Title || product.name;
  const productPrice = parseFloat(product.price || product.selling_price || product.mrp || 0);

  const eventData = {
    items: [{
      item_id: productId,
      item_name: productTitle,
      item_brand: product.brand || product.Brand || '',
      item_category: product.category || product.Category || '',
      price: productPrice,
      currency: 'INR',
      index: position,
      item_list_name: listName
    }]
  };

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'select_item', eventData);
  }

  // DataLayer push
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'select_item',
      ecommerce: eventData
    });
  }

  console.log('🖱️ Product Click Tracked:', productTitle);
  return eventData;
};

/**
 * Track Product Detail View with scroll depth
 */
export const trackProductDetailEngagement = (product, engagementData = {}) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  
  const eventData = {
    product_id: productId,
    scroll_depth: engagementData.scrollDepth || 0,
    time_on_page: engagementData.timeOnPage || 0,
    images_viewed: engagementData.imagesViewed || 0,
    tab_switched: engagementData.tabSwitched || false,
    ...engagementData
  };

  // Custom event for engagement
  if (window.fbq) {
    window.fbq('trackCustom', 'ProductEngagement', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'product_engagement', eventData);
  }

  console.log('📈 Product Engagement Tracked:', eventData);
  return eventData;
};

/**
 * Track Image Gallery Interaction
 */
export const trackImageGalleryView = (product, imageIndex, totalImages) => {
  if (!product || typeof window === 'undefined') return;

  const eventData = {
    product_id: product._id || product.id || product.productId,
    product_name: product.title || product.Title || product.name,
    image_index: imageIndex,
    total_images: totalImages,
    percentage_viewed: ((imageIndex + 1) / totalImages * 100).toFixed(0)
  };

  if (window.gtag) {
    window.gtag('event', 'image_gallery_interaction', eventData);
  }

  console.log('🖼️ Image Gallery Interaction:', imageIndex + 1, '/', totalImages);
  return eventData;
};

/**
 * Track Variant Selection (color, size, etc.)
 */
export const trackVariantSelection = (product, variantType, variantValue) => {
  if (!product || typeof window === 'undefined') return;

  const eventData = {
    product_id: product._id || product.id || product.productId,
    product_name: product.title || product.Title || product.name,
    variant_type: variantType, // 'color', 'size', etc.
    variant_value: variantValue
  };

  if (window.fbq) {
    window.fbq('trackCustom', 'VariantSelection', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'select_variant', eventData);
  }

  console.log('🎨 Variant Selected:', variantType, '=', variantValue);
  return eventData;
};

/**
 * Track Add to Wishlist
 */
export const trackAddToWishlist = (product) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  const productTitle = product.title || product.Title || product.name;
  const productPrice = parseFloat(product.price || product.selling_price || product.mrp || 0);

  const eventData = {
    content_name: productTitle,
    content_ids: [productId],
    content_type: 'product',
    value: productPrice,
    currency: 'INR'
  };

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToWishlist', eventData);
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'add_to_wishlist', {
      items: [{
        item_id: productId,
        item_name: productTitle,
        price: productPrice,
        currency: 'INR'
      }],
      value: productPrice,
      currency: 'INR'
    });
  }

  console.log('❤️ Add to Wishlist Tracked:', productTitle);
  return eventData;
};

/**
 * Track Add to Cart - Enhanced
 */
export const trackAddToCart = (product, quantity = 1, additionalData = {}) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  const productTitle = product.title || product.Title || product.name;
  const productPrice = parseFloat(product.price || product.selling_price || product.mrp || 0);
  const productBrand = product.brand || product.Brand || '';
  const productCategory = product.category || product.Category || '';

  const eventData = {
    content_name: productTitle,
    content_ids: [productId],
    content_type: 'product',
    value: productPrice * quantity,
    currency: 'INR',
    num_items: quantity,
    ...additionalData
  };

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', eventData);
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      items: [{
        item_id: productId,
        item_name: productTitle,
        item_brand: productBrand,
        item_category: productCategory,
        price: productPrice,
        quantity: quantity,
        currency: 'INR'
      }],
      value: eventData.value,
      currency: 'INR'
    });
  }

  // DataLayer push
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        items: [{
          item_id: productId,
          item_name: productTitle,
          item_brand: productBrand,
          item_category: productCategory,
          price: productPrice,
          quantity: quantity
        }]
      }
    });
  }

  console.log('🛒 Add to Cart Tracked:', eventData);
  return eventData;
};

/**
 * Track Remove from Cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!product || typeof window === 'undefined') return;

  const productId = product._id || product.id || product.productId;
  const productTitle = product.title || product.Title || product.name;
  const productPrice = parseFloat(product.price || product.selling_price || product.mrp || 0);

  const eventData = {
    content_ids: [productId],
    content_type: 'product',
    value: productPrice * quantity,
    currency: 'INR',
    num_items: quantity
  };

  if (window.fbq) {
    window.fbq('trackCustom', 'RemoveFromCart', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      items: [{
        item_id: productId,
        item_name: productTitle,
        price: productPrice,
        quantity: quantity,
        currency: 'INR'
      }],
      value: eventData.value,
      currency: 'INR'
    });
  }

  console.log('🗑️ Remove from Cart Tracked:', eventData);
  return eventData;
};

/**
 * Track Share Product
 */
export const trackShareProduct = (product, method = 'unknown') => {
  if (!product || typeof window === 'undefined') return;

  const eventData = {
    content_type: 'product',
    item_id: product._id || product.id || product.productId,
    method: method // 'whatsapp', 'facebook', 'twitter', 'copy_link', etc.
  };

  if (window.gtag) {
    window.gtag('event', 'share', eventData);
  }

  console.log('📤 Product Share Tracked:', method);
  return eventData;
};

/**
 * Track Review/Rating Interaction
 */
export const trackReviewInteraction = (product, action, rating = null) => {
  if (!product || typeof window === 'undefined') return;

  const eventData = {
    product_id: product._id || product.id || product.productId,
    product_name: product.title || product.Title || product.name,
    action: action, // 'view_reviews', 'write_review', 'submit_review'
    rating: rating
  };

  if (window.gtag) {
    window.gtag('event', 'review_interaction', eventData);
  }

  console.log('⭐ Review Interaction Tracked:', action);
  return eventData;
};

/**
 * Track Initiate Checkout
 */
export const trackInitiateCheckout = (cartItems) => {
  if (!cartItems || cartItems.length === 0 || typeof window === 'undefined') return;

  const totalValue = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price || item.selling_price || item.mrp || 0) * (item.quantity || 1));
  }, 0);

  const eventData = {
    content_ids: cartItems.map(item => item._id || item.id || item.productId),
    contents: cartItems.map(item => ({
      id: item._id || item.id || item.productId,
      quantity: item.quantity || 1
    })),
    value: totalValue,
    currency: 'INR',
    num_items: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  };

  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      items: cartItems.map(item => ({
        item_id: item._id || item.id || item.productId,
        item_name: item.title || item.Title || item.name,
        price: parseFloat(item.price || item.selling_price || item.mrp || 0),
        quantity: item.quantity || 1,
        currency: 'INR'
      })),
      value: totalValue,
      currency: 'INR'
    });
  }

  console.log('💳 Initiate Checkout Tracked:', eventData);
  return eventData;
};

/**
 * Track Add Payment Info
 */
export const trackAddPaymentInfo = (product, paymentMethod = 'UPI', value) => {
  if (typeof window === 'undefined') return;

  const eventData = {
    content_ids: product ? [product._id || product.id || product.productId] : [],
    value: value || (product ? parseFloat(product.price || product.selling_price || product.mrp || 0) : 0),
    currency: 'INR',
    payment_method: paymentMethod
  };

  if (window.fbq) {
    window.fbq('track', 'AddPaymentInfo', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'add_payment_info', {
      items: product ? [{
        item_id: product._id || product.id || product.productId,
        item_name: product.title || product.Title || product.name,
        price: parseFloat(product.price || product.selling_price || product.mrp || 0),
        currency: 'INR'
      }] : [],
      payment_type: paymentMethod,
      value: eventData.value,
      currency: 'INR'
    });
  }

  console.log('💰 Add Payment Info Tracked:', eventData);
  return eventData;
};

/**
 * Track Purchase - Enhanced with deduplication
 */
export const trackPurchase = (orderData) => {
  if (!orderData || typeof window === 'undefined') return;

  const transactionId = orderData.transactionId || 
                       orderData.orderId || 
                       `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Check for duplicate
  if (isPurchaseTracked(transactionId)) {
    console.log('⚠️ Purchase already tracked:', transactionId);
    return transactionId;
  }

  const eventData = {
    content_ids: orderData.items ? orderData.items.map(item => item._id || item.id || item.productId) : [orderData.productId],
    content_type: 'product',
    value: parseFloat(orderData.value) || 0,
    currency: 'INR',
    transaction_id: transactionId,
    num_items: orderData.quantity || (orderData.items ? orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1)
  };

  // Facebook Pixel with event ID for deduplication
  if (window.fbq) {
    window.fbq('track', 'Purchase', eventData, {
      eventID: transactionId
    });
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: eventData.value,
      currency: 'INR',
      items: orderData.items ? orderData.items.map(item => ({
        item_id: item._id || item.id || item.productId,
        item_name: item.title || item.Title || item.name,
        price: parseFloat(item.price || item.selling_price || item.mrp || 0),
        quantity: item.quantity || 1,
        currency: 'INR'
      })) : [{
        item_id: orderData.productId,
        item_name: orderData.productName || 'Product',
        price: eventData.value,
        quantity: orderData.quantity || 1,
        currency: 'INR'
      }]
    });
  }

  // Save to prevent duplicate tracking
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(`purchase_tracked_${transactionId}`, 'true');
  }

  console.log('✅ Purchase Tracked:', eventData);
  return transactionId;
};

/**
 * Track Search
 */
export const trackSearch = (searchQuery) => {
  if (!searchQuery || typeof window === 'undefined') return;

  const eventData = {
    search_string: searchQuery
  };

  if (window.fbq) {
    window.fbq('track', 'Search', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchQuery
    });
  }

  console.log('🔍 Search Tracked:', searchQuery);
  return eventData;
};

/**
 * Track Custom Event
 */
export const trackCustomEvent = (eventName, eventData = {}) => {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    window.fbq('trackCustom', eventName, eventData);
  }

  if (window.gtag) {
    window.gtag('event', eventName.toLowerCase().replace(/\s+/g, '_'), eventData);
  }

  console.log(`📊 Custom Event: ${eventName}`, eventData);
  return eventData;
};

/**
 * Track Page View
 */
export const trackPageView = (url) => {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  if (window.gtag && url) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }

  console.log('📄 PageView Tracked:', url);
};

/**
 * Enhanced User Identification
 */
export const identifyUser = (userData) => {
  if (!userData || typeof window === 'undefined') return;

  const userId = userData.id || userData.userId || userData.phone || userData.email;

  // Facebook Pixel - Advanced Matching
  if (window.fbq && userId) {
    console.log('👤 User Identified for Advanced Matching:', {
      em: userData.email || null,
      ph: userData.phone || null,
      external_id: userId,
      fn: userData.name?.split(' ')[0] || null,
      ln: userData.name?.split(' ').slice(1).join(' ') || null,
    });
  }

  if (window.gtag && userId) {
    window.gtag('set', 'user_properties', {
      user_id: userId
    });
  }

  console.log('👤 User Identified:', userId);
  return userId;
};

/**
 * Track Lead Generation
 */
export const trackLead = (leadData) => {
  if (typeof window === 'undefined') return;

  const eventData = {
    value: leadData.value || 0,
    currency: 'INR',
    ...leadData
  };

  if (window.fbq) {
    window.fbq('track', 'Lead', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'generate_lead', eventData);
  }

  console.log('📞 Lead Tracked:', eventData);
  return eventData;
};

/**
 * Track Contact
 */
export const trackContact = (contactData) => {
  if (typeof window === 'undefined') return;

  const eventData = {
    method: contactData.method || 'web',
    ...contactData
  };

  if (window.fbq) {
    window.fbq('track', 'Contact', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'contact', eventData);
  }

  console.log('📞 Contact Tracked:', eventData);
  return eventData;
};

/**
 * Complete Registration
 */
export const trackCompleteRegistration = (registrationData) => {
  if (typeof window === 'undefined') return;

  const eventData = {
    status: registrationData.status || 'completed',
    ...registrationData
  };

  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', eventData);
  }

  if (window.gtag) {
    window.gtag('event', 'sign_up', eventData);
  }

  console.log('✅ Registration Completed:', eventData);
  return eventData;
};

/**
 * Check if purchase already tracked (prevent duplicates)
 */
export const isPurchaseTracked = (transactionId) => {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(`purchase_tracked_${transactionId}`) === 'true';
};

/**
 * Comprehensive tracking object for easy import
 */
const tracking = {
  initializeTracking,
  trackProductView,
  trackProductImpression,
  trackProductClick,
  trackProductDetailEngagement,
  trackImageGalleryView,
  trackVariantSelection,
  trackAddToWishlist,
  trackAddToCart,
  trackRemoveFromCart,
  trackShareProduct,
  trackReviewInteraction,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackCustomEvent,
  trackPageView,
  identifyUser,
  trackLead,
  trackContact,
  trackCompleteRegistration,
  isPurchaseTracked
};

export default tracking;