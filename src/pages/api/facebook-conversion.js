// pages/api/facebook-conversion.js
// Facebook Conversion API for server-side tracking

import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            event_name,
            event_time,
            user_data,
            custom_data,
            event_source_url,
            action_source
        } = req.body;

        // Get Facebook credentials from environment
        const PIXEL_ID = "1782903419326904";
        const ACCESS_TOKEN = process.env.FACEBOOK_CONVERSION_API_TOKEN;

        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.error('Missing Facebook credentials');
            return res.status(500).json({ 
                error: 'Facebook credentials not configured' 
            });
        }

        // Hash user data for privacy (SHA256)
        const hashData = (data) => {
            if (!data) return null;
            return crypto
                .createHash('sha256')
                .update(data.toLowerCase().trim())
                .digest('hex');
        };

        // Prepare hashed user data
        const hashedUserData = {
            client_ip_address: user_data.client_ip_address,
            client_user_agent: user_data.client_user_agent,
            fbc: user_data.fbc || null,
            fbp: user_data.fbp || null,
        };

        // Add hashed email and phone if available
        if (user_data.email) {
            hashedUserData.em = hashData(user_data.email);
        }
        if (user_data.phone) {
            hashedUserData.ph = hashData(user_data.phone);
        }

        // Create event ID for deduplication
        const eventId = crypto.randomBytes(16).toString('hex');

        // Prepare the event data
        const eventData = {
            data: [
                {
                    event_name: event_name,
                    event_time: event_time,
                    event_id: eventId,
                    event_source_url: event_source_url,
                    action_source: action_source || 'website',
                    user_data: hashedUserData,
                    custom_data: {
                        value: custom_data.value || null,
                        currency: custom_data.currency || 'INR',
                        content_ids: custom_data.content_ids || [],
                        content_type: custom_data.content_type || 'product',
                        contents: custom_data.contents || [],
                        num_items: custom_data.num_items || 1
                    }
                }
            ],
            test_event_code: process.env.NODE_ENV === 'development' 
                ? 'TEST12345' 
                : undefined
        };

        // Send to Facebook Conversion API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...eventData,
                    access_token: ACCESS_TOKEN
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error('Facebook API Error:', result);
            return res.status(response.status).json({ 
                error: 'Failed to send event to Facebook',
                details: result 
            });
        }

        // Log successful events
        console.log('✅ Facebook Conversion API Event:', {
            event_name,
            event_id: eventId,
            status: result.events_received || 0
        });

        return res.status(200).json({
            success: true,
            event_id: eventId,
            events_received: result.events_received,
            message: 'Event sent successfully'
        });

    } catch (error) {
        console.error('❌ Conversion API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// ============================================
// ENVIRONMENT VARIABLES (.env.local)
// ============================================

/*
FACEBOOK_PIXEL_ID=your_pixel_id_here
FACEBOOK_CONVERSION_API_TOKEN=your_access_token_here

# To get your Conversion API Access Token:
# 1. Go to Facebook Events Manager
# 2. Select your Pixel
# 3. Go to Settings > Conversions API
# 4. Generate Access Token
*/