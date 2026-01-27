import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaMobileAlt, FaCopy } from 'react-icons/fa';

export default function WebSMSAlternatives() {
  const [activeMethod, setActiveMethod] = useState('web-otp');
  const [otpCode, setOtpCode] = useState('');
  const [smsText, setSmsText] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [showDemo, setShowDemo] = useState(false);
  const expectedAmount = 1299;

  // Method 1: Web OTP API (Only works for OTP, not full SMS)
  const requestWebOTP = async () => {
    if ('OTPCredential' in window) {
      try {
        const ac = new AbortController();
        
        setTimeout(() => {
          ac.abort();
        }, 60000); // 60 seconds timeout

        const otp = await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        });

        if (otp && otp.code) {
          setOtpCode(otp.code);
          alert('OTP Received: ' + otp.code);
        }
      } catch (err) {
        console.log('Web OTP API error:', err);
        alert('Web OTP API not supported or permission denied');
      }
    } else {
      alert('Web OTP API not supported in this browser');
    }
  };

  // Method 2: Manual SMS Paste
  const handleSMSPaste = (text) => {
    setSmsText(text);
    
    // Extract amount from SMS
    const patterns = [
      /(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /Amount\s*:?\s*(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /debited\s*(?:by\s*)?(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    ];

    let foundAmount = null;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        foundAmount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    if (foundAmount) {
      const diff = Math.abs(foundAmount - expectedAmount);
      if (diff <= 5) {
        setVerificationStatus('success');
        setTimeout(() => {
          alert('✅ Payment Verified! Amount: ₹' + foundAmount);
        }, 500);
      } else {
        setVerificationStatus('failed');
        alert(`❌ Amount mismatch! Expected: ₹${expectedAmount}, Found: ₹${foundAmount}`);
      }
    } else {
      setVerificationStatus('pending');
      alert('⚠️ Could not find amount in SMS. Please check the message.');
    }
  };

  // Method 3: UTR/Transaction ID
  const handleUTRInput = (utr) => {
    if (utr.length >= 12) {
      // Simulate verification
      setTimeout(() => {
        setVerificationStatus('success');
        alert('✅ Payment verified via UTR: ' + utr);
      }, 1000);
    }
  };

  const demoSMS = `Dear Customer, Rs.1,299.00 debited from A/c XX1234 on 25-Jan-26 by UPI/GooglePay/9876543210. UTR: 402512345678. Not you? Call 1800-xxx-xxxx`;

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '30px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <FaMobileAlt style={{ fontSize: '48px', marginBottom: '16px' }} />
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700' }}>
          Web SMS Reading Methods
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          ⚠️ Browsers CANNOT read SMS directly. Here are working alternatives:
        </p>
      </div>

      {/* Method Selector */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '30px'
      }}>
        {[
          { id: 'web-otp', name: 'Web OTP API', desc: 'Auto-read OTP only' },
          { id: 'manual-paste', name: 'Manual Paste', desc: 'User pastes SMS' },
          { id: 'utr-input', name: 'UTR Number', desc: 'Enter transaction ID' }
        ].map(method => (
          <button
            key={method.id}
            onClick={() => {
              setActiveMethod(method.id);
              setVerificationStatus('pending');
              setSmsText('');
              setOtpCode('');
            }}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: activeMethod === method.id ? '3px solid #667eea' : '2px solid #e0e0e0',
              background: activeMethod === method.id ? '#f0f4ff' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'left'
            }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              color: '#212121',
              marginBottom: '4px'
            }}>
              {method.name}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {method.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Demo Section */}
      <div style={{
        background: '#fff3e0',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid #ffb74d'
      }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#e65100',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📱 Sample Bank SMS
          <button
            onClick={() => {
              navigator.clipboard.writeText(demoSMS);
              alert('✅ SMS copied! Now paste it below.');
            }}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              background: '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaCopy /> Copy SMS
          </button>
        </div>
        <div style={{
          background: '#fff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#333',
          fontFamily: 'monospace',
          lineHeight: '1.6'
        }}>
          {demoSMS}
        </div>
      </div>

      {/* Active Method Content */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        minHeight: '300px'
      }}>
        {/* Method 1: Web OTP API */}
        {activeMethod === 'web-otp' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#212121', fontSize: '18px' }}>
              Web OTP API (Browser Feature)
            </h3>
            <div style={{
              background: '#e3f2fd',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#1565c0'
            }}>
              ℹ️ This only works for OTP codes, not full SMS messages. Supported in Chrome Android.
            </div>
            
            <button
              onClick={requestWebOTP}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              Request OTP Auto-Fill
            </button>

            {otpCode && (
              <div style={{
                background: '#e8f5e9',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', color: '#2e7d32', marginBottom: '8px' }}>
                  OTP Received:
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1b5e20', letterSpacing: '8px' }}>
                  {otpCode}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
              <strong>How it works:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>Only works on Chrome Android</li>
                <li>SMS must contain: "Your OTP is 123456"</li>
                <li>SMS must come from your domain (@yoursite.com)</li>
                <li>Cannot read full bank SMS</li>
              </ul>
            </div>
          </div>
        )}

        {/* Method 2: Manual Paste */}
        {activeMethod === 'manual-paste' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#212121', fontSize: '18px' }}>
              Manual SMS Paste (Most Reliable)
            </h3>
            <div style={{
              background: '#e8f5e9',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#2e7d32'
            }}>
              ✅ Works on ALL devices and browsers. User pastes their payment SMS.
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#212121',
                marginBottom: '8px'
              }}>
                Paste your payment SMS below:
              </label>
              <textarea
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Example: Dear Customer, Rs.1,299.00 debited from A/c XX1234..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={() => handleSMSPaste(smsText)}
              disabled={!smsText}
              style={{
                width: '100%',
                padding: '16px',
                background: smsText ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: smsText ? 'pointer' : 'not-allowed'
              }}
            >
              Verify Payment
            </button>

            {verificationStatus === 'success' && (
              <div style={{
                marginTop: '16px',
                background: '#e8f5e9',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#2e7d32'
              }}>
                <FaCheckCircle style={{ fontSize: '32px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>
                    Payment Verified!
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    Amount: ₹{expectedAmount} matched successfully
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div style={{
                marginTop: '16px',
                background: '#ffebee',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#c62828'
              }}>
                <FaTimesCircle style={{ fontSize: '32px' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>
                    Verification Failed
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    Amount does not match
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Method 3: UTR Input */}
        {activeMethod === 'utr-input' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#212121', fontSize: '18px' }}>
              UTR/Transaction ID Input
            </h3>
            <div style={{
              background: '#fff3e0',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#e65100'
            }}>
              💡 User enters the UPI transaction reference number from their SMS
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#212121',
                marginBottom: '8px'
              }}>
                Enter UTR/Transaction ID:
              </label>
              <input
                type="text"
                placeholder="e.g., 402512345678"
                onChange={(e) => handleUTRInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}
              />
            </div>

            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
              <strong>Where to find UTR:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>Check your payment SMS from bank</li>
                <li>Look for "UTR:", "Ref No:", or "Transaction ID:"</li>
                <li>Usually 12-16 digit alphanumeric code</li>
                <li>Example: UTR: 402512345678</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Important Note */}
      <div style={{
        marginTop: '30px',
        background: '#ffebee',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #ef5350'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#c62828', fontSize: '16px' }}>
          ⚠️ Why Web Browsers Can't Read SMS:
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          fontSize: '13px', 
          color: '#666',
          lineHeight: '1.8'
        }}>
          <li><strong>Security:</strong> SMS contains sensitive financial data</li>
          <li><strong>Privacy:</strong> Websites can't access phone features directly</li>
          <li><strong>Browser Limitation:</strong> No API exists for full SMS reading</li>
          <li><strong>Alternative:</strong> Use payment gateways (Razorpay, PayU) that handle this</li>
        </ul>
      </div>

      {/* Recommended Solution */}
      <div style={{
        marginTop: '20px',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #66bb6a'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#2e7d32', fontSize: '16px' }}>
          ✅ Recommended Production Solution:
        </h4>
        <div style={{ fontSize: '13px', color: '#1b5e20', lineHeight: '1.8' }}>
          <strong>Use Payment Gateway APIs:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Razorpay, PayU, Paytm, PhonePe - they auto-verify payments</li>
            <li>No SMS reading needed - instant confirmation</li>
            <li>More secure and reliable</li>
            <li>Professional checkout experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}