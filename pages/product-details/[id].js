'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaShare, FaHeart, FaChevronLeft, FaChevronRight, FaShoppingCart } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';
import { IoMdArrowBack } from 'react-icons/io';
import tracking from '@/utils/tracking';

// FIXED: Changed function name from lowercase to PascalCase
export default function ExtraImagesProductDetails() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(6);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [time, setTime] = useState(900);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    loadProduct();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev <= 0 ? 900 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  // Auto-slide effect
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1 || !isAutoPlaying) {
      return;
    }

    const autoSlideTimer = setInterval(() => {
      setSelectedImageIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex >= product.images.length ? 0 : nextIndex;
      });
    }, 4000);

    return () => clearInterval(autoSlideTimer);
  }, [product, isAutoPlaying]);

  const loadProduct = () => {
    try {
      const storedData = typeof window !== 'undefined' ? window.localStorage.getItem('d1') : null;
      if (storedData) {
        const data = JSON.parse(storedData);
        setProduct(data);
        
        // FIXED: Track product view after loading
        tracking.trackProductView(data, {
          referrer: document.referrer || 'direct',
          page_type: 'product_detail'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      setLoading(false);
    }
  };

  const addToCart = (e) => {
    if (!product) return;

    const cartItem = {
      ...product,
      selectedSize,
      quantity: 1,
      addedAt: Date.now()
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex(
      item => item.id === product.id && item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // FIXED: Track add to cart
    tracking.trackAddToCart(product, 1);
    
    if (e !== "demo") {
      router.push('/cart');
    }
  };

  const buyNow = () => {
    if (!product) return;
    addToCart("demo");
    router.push('/address');
  };

  const handlePrevImage = () => {
    setIsAutoPlaying(false);
    setSelectedImageIndex((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? (product.images?.length || 1) - 1 : prevIndex;
    });
  };

  const handleNextImage = () => {
    setIsAutoPlaying(false);
    setSelectedImageIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= (product.images?.length || 1) ? 0 : nextIndex;
    });
  };

  const handleThumbnailClick = (idx) => {
    setIsAutoPlaying(false);
    setSelectedImageIndex(idx);
  };

  const getCartCount = () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]').length;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Product not found</div>
        <Link href="/">Go back to home</Link>
      </div>
    );
  }

  const percentageOff = ((product.mrp - (product.selling_price || product.price)) / product.mrp) * 100;
  const images = product.images || [];

  return (
    <div style={{ background: '#f1f2f4', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#0349b8',
          padding: '10px 14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {/* Left Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              onClick={() => router.push('/')}
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

            <img
              src="/uploads/Q18Ifxk.webp"
              alt="Logo"
              style={{
                width: '120px',
                objectFit: 'contain'
              }}
            />
          </div>

          <Link
            href="/cart"
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaShoppingCart style={{ color: "#fff" }} />
            {getCartCount() > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ff5722',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 0 2px #0349b8'
                }}
              >
                {getCartCount()}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div style={{ background: '#fff', padding: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '12px', position: 'absolute', right: '24px', top: '24px', zIndex: 999 }}>
          <FaHeart style={{ fontSize: '24px', color: '#868484ff', cursor: 'pointer' }} />
          <FaShare style={{ fontSize: '24px', color: '#868484ff', cursor: 'pointer' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <div ref={sliderRef} style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              transform: `translateX(-${selectedImageIndex * 100}%)`
            }}>
              {images.length > 0 ? images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.Title} - Image ${idx + 1}`}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
              )) : (
                <img
                  src={product.image}
                  alt={product.Title}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 2,
              background: 'rgba(0,0,0,0.3)',
              padding: '6px 12px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)'
            }}>
              {images.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  style={{
                    width: selectedImageIndex === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: selectedImageIndex === idx ? '#0349b8' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    boxShadow: selectedImageIndex === idx ? '0 0 8px rgba(40, 116, 240, 0.6)' : 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 0',
            scrollBehavior: 'smooth'
          }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src={img}
                  alt={`Product ${idx + 1}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    border: selectedImageIndex === idx ? '2px solid #0349b8' : '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '4px',
                    transition: 'all 0.3s ease',
                    transform: selectedImageIndex === idx ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedImageIndex === idx ? '0 4px 12px rgba(40, 116, 240, 0.3)' : 'none'
                  }}
                />
                {selectedImageIndex === idx && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(40, 116, 240, 0.1)',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Section - Rest of the code remains the same */}
      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', lineHeight: '1.4' }}>
          {product.Title || product.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#388e3c', padding: '4px 8px', borderRadius: '3px', gap: '4px' }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>4.3</span>
            <AiFillStar style={{ color: '#fff', fontSize: '12px' }} />
          </div>
          <span style={{ color: '#878787', fontSize: '13px' }}>120 ratings & 5 reviews</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', fontWeight: '600' }}>₹{product.selling_price || product.price}</span>
          <span style={{ fontSize: '16px', color: '#878787', textDecoration: 'line-through' }}>₹{product.mrp}</span>
          <span style={{ fontSize: '14px', color: '#388e3c', fontWeight: '600' }}>
            {percentageOff.toFixed(0)}% off
          </span>
        </div>

        <img
          src="/uploads/Gemini_Generated_Image_f8x8eof8x8eof8x8.png"
          alt="Assured"
          style={{ height: '24px', marginBottom: '16px' }}
        />
      </div>

      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>
          Offer ends in{' '}
          <span style={{ color: '#ff5722', fontWeight: '600' }}>
            {Math.floor(time / 60)}min {time % 60}sec
          </span>
        </h4>
      </div>

      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontSize: '12px' }}>7 days Replacement</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
            <div style={{ fontSize: '12px' }}>No Cash On Delivery</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '12px' }}>Plus Assured</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '16px', marginTop: '8px', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Product Details</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#212121', whiteSpace: 'pre-wrap' }}>
          {product?.extraImages?.map((el, index) => {
            return (
              <img
                key={index}
                src={el}
                alt="extra image"
                style={{ width: '100%', marginBottom: '12px' }}
              />
            );
          })}

          {product.description || product.features || 'No description available'}
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: '12px 16px',
        display: 'flex',
        gap: '12px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={addToCart}
          style={{
            flex: 1,
            padding: '14px',
            background: '#ff9f00',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ADD TO CART
        </button>
        <button
          onClick={buyNow}
          style={{
            flex: 1,
            padding: '14px',
            background: '#fb641b',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}