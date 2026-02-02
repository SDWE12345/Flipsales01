// pages/api/track-purchase.js - Server-side Facebook Conversion API

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      event_name,
      event_id,
      event_time,
      user_data,
      custom_data
    } = req.body;

    // Get Pixel ID and Access Token from environment variables
    const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.error('❌ Missing Facebook credentials in environment');
      return res.status(500).json({ error: 'Missing credentials' });
    }

    // Hash email and phone for privacy
    const hashedEmail = user_data.email 
      ? crypto.createHash('sha256').update(user_data.email.toLowerCase()).digest('hex')
      : undefined;

    const hashedPhone = user_data.phone
      ? crypto.createHash('sha256').update(user_data.phone.toString()).digest('hex')
      : undefined;

    // Prepare event data for Conversion API
    const eventData = {
      event_name,
      event_time,
      event_id,
      event_source_url: req.headers.referer || 'https://yourwebsite.com',
      action_source: 'website',
      user_data: {
        em: hashedEmail,
        ph: hashedPhone,
        client_ip_address: user_data.client_ip_address,
        client_user_agent: user_data.client_user_agent,
        fbp: user_data.fbp,
        fbc: user_data.fbc
      },
      custom_data
    };

    // Send to Facebook Conversion API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventData]
        })
      }
    );

    const result = await response.json();

    if (result.events_received) {
      console.log('✅ Server-side purchase tracked:', event_id);
      return res.status(200).json({ 
        success: true, 
        events_received: result.events_received 
      });
    } else {
      console.error('❌ Facebook API error:', result);
      return res.status(500).json({ error: result });
    }

  } catch (error) {
    console.error('❌ Server-side tracking error:', error);
    return res.status(500).json({ error: error.message });
  }
}