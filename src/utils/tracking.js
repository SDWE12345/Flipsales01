// utils/tracking.js
// Comprehensive tracking utilities for e-commerce

/**
 * Track Product View
 * Call this when user views a product
 */
export const trackProductView = (product) => {
    if (!product) return;

    const eventData = {
        content_name: product.title || product.Title,
        content_ids: [product.id],
        content_type: 'product',
        content_category: product.category || '',
        value: parseFloat(product.price || product.selling_price) || 0,
        currency: 'INR'
    };

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'ViewContent', eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'view_item', {
            items: [{
                item_id: product.id,
                item_name: product.title || product.Title,
                price: eventData.value,
                currency: 'INR'
            }]
        });
    }

    console.log('📊 Product View Tracked:', eventData);
};

/**
 * Track Add to Cart
 * Call this when user adds item to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
    if (!product) return;

    const eventData = {
        content_name: product.title || product.Title,
        content_ids: [product.id],
        content_type: 'product',
        value: parseFloat(product.price || product.selling_price) * quantity || 0,
        currency: 'INR',
        num_items: quantity
    };

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'AddToCart', eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'add_to_cart', {
            items: [{
                item_id: product.id,
                item_name: product.title || product.Title,
                price: parseFloat(product.price || product.selling_price) || 0,
                quantity: quantity,
                currency: 'INR'
            }]
        });
    }

    // Server-side tracking
    if (window.sendServerEvent) {
        window.sendServerEvent('AddToCart', eventData);
    }

    console.log('🛒 Add to Cart Tracked:', eventData);
};

/**
 * Track Initiate Checkout
 * Call this when user starts checkout process
 */
export const trackInitiateCheckout = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return;

    const totalValue = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || item.selling_price) || 0);
    }, 0);

    const eventData = {
        content_ids: cartItems.map(item => item.id),
        contents: cartItems.map(item => ({
            id: item.id,
            quantity: 1
        })),
        value: totalValue,
        currency: 'INR',
        num_items: cartItems.length
    };

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
            items: cartItems.map(item => ({
                item_id: item.id,
                item_name: item.title || item.Title,
                price: parseFloat(item.price || item.selling_price) || 0,
                quantity: 1,
                currency: 'INR'
            })),
            value: totalValue,
            currency: 'INR'
        });
    }

    // Server-side tracking
    if (window.sendServerEvent) {
        window.sendServerEvent('InitiateCheckout', eventData);
    }

    console.log('💳 Initiate Checkout Tracked:', eventData);
};

/**
 * Track Add Payment Info
 * Call this when user enters payment information
 */
export const trackAddPaymentInfo = (product, paymentMethod = 'UPI') => {
    if (!product) return;

    const eventData = {
        content_ids: [product.id],
        value: parseFloat(product.price || product.selling_price) || 0,
        currency: 'INR',
        payment_method: paymentMethod
    };

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'AddPaymentInfo', eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'add_payment_info', {
            items: [{
                item_id: product.id,
                item_name: product.title || product.Title,
                price: eventData.value,
                currency: 'INR'
            }],
            payment_type: paymentMethod
        });
    }

    console.log('💰 Add Payment Info Tracked:', eventData);
};

/**
 * Track Purchase
 * CRITICAL: Call this ONLY when payment is confirmed
 */
export const trackPurchase = async (orderData) => {
    if (!orderData) return;

    const transactionId = orderData.transactionId || 
                         orderData.orderId || 
                         `ORDER_${Date.now()}`;

    const eventData = {
        content_ids: [orderData.productId],
        content_type: 'product',
        value: parseFloat(orderData.value) || 0,
        currency: 'INR',
        transaction_id: transactionId,
        num_items: orderData.quantity || 1
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
            items: [{
                item_id: orderData.productId,
                item_name: orderData.productName || 'Product',
                price: eventData.value,
                quantity: orderData.quantity || 1,
                currency: 'INR'
            }]
        });
    }

    // Server-side tracking (CRITICAL for accurate attribution)
    if (window.sendServerEvent) {
        await window.sendServerEvent('Purchase', {
            ...eventData,
            client_ip: orderData.clientIp
        });
    }

    // Save to prevent duplicate tracking
    sessionStorage.setItem(`purchase_tracked_${transactionId}`, 'true');

    console.log('✅ Purchase Tracked:', eventData);
    return transactionId;
};

/**
 * Track Search
 * Call this when user searches for products
 */
export const trackSearch = (searchQuery) => {
    if (!searchQuery) return;

    const eventData = {
        search_string: searchQuery
    };

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'Search', eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', 'search', {
            search_term: searchQuery
        });
    }

    console.log('🔍 Search Tracked:', searchQuery);
};

/**
 * Track Custom Event
 * Use for any custom tracking needs
 */
export const trackCustomEvent = (eventName, eventData = {}) => {
    // Facebook Pixel
    if (window.fbq) {
        window.fbq('trackCustom', eventName, eventData);
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', eventName.toLowerCase().replace(/\s+/g, '_'), eventData);
    }

    console.log(`📊 Custom Event: ${eventName}`, eventData);
};

/**
 * Track Page View
 * Automatically called on route changes
 */
export const trackPageView = (url) => {
    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }

    // Google Analytics
    if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
            page_path: url
        });
    }

    console.log('📄 PageView Tracked:', url);
};

/**
 * Enhanced User Identification
 * Call this when user provides contact info
 */
export const identifyUser = (userData) => {
    if (!userData) return;

    const userId = userData.id || userData.phone || userData.email;

    // Facebook Pixel - Advanced Matching
    if (window.fbq && userId) {
        window.fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, {
            em: userData.email || null,
            ph: userData.phone || null,
            external_id: userId,
            fn: userData.name?.split(' ')[0] || null,
            ln: userData.name?.split(' ').slice(1).join(' ') || null,
            ct: userData.city || null,
            st: userData.state || null,
            zp: userData.pincode || null,
            country: 'in'
        });
    }

    // Google Analytics
    if (window.gtag && userId) {
        window.gtag('set', 'user_properties', {
            user_id: userId
        });
    }

    console.log('👤 User Identified:', userId);
};

/**
 * Get Client IP (for server-side tracking)
 */
export const getClientIp = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Failed to get client IP:', error);
        return null;
    }
};

/**
 * Check if purchase already tracked (prevent duplicates)
 */
export const isPurchaseTracked = (transactionId) => {
    return sessionStorage.getItem(`purchase_tracked_${transactionId}`) === 'true';
};

/**
 * Comprehensive tracking object for easy import
 */
const tracking = {
    trackProductView,
    trackAddToCart,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackSearch,
    trackCustomEvent,
    trackPageView,
    identifyUser,
    getClientIp,
    isPurchaseTracked
};

export default tracking;