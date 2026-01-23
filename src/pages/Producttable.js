import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToasts } from 'react-toast-notifications';
import Navigation from './Navigation';

const ProductTable = () => {
    const { addToast } = useToasts();
    const [products, setProducts] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('oldest');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data['products '] || data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            addToast('Error loading products', { appearance: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                addToast('Product removed successfully', { appearance: 'success' });
                fetchProducts();
            } else {
                addToast('Error removing product', { appearance: 'error' });
            }
        } catch (error) {
            console.error('Error removing product:', error);
            addToast('Network error. Please try again.', { appearance: 'error' });
        }
    };
const handleReorder = async (productId, direction) => {
    const productIndex = products.findIndex(p => p._id === productId);
    if (
        (direction === 'up' && productIndex === 0) ||
        (direction === 'down' && productIndex === products.length - 1)
    ) {
        return;
    }

    const targetIndex = direction === 'up' ? productIndex - 1 : productIndex + 1;
    const currentProduct = products[productIndex];
    const targetProduct = products[targetIndex];

    // Swap display orders
    const currentOrder = currentProduct.disp_order || productIndex + 1;
    const targetOrder = targetProduct.disp_order || targetIndex + 1;

    try {
        // Only update the two products that are swapping
        await Promise.all([
            // Update current product with target's order
            fetch(`/api/products/${currentProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: currentProduct.title || '',
                    description: currentProduct.description || '',
                    features: currentProduct.features || '',
                    mrp: parseFloat(currentProduct.mrp) || 0,
                    price: parseFloat(currentProduct.price) || 0,
                    selling_price: parseFloat(currentProduct.selling_price || currentProduct.price) || 0,
                    color: currentProduct.color || '',
                    size: currentProduct.size || '',
                    storage: currentProduct.storage || '',
                    image: currentProduct.image || '',
                    images: currentProduct.images || [],
                    extraImages: currentProduct.extraImages || [],
                    slNumber: parseInt(currentProduct.slNumber) || 0,
                    disp_order: targetOrder
                })
            }),
            // Update target product with current's order
            fetch(`/api/products/${targetProduct._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: targetProduct.title || '',
                    description: targetProduct.description || '',
                    features: targetProduct.features || '',
                    mrp: parseFloat(targetProduct.mrp) || 0,
                    price: parseFloat(targetProduct.price) || 0,
                    selling_price: parseFloat(targetProduct.selling_price || targetProduct.price) || 0,
                    color: targetProduct.color || '',
                    size: targetProduct.size || '',
                    storage: targetProduct.storage || '',
                    image: targetProduct.image || '',
                    images: targetProduct.images || [],
                    extraImages: targetProduct.extraImages || [],
                    slNumber: parseInt(targetProduct.slNumber) || 0,
                    disp_order: currentOrder
                })
            })
        ]);

        // Update local state
        const newProducts = [...products];
        newProducts[productIndex] = { ...currentProduct, disp_order: targetOrder };
        newProducts[targetIndex] = { ...targetProduct, disp_order: currentOrder };
        
        // Swap positions in array
        [newProducts[productIndex], newProducts[targetIndex]] = [
            newProducts[targetIndex], 
            newProducts[productIndex]
        ];

        setProducts(newProducts);
        addToast('Order updated successfully', { appearance: 'success' });
    } catch (error) {
        console.error('Error updating order:', error);
        addToast('Error updating order', { appearance: 'error' });
    }
};

    const handleCsvUpload = async () => {
        if (!csvFile) {
            addToast('Please select a CSV file', { appearance: 'warning' });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('csvFile', csvFile);

        try {
            const response = await fetch('/api/csvupload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                addToast(`CSV uploaded successfully! ${data.insertedCount} products added`, { appearance: 'success' });
                setCsvFile(null);
                fetchProducts();
            } else {
                addToast(data.message || 'Error uploading CSV', { appearance: 'error' });
            }
        } catch (error) {
            console.error('Error uploading CSV:', error);
            addToast('Network error. Please try again.', { appearance: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return (a.selling_price || a.price) - (b.selling_price || b.price);
            case 'price-high':
                return (b.selling_price || b.price) - (a.selling_price || a.price);
            case 'name-asc':
                return (a.Title || a.title || '').localeCompare(b.Title || b.title || '');
            case 'name-desc':
                return (b.Title || b.title || '').localeCompare(a.Title || a.title || '');
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            default:
                return (a.disp_order || a.slNumber || 0) - (b.disp_order || b.slNumber || 0);
        }
    });

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div style={{ fontSize: '1.0.5rem', fontWeight: '500' }}>Loading Products...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            {/* Navigation */}
             <Navigation/>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.5rem' }}>
                {/* Header Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <p style={{ color: '#64748b', margin: 0 }}>
                                Manage your product catalog - Total: <strong>{sortedProducts.length}</strong>
                            </p>
                        </div>

                        <Link href="/ProductForm" style={{ textDecoration: 'none' }}>
                            <button style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}>
                                <span>➕</span>
                                Add New Product
                            </button>
                        </Link>
                    </div>

                    {/* Search, Sort, and Upload Section */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ flex: '1', minWidth: '250px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
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

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#334155',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="default">📊 Default Order</option>
                            <option value="price-low">💰 Price: Low to High</option>
                            <option value="price-high">💰 Price: High to Low</option>
                            <option value="name-asc">🔤 Name: A to Z</option>
                            <option value="name-desc">🔤 Name: Z to A</option>
                            <option value="newest">🆕 Newest First</option>
                            <option value="oldest">📅 Oldest First</option>
                        </select>

                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', borderRadius: '10px', padding: '0.25rem' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: viewMode === 'grid' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    color: viewMode === 'grid' ? '#667eea' : '#64748b',
                                    boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                📱 Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: viewMode === 'list' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    color: viewMode === 'list' ? '#667eea' : '#64748b',
                                    boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                📋 List
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setCsvFile(e.target.files[0])}
                                style={{ display: 'none' }}
                                id="csvUpload"
                            />
                            <label
                                htmlFor="csvUpload"
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: 'white',
                                    color: '#667eea',
                                    border: '2px solid #667eea',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📄 {csvFile ? csvFile.name.substring(0, 15) + '...' : 'Choose CSV'}
                            </label>
                            {csvFile && (
                                <button
                                    onClick={handleCsvUpload}
                                    disabled={isUploading}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: isUploading ? '#94a3b8' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>⬆️ Upload</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Display */}
                {sortedProducts.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '4rem 0.5rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Products Found</h3>
                        <p style={{ color: '#64748b' }}>
                            {searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {sortedProducts.map((product, index) => {
                            const mainImage = product.image || (product.images && product.images[0]) || product.images;
                            const displayPrice = product.selling_price || product.price || 0;
                            const displayMRP = product.mrp || 0;
                            const discount = displayMRP > displayPrice ? Math.round(((displayMRP - displayPrice) / displayMRP) * 100) : 0;

                            return (
                                <div
                                    key={product._id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <div style={{ position: 'relative', paddingTop: '75%', background: '#f8fafc' }}>
                                        {mainImage && (
                                            <img
                                                src={mainImage}
                                                alt={product.Title || product.title}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.75rem',
                                            left: '0.75rem',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            #{product.slNumber || index + 1}
                                        </div>
                                        {discount > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700'
                                            }}>
                                                {discount}% OFF
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '1.25rem' }}>
                                        <h3 style={{
                                            fontSize: '1.125rem',
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            marginBottom: '0.75rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: '3rem'
                                        }}>
                                            {product.Title || product.title}
                                        </h3>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#667eea' }}>
                                                    ₹{displayPrice}
                                                </span>
                                                {displayMRP > displayPrice && (
                                                    <span style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                        ₹{displayMRP}
                                                    </span>
                                                )}
                                            </div>
                                            {(product.color || product.size || product.storage) && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {[product.color, product.size, product.storage].filter(Boolean).join(' • ')}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    localStorage.setItem('d1', JSON.stringify(product));
                                                    window.location.href = `/ProductForm/${product._id}`;
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.625rem',
                                                    background: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemove(product._id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.625rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleReorder(product._id, 'up')}
                                                disabled={index === 0}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: index === 0 ? '#e2e8f0' : '#f1f5f9',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    color: index === 0 ? '#94a3b8' : '#475569'
                                                }}
                                            >
                                                ⬆️ Move Up
                                            </button>
                                            <button
                                                onClick={() => handleReorder(product._id, 'down')}
                                                disabled={index === sortedProducts.length - 1}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: index === sortedProducts.length - 1 ? '#e2e8f0' : '#f1f5f9',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: index === sortedProducts.length - 1 ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    color: index === sortedProducts.length - 1 ? '#94a3b8' : '#475569'
                                                }}
                                            >
                                                ⬇️ Move Down
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>#</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Image</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Product</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Price</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Details</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProducts.map((product, index) => {
                                    const mainImage = product.image || (product.images && product.images[0]) || product.images;
                                    const displayPrice = product.selling_price || product.price || 0;
                                    const displayMRP = product.mrp || 0;
                                    const discount = displayMRP > displayPrice ? Math.round(((displayMRP - displayPrice) / displayMRP) * 100) : 0;

                                    return (
                                        <tr key={product._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600', color: '#64748b' }}>
                                                {product.slNumber || index + 1}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                                                    {mainImage && (
                                                        <img
                                                            src={mainImage}
                                                            alt={product.Title || product.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                                    {(product.Title || product.title || '').substring(0, 60)}...
                                                </div>
                                                {discount > 0 && (
                                                    <span style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {discount}% OFF
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '700', fontSize: '1.125rem', color: '#667eea', marginBottom: '0.25rem' }}>
                                                    ₹{displayPrice}
                                                </div>
                                                {displayMRP > displayPrice && (
                                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                        ₹{displayMRP}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                                {product.color && <div>🎨 {product.color}</div>}
                                                {product.size && <div>📏 {product.size}</div>}
                                                {product.storage && <div>💾 {product.storage}</div>}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleReorder(product._id, 'up')}
                                                        disabled={index === 0}
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: index === 0 ? '#e2e8f0' : '#667eea',
                                                            color: index === 0 ? '#94a3b8' : 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        ⬆️
                                                    </button>
                                                    <button
                                                        onClick={() => handleReorder(product._id, 'down')}
                                                        disabled={index === sortedProducts.length - 1}
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: index === sortedProducts.length - 1 ? '#e2e8f0' : '#667eea',
                                                            color: index === sortedProducts.length - 1 ? '#94a3b8' : 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: index === sortedProducts.length - 1 ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        ⬇️
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            localStorage.setItem('d1', JSON.stringify(product));
                                                            window.location.href = `/ProductForm/${product._id}`;
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: '#667eea',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(product._id)}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTable;
