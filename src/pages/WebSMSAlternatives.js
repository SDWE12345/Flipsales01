import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaMobileAlt, FaCopy, FaExclamationTriangle } from 'react-icons/fa';

export default function WebSMSAlternatives() {
  const [smsText, setSmsText] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [permissionStatus, setPermissionStatus] = useState('not-requested');
  const [attempts, setAttempts] = useState([]);
  const [expectedAmount, setExpectedAmount] = useState(1299);
  
  const addAttempt = (method, success, message) => {
    setAttempts(prev => [...prev, { method, success, message, time: new Date().toLocaleTimeString() }]);
  };

  // Method 1: Web OTP API
  const tryWebOTP = async () => {
    addAttempt('Web OTP API', false, 'Starting...');
    
    if ('OTPCredential' in window) {
      try {
        const ac = new AbortController();
        setTimeout(() => ac.abort(), 60000);

        const otp = await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        });

        if (otp && otp.code) {
          addAttempt('Web OTP API', true, `✅ OTP Received: ${otp.code}`);
          setSmsText(`OTP Code: ${otp.code}`);
          return true;
        }
      } catch (err) {
        addAttempt('Web OTP API', false, `❌ Error: ${err.message}`);
      }
    } else {
      addAttempt('Web OTP API', false, '❌ Not supported in this browser');
    }
    return false;
  };

  // Method 2: Navigator Permissions API
  const tryPermissionsAPI = async () => {
    addAttempt('Permissions API', false, 'Checking permissions...');
    
    if ('permissions' in navigator) {
      try {
        // Try to query SMS permission
        const result = await navigator.permissions.query({ name: 'sms' });
        addAttempt('Permissions API', true, `Permission state: ${result.state}`);
        setPermissionStatus(result.state);
        
        result.onchange = () => {
          setPermissionStatus(result.state);
          addAttempt('Permissions API', true, `Permission changed to: ${result.state}`);
        };
        
        return result.state === 'granted';
      } catch (err) {
        addAttempt('Permissions API', false, `❌ SMS permission not available: ${err.message}`);
      }
    } else {
      addAttempt('Permissions API', false, '❌ Permissions API not supported');
    }
    return false;
  };

  // Method 3: Try to access SMS via deprecated APIs
  const tryDeprecatedAPIs = async () => {
    addAttempt('Deprecated APIs', false, 'Checking old APIs...');
    
    // Check if any old SMS APIs exist
    const checks = [
      { api: 'navigator.mozSms', name: 'Mozilla SMS' },
      { api: 'navigator.sms', name: 'Navigator SMS' },
      { api: 'window.SMS', name: 'Window SMS' },
      { api: 'navigator.messaging', name: 'Navigator Messaging' }
    ];
    
    checks.forEach(check => {
      try {
        if (eval(check.api)) {
          addAttempt('Deprecated APIs', true, `✅ Found: ${check.name}`);
        } else {
          addAttempt('Deprecated APIs', false, `❌ Not found: ${check.name}`);
        }
      } catch (err) {
        addAttempt('Deprecated APIs', false, `❌ ${check.name}: Not available`);
      }
    });
  };

  // Method 4: Web Share Target API (for receiving SMS)
  const tryWebShareTarget = async () => {
    addAttempt('Web Share Target', false, 'Checking...');
    
    if ('share' in navigator) {
      addAttempt('Web Share Target', true, '✅ Web Share API available (but cannot READ SMS)');
      
      // You can only SHARE, not READ
      try {
        await navigator.share({
          title: 'Share SMS to this app',
          text: 'Please manually share your payment SMS'
        });
      } catch (err) {
        addAttempt('Web Share Target', false, `❌ ${err.message}`);
      }
    } else {
      addAttempt('Web Share Target', false, '❌ Not supported');
    }
  };

  // Method 5: Clipboard API (User must manually copy SMS)
  const tryClipboard = async () => {
    addAttempt('Clipboard API', false, 'Checking clipboard...');
    
    if ('clipboard' in navigator) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          addAttempt('Clipboard API', true, `✅ Clipboard read: ${text.substring(0, 50)}...`);
          setSmsText(text);
          handleSMSPaste(text);
          return true;
        }
      } catch (err) {
        addAttempt('Clipboard API', false, `❌ Permission denied or clipboard empty`);
      }
    } else {
      addAttempt('Clipboard API', false, '❌ Clipboard API not supported');
    }
    return false;
  };

  // Method 6: File System Access API
  const tryFileSystem = async () => {
    addAttempt('File System API', false, 'Checking...');
    
    if ('showOpenFilePicker' in window) {
      try {
        addAttempt('File System API', true, '✅ Available (user must select SMS export file)');
      } catch (err) {
        addAttempt('File System API', false, `❌ ${err.message}`);
      }
    } else {
      addAttempt('File System API', false, '❌ Not supported');
    }
  };

  // Try ALL methods at once
  const tryAllMethods = async () => {
    setAttempts([]);
    addAttempt('System', true, '🔄 Starting all permission attempts...');
    
    await tryWebOTP();
    await tryPermissionsAPI();
    await tryDeprecatedAPIs();
    await tryWebShareTarget();
    await tryClipboard();
    await tryFileSystem();
    
    addAttempt('System', true, '✅ All methods attempted. Check results above.');
  };

  // SMS verification logic
  const handleSMSPaste = (text) => {
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
        addAttempt('Verification', true, `✅ Payment verified! Amount: ₹${foundAmount}`);
      } else {
        setVerificationStatus('failed');
        addAttempt('Verification', false, `❌ Amount mismatch! Expected: ₹${expectedAmount}, Found: ₹${foundAmount}`);
      }
    } else {
      addAttempt('Verification', false, '❌ Could not extract amount from text');
    }
  };

  const demoSMS = `Dear Customer, Rs.${expectedAmount}.00 debited from A/c XX1234 on 25-Jan-26 by UPI/GooglePay/9876543210. UTR: 402512345678.`;

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '20px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <FaExclamationTriangle style={{ fontSize: '48px', marginBottom: '16px' }} />
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700' }}>
          SMS Permission Testing
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          ⚠️ This will attempt EVERY possible method to access SMS (all will fail in browsers)
        </p>
      </div>

      {/* Control Panel */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '13px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#212121'
          }}>
            Expected Payment Amount:
          </label>
          <input
            type="number"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          />
        </div>

        <button
          onClick={tryAllMethods}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          🔍 Try ALL Permission Methods
        </button>

        <button
          onClick={tryClipboard}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📋 Read from Clipboard (Copy SMS first)
        </button>
      </div>

      {/* Demo SMS */}
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
          📱 Test SMS (Copy this)
          <button
            onClick={() => {
              navigator.clipboard.writeText(demoSMS);
              addAttempt('Copy', true, '✅ SMS copied to clipboard');
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
            <FaCopy /> Copy
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

      {/* Manual Input */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '16px', color: '#212121' }}>
          Manual SMS Input (Only Working Method)
        </h3>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="Paste your payment SMS here..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            resize: 'vertical',
            marginBottom: '12px'
          }}
        />
        <button
          onClick={() => handleSMSPaste(smsText)}
          disabled={!smsText}
          style={{
            width: '100%',
            padding: '14px',
            background: smsText ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
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
              <div style={{ fontWeight: '700', fontSize: '16px' }}>✅ Payment Verified!</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Amount matched successfully</div>
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
              <div style={{ fontWeight: '700', fontSize: '16px' }}>❌ Verification Failed</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Amount does not match</div>
            </div>
          </div>
        )}
      </div>

      {/* Attempts Log */}
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '16px', color: '#212121', marginBottom: '16px' }}>
          Permission Attempts Log ({attempts.length})
        </h3>
        
        {attempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Click "Try ALL Permission Methods" to test
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {attempts.map((attempt, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: attempt.success ? '#e8f5e9' : '#ffebee',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${attempt.success ? '#4caf50' : '#f44336'}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontWeight: '600',
                  color: '#212121'
                }}>
                  <span>{attempt.method}</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>{attempt.time}</span>
                </div>
                <div style={{ color: '#666', fontFamily: 'monospace' }}>
                  {attempt.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Warning */}
      <div style={{
        marginTop: '20px',
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        border: '3px solid #f44336',
        boxShadow: '0 4px 16px rgba(244,67,54,0.2)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#c62828', fontSize: '18px' }}>
          🚨 FINAL ANSWER: Web Browsers CANNOT Read SMS
        </h4>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <strong>Why ALL these methods fail:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Browser security prevents SMS access</li>
            <li>No permission system exists for SMS reading</li>
            <li>This is intentional for user privacy</li>
            <li>Even with user permission, it's technically impossible</li>
          </ul>
          
          <strong style={{ display: 'block', marginTop: '16px', color: '#2e7d32' }}>
            ✅ Only Solution: User must manually paste/type SMS content
          </strong>
        </div>
      </div>
    </div>
  );
}
