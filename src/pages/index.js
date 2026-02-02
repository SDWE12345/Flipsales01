'use client';

import { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { IoMdArrowBack, IoMdClock, IoMdMenu } from 'react-icons/io';
import Card from '../componets/Card';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';
import { useRouter } from 'next/router';

// Import tracking utilities
import {
  trackProductView,
  trackAddToCart,
  trackSearch,
  trackInitiateCheckout,
  trackCustomEvent,
  identifyUser
} from '../utils/tracking';

export default function Home() {
  const router = useRouter();
  const INITIAL_TIME = 700;

  const [time, setTime] = useState(INITIAL_TIME);
  const [products, setProducts] = useState([]);
  const [pixelId, setPixelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/products?page=${pageNum}&limit=15`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      if (data.products && Array.isArray(data.products)) {
        if (append) {
          // Append new products (infinite scroll)
          setProducts(prev => [...prev, ...data.products]);
        } else {
          // Replace products (initial load)
          setProducts(data.products);
        }

        // Update pagination info
        if (data.pagination) {
          setHasMore(data.pagination.hasNext);
          setTotalProducts(data.pagination.total);
        } else {
          // Fallback if no pagination data
          setHasMore(data.products.length === 15);
        }
      } else {
        setHasMore(false);
      }

      // Identify user if token exists
      if (token && pageNum === 1) {
        try {
          const userData = JSON.parse(atob(token.split('.')[1]));
          identifyUser({
            id: userData.userId,
            email: userData.email,
            phone: userData.phone
          });
        } catch (e) {
          console.log('User identification skipped');
        }
      }

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setHasMore(false);

      // Track error event
      trackCustomEvent('FetchProductsError', {
        error_message: err.message,
        page: pageNum
      });
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);

      // Track pagination event
      trackCustomEvent('LoadMoreProducts', {
        page: nextPage,
        current_products: products.length
      });
    }
  }, [loadingMore, hasMore, page, fetchProducts, products.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px', // Trigger 200px before reaching the element
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        loadMoreProducts();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, loadMoreProducts]);

  // Countdown timer effect
  useEffect(() => {
    if (time <= 0) return;

    const timer = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          trackCustomEvent('DealTimerCompleted');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  // Initial data fetch
  useLayoutEffect(() => {
    fetchProducts(1, false);

    // Track home page view
    trackCustomEvent('HomePageView', {
      page_type: 'home',
      timestamp: new Date().toISOString()
    });

  }, [fetchProducts]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getCartCount = () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]').length;
    } catch {
      return 0;
    }
  };

  // Handle search with tracking
  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackSearch(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle cart click
  const handleCartClick = () => {
    const cartCount = getCartCount();
    if (cartCount > 0) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      trackInitiateCheckout(cart);
    }
    router.push('/cart');
  };

  // Handle sale live button click
  const handleSaleLiveClick = () => {
    trackCustomEvent('SaleLiveButtonClick', {
      button_position: 'deals_section',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600">
        <header
          style={{
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
                <IoMdMenu
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
                  width: '110px',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Right Section */}
            <Link
              href="/cart"
              onClick={handleCartClick}
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

              {/* Cart Count */}
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

        <div className="px-2 pb-2">
          <div className="block">
            <input
              type="text"
              className="w-full px-3 py-2 rounded border-0 text-sm"
              placeholder="Search for Products, Brands and More"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
      </header>

      {/* Banner */}
      <img
        src="/uploads/top-bg.a2aad345a2d903ce5659.jpg"
        className="w-full"
        alt="Banner"
        style={{
          height: "120px",
          objectFit: "cover",
          objectPosition: "left"
        }}
        onClick={() => trackCustomEvent('BannerClick', { banner_position: 'top' })}
      />
      <img
        className="w-full md:hidden"
        src="/uploads/image.png"
        alt="Mobile Banner"
      />

      {/* Deals Section */}
      <div className="bg-white p-3 deals-section">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold mb-2">Deals of the Day</div>
            <div className="flex items-center">
              <IoMdClock className="text-lg mr-2" />
              <div className="font-bold text-red-600">{formatTime(time)}</div>
            </div>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            onClick={handleSaleLiveClick}
          >
            SALE IS LIVE
          </button>
        </div>
      </div>
      <div className="" style={{ background: "#fff" }}>
        {loading ? (
          <div className="text-center py-12">
            <img
              src="https://icon-library.com/images/loading-icon-animated-gif/loading-icon-animated-gif-19.jpg"
              alt="Loading..."
              className="w-12 mx-auto loading-spinner"
            />
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4 error-message">Error: {error}</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setPage(1);
                fetchProducts(1, false);
              }}
            >
              Retry
            </button>
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="cards-grid">
              {products.map((item, index) => (
                <Card key={item._id || item.id || index} item={item} index={index} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="w-full py-8">
              {loadingMore && (
                <div className="text-center">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">Loading more products...</p>
                </div>
              )}
              
              {!hasMore && products.length > 0 && (
                <div className="text-center text-gray-500 text-sm">
                  <p className="font-medium">🎉 You've reached the end!</p>
                  <p className="mt-1">All {totalProducts} products loaded</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-products text-center py-12">
            <p className="text-gray-600">No products available</p>
            <button
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setPage(1);
                fetchProducts(1, false);
              }}
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      <footer id="seofooter" />
    </div>
  );
}