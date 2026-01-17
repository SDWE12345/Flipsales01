"use client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FaCheckCircle, FaShieldAlt, FaBox, FaLock } from "react-icons/fa";
import { MdQrCode2 } from "react-icons/md";
import QRCode from 'qrcode.react';
import tracking from "@/utils/tracking";

const Payments = () => {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [user, setUser] = useState({});
    const [product, setProduct] = useState({});
    const [upiConfig, setUpiConfig] = useState({});
    const [activeTab, setActiveTab] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [time, setTime] = useState(240); // 4 minutes
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const productData = JSON.parse(localStorage.getItem("d1") || "{}");
            setUser(userData);
            setProduct(productData);
            fetchUpiConfig();
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prev) => (prev <= 0 ? 240 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchUpiConfig = async () => {
        try {
            const response = await fetch('/api/upichange', {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUpiConfig(data.upi || {});
                // Set default active tab
                if (data.upi?.Gpay) setActiveTab('gpay');
                else if (data.upi?.Phonepe) setActiveTab('phonepe');
                else if (data.upi?.Paytm) setActiveTab('paytm');
                else if (data.upi?.Bhim) setActiveTab('bhim');
            }
        } catch (error) {
            console.error('Error fetching UPI config:', error);
        }
    };

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const amount = Number(product.selling_price || product.price) || 0;
    const mrp = Number(product.mrp) || 0;

    const getPaymentUrl = (activeTab) => {
        const upiId = upiConfig.upi || "";
        const name = "Shopping";
        const amt = amount;

        const encodedUPI = encodeURIComponent(upiId);
        const encodedName = encodeURIComponent(name);

        switch (activeTab) {
            case "gpay":
                return `tez://upi/pay?pa=${encodedUPI}&pn=${encodedName}&am=${amt}&cu=INR`;

            case "phonepe":
                return `phonepe://pay?pa=${encodedUPI}&pn=${encodedName}&am=${amt}&cu=INR`;

            case "paytm":
                return `paytmmp://pay?pa=${encodedUPI}&pn=${encodedName}&am=${amt}&cu=INR`;

            case "bhim":
                return `bhim://upi/pay?pa=${encodedUPI}&pn=${encodedName}&am=${amt}&cu=INR`;

            default:
                // Fallback – opens UPI chooser
                return `upi://pay?pa=${encodedUPI}&pn=${encodedName}&am=${amt}&cu=INR`;
        }
    };

    const handlePaymentMethodSelect = (method) => {
        setSelectedMethod(method);

        // Track add payment info
        const product = JSON.parse(sessionStorage.getItem('d1') || '{}');
        tracking.trackAddPaymentInfo(product, method);
    };

    const handlePaymentComplete = async () => {
        const product = JSON.parse(sessionStorage.getItem('d1') || '{}');
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');

        // Generate transaction ID
        const transactionId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if already tracked to prevent duplicates
        if (tracking.isPurchaseTracked(transactionId)) {
            console.log('⚠️ Purchase already tracked');
            return;
        }

        // Get client IP for server-side tracking
        const clientIp = await tracking.getClientIp();

        // Track purchase
        await tracking.trackPurchase({
            productId: product.id,
            productName: product.title || product.Title,
            value: product.price || product.selling_price,
            quantity: 1,
            transactionId: transactionId,
            clientIp: clientIp
        });

        // Clear cart after successful purchase
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('d1');
    };
    const paymentMethods = [
        {
            id: 'gpay',
            name: 'Google Pay',
            enabled: upiConfig.Gpay,
            icon: (
                <svg width="40" height="40" viewBox="15 -10 225 250" xmlns="http://www.w3.org/2000/svg">
                    <path d="M232.503966,42.1689673 C207.253909,27.593266 174.966113,36.2544206 160.374443,61.5045895 L123.592187,125.222113 C112.948983,143.621675 126.650534,150.051007 141.928772,159.211427 L177.322148,179.639204 C189.30756,186.552676 204.616725,182.448452 211.530197,170.478784 L249.342585,104.997327 C262.045492,82.993425 254.507868,54.8722676 232.503966,42.1689673 Z" fill="#EA4335" />
                    <path d="M190.884248,68.541767 L155.490872,48.1141593 C135.952653,37.2682465 124.888287,36.5503588 116.866523,49.3002175 L64.6660169,139.704135 C50.0900907,164.938447 58.7669334,197.211061 84.0012455,211.755499 C106.005147,224.458406 134.126867,216.920782 146.829774,194.91688 L200.029486,102.764998 C206.973884,90.7801476 202.869661,75.4552386 190.884248,68.541767 Z" fill="#FBBC04" />
                    <path d="M197.696506,22.068674 L172.836685,7.71148235 C145.33968,-8.15950938 110.180221,1.25070674 94.3093189,28.7478917 L46.9771448,110.724347 C39.9857947,122.818845 44.1369141,138.299511 56.2315252,145.275398 L84.0720952,161.34929 C97.8203166,169.292894 115.392174,164.5797 123.335778,150.830917 L177.409304,57.1816314 C188.614245,37.7835939 213.411651,31.1355838 232.809294,42.3404686 L197.696506,22.068674 Z" fill="#34A853" />
                    <path d="M101.033296,52.202526 L74.1604429,36.7216914 C62.1750303,29.8240204 46.8660906,33.9126683 39.9527877,45.8666484 L7.71149357,101.579108 C-8.15952065,128.997954 1.25071234,164.079816 28.7479029,179.904047 L49.2069432,191.685907 L74.0198681,205.980684 L84.7879024,212.176099 C65.670846,199.37985 59.6002612,173.739558 71.2887797,153.545698 L79.6378018,139.126091 L110.20946,86.3008703 C117.107187,74.3784352 113.002964,59.1001971 101.033296,52.202526 Z" fill="#4285F4" />
                </svg>
            )
        },
        {
            id: 'phonepe',
            name: 'PhonePe',
            enabled: upiConfig.Phonepe,
            icon: (
                <svg height="40" viewBox="0 0 700 700" width="40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="339.53" cy="339.53" fill="#5f259f" r="339.46" />
                    <path d="m493.6 250.94c0-13.27-11.38-24.65-24.65-24.65h-45.51l-104.3-119.47c-9.48-11.38-24.65-15.17-39.82-11.38l-36.03 11.38c-5.69 1.9-7.59 9.48-3.79 13.27l113.78 108.1h-172.59c-5.69 0-9.48 3.79-9.48 9.48v18.96c0 13.27 11.38 24.65 24.65 24.65h26.55v91.03c0 68.27 36.03 108.1 96.72 108.1 18.96 0 34.14-1.9 53.1-9.48v60.69c0 17.07 13.27 30.34 30.34 30.34h26.55c5.69 0 11.38-5.69 11.38-11.38v-271.19h43.62c5.69 0 9.48-3.79 9.48-9.48zm-121.37 163.09c-11.38 5.69-26.55 7.59-37.93 7.59-30.34 0-45.51-15.17-45.51-49.31v-91.03h83.44z" fill="#fff" />
                </svg>
            )
        },
        {
            id: 'paytm',
            name: 'Paytm',
            enabled: upiConfig.Paytm,
            icon: <img src="/uploads/Paytm-Logo.png" alt="Paytm" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        },
        {
            id: 'bhim',
            name: 'BHIM UPI',
            enabled: upiConfig.Bhim,
            icon: <img src="/uploads/images.png" alt="BHIM" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#f5f5f5'
            }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
            </div>
        );
    }

    if (showQR) {
        return (
            <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px' }}>
                <div style={{
                    maxWidth: '420px',
                    margin: '0 auto',
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#212121',
                        marginBottom: '16px'
                    }}>
                        Scan QR Code to Pay
                    </h2>

                    <div style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid #f0f0f0',
                        marginBottom: '16px',
                        display: 'inline-block'
                    }}>
                        <QRCode
                            value={getPaymentUrl()}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        border: '1px solid #ffb74d'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#e65100',
                            fontWeight: '600',
                            marginBottom: '4px'
                        }}>
                            Time Remaining
                        </div>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#ff6f00'
                        }}>
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #2874f0 0%, #1e5bc6 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginBottom: '8px',
                            boxShadow: '0 4px 12px rgba(40,116,240,0.3)'
                        }}
                    >
                        Continue Shopping
                    </button>

                    <button
                        onClick={() => setShowQR(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2874f0',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Back to Payment Options
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #2874f0 0%, #1e5bc6 100%)',
                padding: '12px 16px',
                boxShadow: '0 2px 8px rgba(40,116,240,0.15)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div
                        onClick={() => router.push('/ordersummdary')}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <IoMdArrowBack
                            style={{
                                color: '#fff',
                                fontSize: '20px'
                            }}
                        />
                    </div>

                    <h1 style={{
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '0.3px'
                    }}>
                        Payments
                    </h1>
                </div>
            </header>

            {/* Progress Stepper */}
            <div style={{
                background: '#fff',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    maxWidth: '600px',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    {/* Progress Line */}
                    <div style={{
                        position: 'absolute',
                        top: '14px',
                        left: 'calc(16.66% + 14px)',
                        right: 'calc(16.66% + 14px)',
                        height: '3px',
                        background: '#e0e0e0',
                        zIndex: 0,
                        borderRadius: '2px'
                    }}>
                        <div style={{
                            height: '100%',
                            width: '100%',
                            background: 'linear-gradient(90deg, #2874f0, #5b8def)',
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '2px'
                        }} />
                    </div>

                    {/* Steps */}
                    {['Address', 'Order Summary', 'Payment'].map((label, idx) => (
                        <div key={idx} style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: idx === 2 ? 'linear-gradient(135deg, #2874f0 0%, #1e5bc6 100%)' : '#388e3c',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px',
                                boxShadow: idx === 2 ? '0 4px 12px rgba(40,116,240,0.3)' : '0 2px 8px rgba(56,142,60,0.3)',
                                border: '3px solid #fff',
                                fontWeight: '700',
                                fontSize: '14px'
                            }}>
                                {idx < 2 ? <FaCheckCircle /> : '3'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: idx === 2 ? '#2874f0' : '#388e3c',
                                fontWeight: '600',
                                lineHeight: '1.3',
                                whiteSpace: 'pre-line'
                            }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 12px' }}>
                {/* Timer Card */}
                <div style={{
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '0px',
                    textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#e65100',
                        fontWeight: '600',
                    }}>
                        ⏱ Offer ends in
                    </div>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#ff6f00'
                    }}>
                        {minutes}min {seconds}sec
                    </div>
                </div>

                {/* QR Code Option */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
                    onClick={() => setShowQR(true)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            background: 'linear-gradient(135deg, #2874f0 0%, #5b8def 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '22px'
                        }}>
                            <MdQrCode2 />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#212121',
                                marginBottom: '3px'
                            }}>
                                Pay with QR Code
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#666'
                            }}>
                                Scan & pay with any UPI app
                            </div>
                        </div>
                        <div style={{
                            color: '#2874f0',
                            fontSize: '18px'
                        }}>
                            →
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0'
                }}>
                    <h2 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#212121'
                    }}>
                        Choose Payment Method
                    </h2>

                    {paymentMethods.filter(method => method.enabled).map((method) => (
                        <div
                            key={method.id}
                            onClick={() => { setActiveTab(method.id); handlePaymentMethodSelect(method.id); }}
                            style={{
                                padding: '12px',
                                borderRadius: '10px',
                                border: activeTab === method.id ? '2px solid #2874f0' : '2px solid #f0f0f0',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: activeTab === method.id ? '#f0f7ff' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== method.id) {
                                    e.currentTarget.style.borderColor = '#2874f0';
                                    e.currentTarget.style.background = '#fafafa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== method.id) {
                                    e.currentTarget.style.borderColor = '#f0f0f0';
                                    e.currentTarget.style.background = '#fff';
                                }
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                background: '#fff',
                                border: '1px solid #f0f0f0'
                            }}>
                                {method.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#212121'
                                }}>
                                    {method.name}
                                </div>
                            </div>
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: activeTab === method.id ? '6px solid #2874f0' : '2px solid #ccc',
                                transition: 'all 0.3s'
                            }} />
                        </div>
                    ))}
                </div>

                {/* Price Details */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0'
                }}>
                    <h2 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#212121',
                        paddingBottom: '10px',
                        borderBottom: '2px solid #f5f5f5'
                    }}>
                        Price Details
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#666' }}>Price (1 item)</span>
                            <span style={{ color: '#212121', fontWeight: '600' }}>₹{mrp}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#666' }}>Delivery Charges</span>
                            <span style={{ color: '#388e3c', fontWeight: '600' }}>FREE</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '15px',
                            paddingTop: '12px',
                            borderTop: '2px dashed #e0e0e0',
                            marginTop: '4px'
                        }}>
                            <span style={{ fontWeight: '700', color: '#212121' }}>Amount Payable</span>
                            <span style={{ fontWeight: '700', color: '#212121' }}>₹{amount}</span>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '8px'
                }}>
                    {[
                        { icon: <FaShieldAlt />, text: 'Secure Payments' },
                        { icon: <FaBox />, text: 'Easy Returns' },
                        { icon: <FaLock />, text: '100% Authentic' }
                    ].map((badge, idx) => (
                        <div key={idx} style={{
                            background: '#fff',
                            borderRadius: '10px',
                            padding: '12px 10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            border: '1px solid #f0f0f0'
                        }}>
                            <div style={{
                                fontSize: '20px',
                                color: '#2874f0',
                                marginBottom: '6px'
                            }}>
                                {badge.icon}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: '#666',
                                fontWeight: '500'
                            }}>
                                {badge.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#fff',
                padding: '12px 16px',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div>
                        <div style={{
                            fontSize: '11px',
                            color: '#666',
                            marginBottom: '3px'
                        }}>
                            Total Amount
                        </div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#212121'
                        }}>
                            ₹{amount}
                        </div>
                    </div>
                    <a
                        href={getPaymentUrl()}
                        style={{
                            flex: 1,
                            maxWidth: '200px',
                            padding: '12px 24px',
                            background: activeTab ? 'linear-gradient(135deg, #ff6200 0%, #ff5200 100%)' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: activeTab ? 'pointer' : 'not-allowed',
                            boxShadow: activeTab ? '0 4px 12px rgba(255,98,0,0.3)' : 'none',
                            transition: 'all 0.3s',
                            letterSpacing: '0.5px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            pointerEvents: activeTab ? 'auto' : 'none'
                        }}
                    >
                        Pay with {activeTab?.toUpperCase()}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Payments;
