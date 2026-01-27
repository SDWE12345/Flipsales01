"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoMdArrowBack } from "react-icons/io";
import { FaCheckCircle, FaMapMarkerAlt, FaShieldAlt, FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const Ordersummary = () => {
    const router = useRouter();
    const [user, setUser] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
            
            setUser(userData);
            setCartItems(cartData);
            setLoading(false);
        }
    }, []);

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

    // Calculate totals for all products
    const calculateTotals = () => {
        let totalMrp = 0;
        let totalSellingPrice = 0;

        cartItems.forEach(item => {
            const quantity = Number(item.quantity) || 1;
            const mrp = Number(item.mrp) || 0;
            const sellingPrice = Number(item.selling_price || item.price) || 0;
            
            totalMrp += mrp * quantity;
            totalSellingPrice += sellingPrice * quantity;
        });

        const totalDiscount = totalMrp - totalSellingPrice;
        const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

        return {
            totalMrp,
            totalSellingPrice,
            totalDiscount,
            totalItems
        };
    };

    const { totalMrp, totalSellingPrice, totalDiscount, totalItems } = calculateTotals();

    // Update quantity
    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) return;
        
        const updatedCart = [...cartItems];
        updatedCart[index].quantity = newQuantity;
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // Increase quantity
    const increaseQuantity = (index) => {
        const currentQty = Number(cartItems[index].quantity) || 1;
        updateQuantity(index, currentQty + 1);
    };

    // Decrease quantity
    const decreaseQuantity = (index) => {
        const currentQty = Number(cartItems[index].quantity) || 1;
        if (currentQty > 1) {
            updateQuantity(index, currentQty - 1);
        }
    };

    // Remove item from cart
    const removeItem = (index) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        
        if (updatedCart.length === 0) {
            router.push('/cart');
        }
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '70px' }}>
            {/* Header */}
            <header style={{ 
                background: 'linear-gradient(135deg, #0349b8 0%, #1e5bc6 100%)', 
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
                        onClick={() => router.push('/address')}
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
                        <IoMdArrowBack style={{ color: '#fff', fontSize: '20px' }} />
                    </div>
                    <h1 style={{ 
                        color: '#fff', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '0.3px'
                    }}>
                        Order Summary
                    </h1>
                </div>
            </header>

            {/* Progress Stepper */}
            <div style={{ 
                background: '#fff', 
                padding: '16px 12px',
                marginBottom: '8px',
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
                            width: '50%',
                            background: 'linear-gradient(90deg, #0349b8, #5b8def)',
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '2px'
                        }} />
                    </div>

                    {/* Step 1 - Complete */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#388e3c',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                            boxShadow: '0 2px 8px rgba(56,142,60,0.3)',
                            border: '3px solid #fff'
                        }}>
                            <FaCheckCircle style={{ fontSize: '16px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#388e3c', fontWeight: '600', lineHeight: '1.3' }}>
                            Address
                        </div>
                    </div>

                    {/* Step 2 - Active */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0349b8 0%, #1e5bc6 100%)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                            fontWeight: '700',
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(40,116,240,0.3)',
                            border: '3px solid #fff'
                        }}>
                            2
                        </div>
                        <div style={{ fontSize: '11px', color: '#0349b8', fontWeight: '600', lineHeight: '1.3' }}>
                            Order Summary
                        </div>
                    </div>

                    {/* Step 3 - Pending */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#fff',
                            border: '3px solid #e0e0e0',
                            color: '#9e9e9e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}>
                            3
                        </div>
                        <div style={{ fontSize: '11px', color: '#9e9e9e', fontWeight: '500', lineHeight: '1.3' }}>
                            Payment
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 12px' }}>
                {/* Delivery Address Card */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <h2 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            margin: 0,
                            color: '#212121',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <FaMapMarkerAlt style={{ color: '#0349b8', fontSize: '14px' }} />
                            Delivered to:
                        </h2>
                        <button
                            onClick={() => router.push('/address')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#0349b8',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '4px 8px'
                            }}
                        >
                            <MdEdit /> Change
                        </button>
                    </div>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        borderLeft: '3px solid #0349b8'
                    }}>
                        <div style={{ marginBottom: '6px' }}>
                            <span style={{ fontWeight: '600', color: '#212121', fontSize: '13px' }}>
                                {user.name || 'Customer Name'}
                            </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', lineHeight: '1.5' }}>
                            {user.address || 'Address not provided'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Mobile: <span style={{ fontWeight: '600', color: '#212121' }}>
                                {user.phone || 'Not provided'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* All Products Card */}
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
                        Order Items ({totalItems})
                    </h2>

                    {cartItems.map((product, index) => {
                        const quantity = Number(product.quantity) || 1;
                        const mrp = Number(product.mrp) || 0;
                        const sellingPrice = Number(product.selling_price || product.price) || 0;
                        const discount = mrp - sellingPrice;
                        const percentageOff = mrp > 0 ? ((discount / mrp) * 100).toFixed(0) : 0;

                        return (
                            <div 
                                key={index}
                                style={{
                                    paddingBottom: index < cartItems.length - 1 ? '12px' : '0',
                                    marginBottom: index < cartItems.length - 1 ? '12px' : '0',
                                    borderBottom: index < cartItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '10px'
                                }}>
                                    <img
                                        src={product.images?.[0] || product.image}
                                        alt={product.Title || product.title}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0',
                                            padding: '6px',
                                            background: '#fafafa'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#212121',
                                            margin: '0 0 6px 0',
                                            lineHeight: '1.4'
                                        }}>
                                            {product.Title || product.title || 'Product Name'}
                                        </h3>
                                        <img
                                            src="/uploads/Gemini_Generated_Image_f8x8eof8x8eof8x8.png"
                                            alt="Assured"
                                            style={{ height: '18px', marginBottom: '6px' }}
                                        />
                                        
                                        {/* Quantity Controls */}
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px',
                                            marginTop: '8px'
                                        }}>
                                            <span style={{ fontSize: '12px', color: '#878787' }}>Qty:</span>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '6px',
                                                overflow: 'hidden'
                                            }}>
                                                <button
                                                    onClick={() => decreaseQuantity(index)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        border: 'none',
                                                        background: quantity === 1 ? '#f5f5f5' : '#fff',
                                                        cursor: quantity === 1 ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: quantity === 1 ? '#ccc' : '#0349b8',
                                                        fontSize: '16px'
                                                    }}
                                                    disabled={quantity === 1}
                                                >
                                                    <AiOutlineMinus />
                                                </button>
                                                <span style={{
                                                    padding: '0 12px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#212121',
                                                    minWidth: '30px',
                                                    textAlign: 'center',
                                                    background: '#f8f9fa'
                                                }}>
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => increaseQuantity(index)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        border: 'none',
                                                        background: '#fff',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#0349b8',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    <AiOutlinePlus />
                                                </button>
                                            </div>
                                            
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeItem(index)}
                                                style={{
                                                    marginLeft: 'auto',
                                                    padding: '6px 10px',
                                                    border: 'none',
                                                    background: '#fff',
                                                    color: '#ff3f6c',
                                                    cursor: 'pointer',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fff5f7';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#fff';
                                                }}
                                            >
                                                <FaTrash style={{ fontSize: '11px' }} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {discount > 0 && (
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#388e3c',
                                                fontWeight: '600',
                                                background: '#e8f5e9',
                                                padding: '3px 6px',
                                                borderRadius: '4px'
                                            }}>
                                                {percentageOff}% Off
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#878787',
                                            textDecoration: 'line-through'
                                        }}>
                                            ₹{mrp * quantity}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '17px',
                                        fontWeight: '700',
                                        color: '#212121'
                                    }}>
                                        ₹{sellingPrice * quantity}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Price Details Card */}
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
                            <span style={{ color: '#212121' }}>Price ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                            <span style={{ color: '#212121' }}>₹{totalMrp}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#212121' }}>Discount</span>
                            <span style={{ color: '#388e3c', fontWeight: '600' }}>
                                −₹{totalDiscount}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#212121' }}>Delivery Charges</span>
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
                            <span style={{ fontWeight: '700', color: '#212121' }}>Total Amount</span>
                            <span style={{ fontWeight: '700', color: '#212121' }}>₹{totalSellingPrice}</span>
                        </div>
                    </div>

                    {totalDiscount > 0 && (
                        <div style={{
                            marginTop: '12px',
                            padding: '10px',
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#388e3c',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            🎉 You will save ₹{totalDiscount} on this order
                        </div>
                    )}
                </div>

                {/* Safety Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    border: '1px solid #ffe082'
                }}>
                    <FaShieldAlt style={{ 
                        fontSize: '28px', 
                        color: '#ff9800',
                        flexShrink: 0
                    }} />
                    <div style={{
                        fontSize: '11px',
                        color: '#e65100',
                        lineHeight: '1.5',
                        fontWeight: '500'
                    }}>
                        Safe and secure payments. Easy returns. 100% Authentic products.
                    </div>
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
                        {totalDiscount > 0 && (
                            <div style={{
                                fontSize: '11px',
                                color: '#388e3c',
                                fontWeight: '600',
                                marginBottom: '3px'
                            }}>
                                Save ₹{totalDiscount}
                            </div>
                        )}
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#212121'
                        }}>
                            ₹{totalSellingPrice}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/payment')}
                        style={{
                            flex: 1,
                            maxWidth: '200px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #ff6200 0%, #ff5200 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255,98,0,0.3)',
                            transition: 'all 0.3s',
                            letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,98,0,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,98,0,0.3)';
                        }}
                    >
                        CONFIRM ORDER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ordersummary;