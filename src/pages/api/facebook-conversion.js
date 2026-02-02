// pages/api/tracking/facebook-conversion.js - Optimized Facebook Conversion API
import crypto from 'crypto';
import { findOne } from '../lib/db/helpers';

// Hash user data for privacy
function hashData(data) {
  if (!data) return undefined;
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

// Validate and normalize phone number
function normalizePhone(phone) {
  if (!phone) return null;
  // Remove all non-numeric characters
  return phone.replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 0,
      message: 'Method not allowed' 
    });
  }

  const startTime = Date.now();

  try {
    const {
      event_name,
      event_id,
      event_time,
      user_data,
      custom_data,
      test_event_code
    } = req.body;

    // Validate required fields
    if (!event_name || !user_data) {
      return res.status(400).json({ 
        status: 0,
        message: 'event_name and user_data are required' 
      });
    }

    // Get Facebook Pixel settings from database
    const pixelSettings = await findOne(
      'facebookpixels',
      {},
      { sort: { _id: -1 } }
    );

    const PIXEL_ID = pixelSettings?.FacebookPixel || process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = pixelSettings?.accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
    const TEST_EVENT_CODE = test_event_code || pixelSettings?.testEventCode || process.env.FACEBOOK_TEST_EVENT_CODE;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.error('❌ Missing Facebook credentials');
      return res.status(500).json({ 
        status: 0,
        message: 'Facebook Pixel not configured',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Prepare event data
    const eventData = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_id: event_id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_source_url: user_data.event_source_url || req.headers.referer || process.env.NEXT_PUBLIC_APP_URL || 'https://yourwebsite.com',
      action_source: 'website',
      user_data: {
        em: user_data.email ? hashData(user_data.email) : undefined,
        ph: user_data.phone ? hashData(normalizePhone(user_data.phone)) : undefined,
        fn: user_data.first_name ? hashData(user_data.first_name) : undefined,
        ln: user_data.last_name ? hashData(user_data.last_name) : undefined,
        ct: user_data.city ? hashData(user_data.city) : undefined,
        st: user_data.state ? hashData(user_data.state) : undefined,
        zp: user_data.zip ? hashData(user_data.zip) : undefined,
        country: user_data.country ? hashData(user_data.country) : undefined,
        client_ip_address: user_data.client_ip_address || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
        client_user_agent: user_data.client_user_agent || req.headers['user-agent'],
        fbp: user_data.fbp, // Facebook browser ID
        fbc: user_data.fbc  // Facebook click ID
      },
      custom_data: custom_data || {}
    };

    // Remove undefined fields
    Object.keys(eventData.user_data).forEach(key => {
      if (eventData.user_data[key] === undefined) {
        delete eventData.user_data[key];
      }
    });

    // Build request payload
    const payload = {
      data: [eventData]
    };

    // Add test event code if available
    if (TEST_EVENT_CODE) {
      payload.test_event_code = TEST_EVENT_CODE;
    }

    // Send to Facebook Conversion API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    const duration = Date.now() - startTime;

    if (result.events_received) {
      console.log(`✅ Facebook event tracked: ${event_name} (${eventData.event_id})`);
      
      return res.status(200).json({ 
        status: 1,
        message: 'Event tracked successfully',
        data: {
          event_id: eventData.event_id,
          events_received: result.events_received,
          fbtrace_id: result.fbtrace_id
        },
        _meta: {
          duration: `${duration}ms`
        }
      });
    } else {
      console.error('❌ Facebook API error:', result);
      
      return res.status(500).json({ 
        status: 0,
        message: 'Failed to track event',
        error: result.error || result,
        _meta: {
          duration: `${duration}ms`
        }
      });
    }

  } catch (error) {
    console.error('❌ Facebook Conversion API error:', error);
    
    return res.status(500).json({ 
      status: 0,
      message: 'Internal server error',
      error: error.message 
    });
  }
}