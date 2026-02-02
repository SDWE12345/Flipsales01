import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navigation from './Navigation';

const Settings = () => {
    const [upiSettings, setUpiSettings] = useState({
        upi: '',
        upi2: '',
        Bhim: false,
        Gpay: false,
        Paytm: false,
        Phonepe: false,
        WPay: false,
    });
    const [pixelId, setPixelId] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);
    const [isSubmittingPixel, setIsSubmittingPixel] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const getAuthHeaders = () => ({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchSettings = async () => {
        setIsLoadingData(true);
        try {
            const response = await fetch('/api/upichange', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setUpiSettings({
                    upi: data.upi.upi || '',
                    upi2: data.upi.upi2 || '',
                    Bhim: data.upi.Bhim || false,
                    Gpay: data.upi.Gpay || false,
                    Paytm: data.upi.Paytm || false,
                    Phonepe: data.upi.Phonepe || false,
                    WPay: data.upi.WPay || false,
                });
                setPixelId(data?.pixelId?.FacebookPixel || '');
            } else {
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleUpiSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingUpi(true);

        try {
            const response = await fetch('/api/upichange', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(upiSettings),
            });

            const data = await response.json();
            
            if (data.status === 1) {
            } else {
            }
        } catch (error) {
            console.error('Error submitting UPI:', error);
        } finally {
            setIsSubmittingUpi(false);
        }
    };

    const handlePixelSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingPixel(true);

        try {
            const response = await fetch('/api/facebookPixel', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ pixelId }),
            });

            const data = await response.json();
            
            if (data.status === 1) {
            } else {
            }
        } catch (error) {
            console.error('Error submitting Pixel:', error);
        } finally {
            setIsSubmittingPixel(false);
        }
    };

    const handleInputChange = (field, value) => {
        setUpiSettings(prev => ({ ...prev, [field]: value }));
    };

    const paymentMethods = [
        { id: 'gpay', field: 'Gpay', label: 'Google Pay', icon: '💳', color: '#4285F4' },
        { id: 'phonepe', field: 'Phonepe', label: 'PhonePe', icon: '📱', color: '#5F259F' },
        { id: 'paytm', field: 'Paytm', label: 'Paytm', icon: '💰', color: '#00BAF2' },
        { id: 'bhim', field: 'Bhim', label: 'BHIM UPI', icon: '🏦', color: '#FF6B35' },
        { id: 'wpay', field: 'WPay', label: 'W-Pay', icon: '💵', color: '#00C853' },
    ];

    if (isLoadingData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div style={{ fontSize: '1.0.5rem', fontWeight: '500' }}>Loading Settings...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
          <Navigation/>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.5rem' }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                marginRight: '1rem'
                            }}>
                                💳
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                    UPI Configuration
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                    Manage your UPI payment IDs
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                PRIMARY UPI ID
                            </label>
                            <input
                                type="text"
                                value={upiSettings.upi}
                                onChange={(e) => handleInputChange('upi', e.target.value)}
                                placeholder="example@upi"
                                disabled={isSubmittingUpi}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                SECONDARY UPI ID
                            </label>
                            <input
                                type="text"
                                value={upiSettings.upi2}
                                onChange={(e) => handleInputChange('upi2', e.target.value)}
                                placeholder="backup@upi"
                                disabled={isSubmittingUpi}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                                Payment Methods
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        onClick={() => !isSubmittingUpi && handleInputChange(method.field, !upiSettings[method.field])}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem 1.25rem',
                                            border: `2px solid ${upiSettings[method.field] ? method.color : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                            cursor: isSubmittingUpi ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            background: upiSettings[method.field] ? `${method.color}10` : 'white',
                                            opacity: isSubmittingUpi ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSubmittingUpi) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{method.label}</span>
                                        </div>
                                        <div style={{
                                            width: '52px',
                                            height: '28px',
                                            borderRadius: '14px',
                                            background: upiSettings[method.field] ? method.color : '#cbd5e1',
                                            position: 'relative',
                                            transition: 'all 0.3s'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: upiSettings[method.field] ? '26px' : '2px',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleUpiSubmit}
                            disabled={isSubmittingUpi}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isSubmittingUpi ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isSubmittingUpi ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmittingUpi) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {isSubmittingUpi ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Save UPI Settings
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                marginRight: '1rem'
                            }}>
                                📊
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                    Facebook Pixel
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                    Configure tracking integration
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                PIXEL ID / TRACKING CODE
                            </label>
                            <textarea
                                value={pixelId}
                                onChange={(e) => setPixelId(e.target.value)}
                                placeholder="Enter your Facebook Pixel ID or complete tracking code..."
                                disabled={isSubmittingPixel}
                                rows={8}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1877f2';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <div style={{ 
                                marginTop: '0.5rem',
                                padding: '0.75rem',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                color: '#64748b',
                                lineHeight: '1.5'
                            }}>
                                💡 <strong>Tip:</strong> You can paste either just the Pixel ID (e.g., 1234567890) or the complete tracking code snippet from Facebook Business Manager.
                            </div>
                        </div>

                        <button
                            onClick={handlePixelSubmit}
                            disabled={isSubmittingPixel}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isSubmittingPixel ? '#94a3b8' : 'linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isSubmittingPixel ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmittingPixel) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(24, 119, 242, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {isSubmittingPixel ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <span>💾</span>
                                    Save Pixel Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;