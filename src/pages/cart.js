'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.selling_price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateOriginalTotal = () => {
    return cartItems.reduce((total, item) => {
      const mrp = item.mrp || 0;
      return total + (mrp * item.quantity);
    }, 0);
  };

  const calculateSavings = () => {
    return calculateOriginalTotal() - calculateTotal();
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    localStorage.setItem('data', JSON.stringify(cartItems));
    router.push('/address');
  };

  // Helper function to get product title
  const getProductTitle = (item) => {
    const title = item.Title || item.title || 'Product';
    // Truncate long titles for better display
    if (title.length > 80) {
      return title.substring(0, 80) + '...';
    }
    return title;
  };

  // Helper function to get product image
  const getProductImage = (item) => {
    if (item.images0) return item.images0;
    if (item.image) return item.image;
    if (item.images && item.images.length > 0) return item.images[0];
    return '/placeholder.jpg';
  };

  // Helper function to get product price
  const getProductPrice = (item) => {
    return item.selling_price || item.price || 0;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f1f2f4'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>Loading...</div>
          <div style={{ color: '#878787' }}>Please wait</div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const originalTotal = calculateOriginalTotal();
  const totalSavings = calculateSavings();

  return (
    <div style={{ background: '#f1f2f4', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ 
        background: '#0349b8', 
        padding: '12px 16px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IoMdArrowBack 
              onClick={() => router.push('/')}
              style={{ color: '#fff', fontSize: '24px', cursor: 'pointer' }}
            />
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
              My Cart ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
            </span>
          </div>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          margin: '20px', 
          padding: '60px 20px', 
          textAlign: 'center', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px', color: '#212121' }}>Your cart is empty!</h2>
          <p style={{ color: '#878787', marginBottom: '24px', fontSize: '14px' }}>
            Add items to get started with your shopping
          </p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '14px 40px',
              background: '#0349b8',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1e5bc6'}
            onMouseLeave={(e) => e.target.style.background = '#0349b8'}>
              Shop Now
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div style={{ padding: '12px' }}>
            {cartItems.map((item, index) => {
              const price = getProductPrice(item);
              const mrp = item.mrp || 0;
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const title = getProductTitle(item);
              const imageUrl = getProductImage(item);

              return (
                <div key={`${item.id || item._id}-${index}`} style={{
                  background: '#fff',
                  marginBottom: '12px',
                  padding: '16px',
                  borderRadius: '4px',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <IoMdClose
                    onClick={() => removeItem(index)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '24px',
                      color: '#878787',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#ff5722'}
                    onMouseLeave={(e) => e.target.style.color = '#878787'}
                  />

                  <div style={{ display: 'flex', gap: '16px', paddingRight: '32px' }}>
                    <img
                      src={imageUrl}
                      alt={title}
                      style={{
                        width: '110px',
                        height: '110px',
                        objectFit: 'contain',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        padding: '8px',
                        background: '#fafafa',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        margin: '0 0 10px 0',
                        lineHeight: '1.5',
                        color: '#212121',
                        wordWrap: 'break-word'
                      }}>
                        {title}
                      </h3>

                      {item.selectedSize && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#878787', 
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ fontWeight: '500' }}>Size:</span>
                          <span style={{ 
                            background: '#f0f0f0', 
                            padding: '2px 8px', 
                            borderRadius: '3px',
                            fontSize: '12px'
                          }}>
                            {item.selectedSize}
                          </span>
                        </div>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        marginBottom: '14px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '20px', fontWeight: '600', color: '#212121' }}>
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {mrp > price && (
                          <>
                            <span style={{ 
                              fontSize: '15px', 
                              color: '#878787', 
                              textDecoration: 'line-through' 
                            }}>
                              ₹{mrp.toLocaleString('en-IN')}
                            </span>
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#388e3c', 
                              fontWeight: '600',
                              background: '#e8f5e9',
                              padding: '3px 8px',
                              borderRadius: '3px'
                            }}>
                              {discount}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px',
                        marginBottom: '10px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#212121' }}>
                          Quantity:
                        </span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px',
                          background: '#fff'
                        }}>
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{
                              padding: '8px 14px',
                              background: 'none',
                              border: 'none',
                              fontSize: '18px',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              color: item.quantity <= 1 ? '#ddd' : '#212121',
                              fontWeight: '600'
                            }}
                          >
                            −
                          </button>
                          <span style={{ 
                            padding: '8px 18px', 
                            borderLeft: '1px solid #ddd', 
                            borderRight: '1px solid #ddd',
                            fontWeight: '600',
                            fontSize: '15px',
                            minWidth: '50px',
                            textAlign: 'center'
                          }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            style={{
                              padding: '8px 14px',
                              background: 'none',
                              border: 'none',
                              fontSize: '18px',
                              cursor: 'pointer',
                              color: '#212121',
                              fontWeight: '600'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ 
                        fontSize: '15px', 
                        color: '#388e3c', 
                        fontWeight: '600',
                        background: '#e8f5e9',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        Subtotal: ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Details */}
          <div style={{ 
            background: '#fff', 
            margin: '12px', 
            padding: '20px', 
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '18px', 
              paddingBottom: '14px', 
              borderBottom: '1px solid #f0f0f0',
              color: '#212121'
            }}>
              PRICE DETAILS
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#212121' }}>
                <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} {cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'})</span>
                <span style={{ fontWeight: '500' }}>₹{originalTotal.toLocaleString('en-IN')}</span>
              </div>

              {totalSavings > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '15px', 
                  color: '#388e3c',
                  fontWeight: '500'
                }}>
                  <span>Discount</span>
                  <span>− ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#212121' }}>
                <span>Delivery Charges</span>
                <span style={{ color: '#388e3c', fontWeight: '500' }}>FREE</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: '600',
                paddingTop: '14px',
                borderTop: '1px dashed #ddd',
                color: '#212121'
              }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {totalSavings > 0 && (
                <div style={{ 
                  color: '#388e3c', 
                  fontSize: '15px', 
                  fontWeight: '600',
                  background: '#e8f5e9',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  marginTop: '6px'
                }}>
                  🎉 You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                </div>
              )}
            </div>
          </div>

          {/* Clear Cart Button */}
          {cartItems.length > 0 && (
            <div style={{ padding: '0 12px 12px' }}>
              <button
                onClick={clearCart}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#fff',
                  color: '#ff5722',
                  border: '2px solid #ff5722',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff5722';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#ff5722';
                }}
              >
                CLEAR CART
              </button>
            </div>
          )}
        </>
      )}

      {/* Bottom Checkout Button */}
      {cartItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          padding: '14px 16px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#878787', marginBottom: '4px' }}>Total Amount</div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: '#212121' }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <button
            onClick={proceedToCheckout}
            style={{
              padding: '16px 36px',
              background: '#fb641b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(251, 100, 27, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e55a15';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fb641b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            PLACE ORDER
          </button>
        </div>
      )}
    </div>
  );
}