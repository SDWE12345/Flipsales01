import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ProductForm = () => {
    const router = useRouter();
    const { id } = router.query;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            features: '',
            mrp: '',
            price: '',
            color: '',
            size: '',
            storage: '',
            image: '',
            images: ['', '', '', '', ''],
            extraImages: ['', ''],
            slNumber: '',
            disp_order: ''
        },
        validate: (values) => {
            const errors = {};
            if (!values.title.trim()) errors.title = 'Title is required';
            if (!values.price) errors.price = 'Price is required';
            if (!values.mrp) errors.mrp = 'MRP is required';
            if (values.price && values.mrp && parseFloat(values.price) > parseFloat(values.mrp)) {
                errors.price = 'Selling price cannot be greater than MRP';
            }
            if (!values.image && values.images.every(img => !img)) {
                errors.image = 'At least one image is required';
            }
            return errors;
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const productData = {
                    title: values.title,
                    description: values.description,
                    features: values.features,
                    mrp: parseFloat(values.mrp) || 0,
                    price: parseFloat(values.price) || 0,
                    selling_price: parseFloat(values.price) || 0,
                    color: values.color,
                    size: values.size,
                    storage: values.storage,
                    image: values.image,
                    images: values.images.filter(img => img && img.trim() !== ''),
                    extraImages: values.extraImages.filter(img => img && img.trim() !== ''),
                    slNumber: parseInt(values.slNumber) || 0,
                    disp_order: parseInt(values.disp_order || values.slNumber) || 0
                };

                const url = isEditMode ? `/api/products/${id}` : '/api/products';
                const method = isEditMode ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productData),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success(
                        isEditMode ? 'Product updated successfully!' : 'Product added successfully!',
                        {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );

                    setTimeout(() => {
                        router.push('/Producttable');
                    }, 2000);
                } else {
                    toast.error(data.message || 'Error submitting product', {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Network error. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                });
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // Load product data if editing
    useEffect(() => {
        const loadProductData = async () => {
            if (!id) return;
            
            setIsEditMode(true);
            setIsLoading(true);
            
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                
                const product = await response.json();
                
                // Normalize array fields to ensure they have the correct length
                const normalizeImageArray = (arr, length) => {
                    if (!arr || !Array.isArray(arr)) return Array(length).fill('');
                    const normalized = [...arr];
                    while (normalized.length < length) normalized.push('');
                    return normalized.slice(0, length);
                };
                
                // Map API data to form fields with proper fallbacks
                formik.setValues({
                    title: product.title || '',
                    description: product.description || '',
                    features: product.features || '',
                    mrp: product.mrp?.toString() || '',
                    price: (product.price || product.selling_price)?.toString() || '',
                    color: product.color || '',
                    size: product.size || '',
                    storage: product.storage || '',
                    image: product.image || '',
                    images: normalizeImageArray(product.images, 5),
                    extraImages: normalizeImageArray(product.extraImages, 2),
                    slNumber: product.slNumber?.toString() || '',
                    disp_order: (product.disp_order || product.slNumber)?.toString() || ''
                });
                
            } catch (error) {
                console.error('Error loading product:', error);
                toast.error('Error loading product data', {
                    position: "top-right",
                    autoClose: 5000,
                });
                router.push('/Producttable');
            } finally {
                setIsLoading(false);
            }
        };

        loadProductData();
    }, [id]); // Fixed: removed router from dependencies to avoid infinite loop

    // Handle image URL input changes
    const handleImageChange = (index, value) => {
        const newImages = [...formik.values.images];
        newImages[index] = value;
        formik.setFieldValue('images', newImages);
    };

    // Handle extra image changes
    const handleExtraImageChange = (index, value) => {
        const newExtraImages = [...formik.values.extraImages];
        newExtraImages[index] = value;
        formik.setFieldValue('extraImages', newExtraImages);
    };

    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading product data...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Navigation */}
                <nav className="admin-nav">
                    <div className="nav-container">
                        <div className="nav-content">
                            <div className="brand">Admin Dashboard</div>
                            <div className="nav-links">
                                <Link href="/Producttable" className="nav-link">
                                    Products
                                </Link>
                                <Link href="/settings" className="nav-link">
                                    Settings
                                </Link>
                                {isEditMode && (
                                    <Link href="/Producttable">
                                        <button className="back-button">
                                            ← Back
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="main-container">
                    <div className="page-header">
                        <h1 className="page-title">
                            {isEditMode ? '✏️ Edit Product' : '➕ Add New Product'}
                        </h1>
                        <p className="page-subtitle">
                            {isEditMode ? 'Update the product details below' : 'Fill in all the required product information'}
                        </p>
                    </div>

                    <div className="form-container">
                        <form onSubmit={formik.handleSubmit}>
                            {/* Basic Information */}
                            <section className="form-section">
                                <div className="section-header">
                                    <span className="section-icon">📋</span>
                                    <h2 className="section-title">Basic Information</h2>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Product Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter product title"
                                        className={`form-input ${formik.errors.title && formik.touched.title ? 'error' : ''}`}
                                    />
                                    {formik.errors.title && formik.touched.title && (
                                        <div className="error-message">{formik.errors.title}</div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            placeholder="Enter product description"
                                            rows="3"
                                            className="form-input form-textarea"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Features</label>
                                        <textarea
                                            name="features"
                                            value={formik.values.features}
                                            onChange={formik.handleChange}
                                            placeholder="Enter product features (one per line or HTML)"
                                            rows="3"
                                            className="form-input form-textarea"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={formik.values.color}
                                            onChange={formik.handleChange}
                                            placeholder="e.g., Silver, Black"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Size</label>
                                        <input
                                            type="text"
                                            name="size"
                                            value={formik.values.size}
                                            onChange={formik.handleChange}
                                            placeholder="e.g., 1.5 Litres"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Storage / Capacity</label>
                                        <input
                                            type="text"
                                            name="storage"
                                            value={formik.values.storage}
                                            onChange={formik.handleChange}
                                            placeholder="e.g., 350 ml"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Pricing */}
                            <section className="form-section">
                                <div className="section-header">
                                    <span className="section-icon">💰</span>
                                    <h2 className="section-title">Pricing</h2>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">MRP (₹)</label>
                                        <input
                                            type="number"
                                            name="mrp"
                                            value={formik.values.mrp}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="e.g., 2154"
                                            className={`form-input ${formik.errors.mrp && formik.touched.mrp ? 'error' : ''}`}
                                        />
                                        {formik.errors.mrp && formik.touched.mrp && (
                                            <div className="error-message">{formik.errors.mrp}</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formik.values.price}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="e.g., 299"
                                            className={`form-input ${formik.errors.price && formik.touched.price ? 'error' : ''}`}
                                        />
                                        {formik.errors.price && formik.touched.price && (
                                            <div className="error-message">{formik.errors.price}</div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Display Order</label>
                                        <input
                                            type="number"
                                            name="slNumber"
                                            value={formik.values.slNumber}
                                            onChange={formik.handleChange}
                                            placeholder="e.g., 1"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {formik.values.mrp && formik.values.price && (
                                    <div className="price-display">
                                        <span className="discount-badge">
                                            💡 {Math.round(((formik.values.mrp - formik.values.price) / formik.values.mrp) * 100)}% OFF
                                        </span>
                                        <span className="savings-display">
                                            Save ₹{formik.values.mrp - formik.values.price}
                                        </span>
                                    </div>
                                )}
                            </section>

                            {/* Images */}
                            <section className="form-section">
                                <div className="section-header">
                                    <span className="section-icon">🖼️</span>
                                    <h2 className="section-title">Product Images</h2>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Main Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formik.values.image}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="/images/product-8-main.jpeg"
                                        className={`form-input ${formik.errors.image && formik.touched.image ? 'error' : ''}`}
                                    />
                                    {formik.errors.image && formik.touched.image && (
                                        <div className="error-message">{formik.errors.image}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Additional Images</label>
                                    <div className="image-grid">
                                        {formik.values.images.map((img, index) => (
                                            <div key={index} className="image-grid-item">
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                                    placeholder={`Image ${index + 1}`}
                                                    className="form-input mb-2"
                                                />
                                                {img && (
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Extra Images (WebP)</label>
                                    <div className="image-grid">
                                        {formik.values.extraImages.map((img, index) => (
                                            <div key={`extra-${index}`} className="image-grid-item">
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => handleExtraImageChange(index, e.target.value)}
                                                    placeholder={`Extra ${index + 1}`}
                                                    className="form-input mb-2"
                                                />
                                                {img && (
                                                    <img
                                                        src={img}
                                                        alt={`Extra preview ${index + 1}`}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Submit Button */}
                            <div className="form-group">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="submit-button"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            </svg>
                                            {isEditMode ? 'Updating Product...' : 'Adding Product...'}
                                        </>
                                    ) : (
                                        <>
                                            {isEditMode ? '💾 Update Product' : '✅ Add Product'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* JSON Preview */}
                        <details className="json-preview">
                            <summary>JSON Preview (Debug)</summary>
                            <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductForm;