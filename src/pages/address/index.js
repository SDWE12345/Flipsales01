"use client";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FaCheckCircle, FaMapMarkerAlt, FaPhone, FaUser, FaHome, FaRoad } from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";
import tracking from "@/utils/tracking";

const Address = () => {
    const router = useRouter();
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // FIXED: Load cart from localStorage (not sessionStorage)
    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length > 0) {
            tracking.trackInitiateCheckout(cart);
        }
    }, []);

    const validateForm = (values) => {
        const newErrors = {};
        
        if (!values.fname.trim()) {
            newErrors.fname = "Full name is required";
        } else if (values.fname.trim().length < 3) {
            newErrors.fname = "Name must be at least 3 characters";
        }

        if (!values.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(values.mobile)) {
            newErrors.mobile = "Enter valid 10-digit mobile number";
        }

        if (!values.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(values.pincode)) {
            newErrors.pincode = "Enter valid 6-digit pincode";
        }

        if (!values.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!values.state) {
            newErrors.state = "Please select a state";
        }

        if (!values.house.trim()) {
            newErrors.house = "House/Building details required";
        }

        return newErrors;
    };

    const { values, handleChange, handleSubmit } = useFormik({
        initialValues: {
            fname: "",
            mobile: "",
            pincode: "",
            city: "",
            state: "",
            house: "",
        },
        onSubmit: (values) => {
            const validationErrors = validateForm(values);
            
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setTouched({
                    fname: true,
                    mobile: true,
                    pincode: true,
                    city: true,
                    state: true,
                    house: true,
                });
                const firstErrorField = Object.keys(validationErrors)[0];
                document.getElementById(firstErrorField)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                return;
            }

            setErrors({});
            
            // Save user data
            localStorage.setItem("user", JSON.stringify({
                address: `${values.house}, ${values.city}, ${values.state} - ${values.pincode}`,
                name: values.fname,
                phone: Number(values.mobile),
            }));

            // FIXED: Identify user with proper data structure
            tracking.identifyUser({
                email: values?.email || "",
                phone: values.mobile,
                firstName: values.fname.split(' ')[0],
                lastName: values.fname.split(' ').slice(1).join(' '),
                city: values.city,
                state: values.state,
                zip: values.pincode,
                country: 'IN'
            });

            // FIXED: Track custom event for address completion
            tracking.trackCustomEvent('AddressCompleted', {
                has_city: !!values.city,
                has_state: !!values.state,
                has_pincode: !!values.pincode
            });

            router.push("/ordersummdary");
        },
    });

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        handleChange(e);
        
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const fieldErrors = validateForm(values);
        if (fieldErrors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
        }
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
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
                    <h1 style={{ 
                        color: '#fff', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '0.3px'
                    }}>
                        Add Delivery Address
                    </h1>
                </div>
            </header>

            {/* Progress Stepper */}
            <div style={{ 
                background: '#fff', 
                padding: '16px 12px',
                marginBottom: '12px',
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
                            width: '0%',
                            background: 'linear-gradient(90deg, #0349b8, #5b8def)',
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '2px'
                        }} />
                    </div>

                    <div style={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        flex: 1
                    }}>
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
                            1
                        </div>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#0349b8', 
                            fontWeight: '600',
                            lineHeight: '1.3'
                        }}>
                            Address
                        </div>
                    </div>

                    <div style={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        flex: 1
                    }}>
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
                            fontSize: '14px',
                            transition: 'all 0.3s'
                        }}>
                            2
                        </div>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#9e9e9e',
                            fontWeight: '500',
                            lineHeight: '1.3'
                        }}>
                            Order Summary
                        </div>
                    </div>

                    <div style={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        flex: 1
                    }}>
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
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#9e9e9e',
                            fontWeight: '500',
                            lineHeight: '1.3'
                        }}>
                            Payment
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div style={{ 
                maxWidth: '600px', 
                margin: '0 auto',
                padding: '0 12px 12px'
            }}>
                <form onSubmit={handleSubmit}>
                    {/* Contact Details Card */}
                    <div style={{ 
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginBottom: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '14px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid #f5f5f5'
                        }}>
                            <FaUser style={{ color: '#0349b8', fontSize: '14px' }} />
                            <h2 style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                margin: 0,
                                color: '#212121'
                            }}>
                                Contact Details
                            </h2>
                        </div>

                        {/* Full Name */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '6px',
                                color: '#212121'
                            }}>
                                Full Name <span style={{ color: '#ff5722' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    id="fname"
                                    name="fname"
                                    value={values.fname}
                                    onChange={handleFieldChange}
                                    placeholder="Enter your full name"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        fontSize: '13px',
                                        border: errors.fname && touched.fname ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        background: '#fafafa',
                                        color: '#212121',
                                        fontWeight: '500'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '2px solid #0349b8';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        handleBlur('fname');
                                        e.target.style.border = errors.fname && touched.fname ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                        e.target.style.background = '#fafafa';
                                    }}
                                />
                                {values.fname && !errors.fname && (
                                    <FaCheckCircle style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#388e3c',
                                        fontSize: '16px'
                                    }} />
                                )}
                            </div>
                            {errors.fname && touched.fname && (
                                <div style={{ 
                                    color: '#ff5722', 
                                    fontSize: '11px', 
                                    marginTop: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500'
                                }}>
                                    <span style={{ fontSize: '12px' }}>⚠</span> {errors.fname}
                                </div>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div style={{ marginBottom: '4px' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '6px',
                                color: '#212121'
                            }}>
                                Mobile Number <span style={{ color: '#ff5722' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="tel"
                                    id="mobile"
                                    name="mobile"
                                    value={values.mobile}
                                    onChange={handleFieldChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        fontSize: '13px',
                                        border: errors.mobile && touched.mobile ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        background: '#fafafa',
                                        color: '#212121',
                                        fontWeight: '500'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '2px solid #0349b8';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        handleBlur('mobile');
                                        e.target.style.border = errors.mobile && touched.mobile ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                        e.target.style.background = '#fafafa';
                                    }}
                                />
                                {values.mobile && !errors.mobile && values.mobile.length === 10 && (
                                    <FaCheckCircle style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#388e3c',
                                        fontSize: '16px'
                                    }} />
                                )}
                            </div>
                            {errors.mobile && touched.mobile && (
                                <div style={{ 
                                    color: '#ff5722', 
                                    fontSize: '11px', 
                                    marginTop: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500'
                                }}>
                                    <span style={{ fontSize: '12px' }}>⚠</span> {errors.mobile}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address Details Card */}
                    <div style={{ 
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '14px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid #f5f5f5'
                        }}>
                            <FaMapMarkerAlt style={{ color: '#0349b8', fontSize: '14px' }} />
                            <h2 style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                margin: 0,
                                color: '#212121'
                            }}>
                                Address Details
                            </h2>
                        </div>

                        {/* Pincode */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '6px',
                                color: '#212121'
                            }}>
                                Pincode <span style={{ color: '#ff5722' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    id="pincode"
                                    name="pincode"
                                    value={values.pincode}
                                    onChange={handleFieldChange}
                                    placeholder="6-digit pincode"
                                    maxLength="6"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        fontSize: '13px',
                                        border: errors.pincode && touched.pincode ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        background: '#fafafa',
                                        color: '#212121',
                                        fontWeight: '500'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '2px solid #0349b8';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        handleBlur('pincode');
                                        e.target.style.border = errors.pincode && touched.pincode ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                        e.target.style.background = '#fafafa';
                                    }}
                                />
                                {values.pincode && !errors.pincode && values.pincode.length === 6 && (
                                    <FaCheckCircle style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#388e3c',
                                        fontSize: '16px'
                                    }} />
                                )}
                            </div>
                            {errors.pincode && touched.pincode && (
                                <div style={{ 
                                    color: '#ff5722', 
                                    fontSize: '11px', 
                                    marginTop: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500'
                                }}>
                                    <span style={{ fontSize: '12px' }}>⚠</span> {errors.pincode}
                                </div>
                            )}
                        </div>

                        {/* City and State */}
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginBottom: '14px'
                        }}>
                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginBottom: '6px',
                                    color: '#212121'
                                }}>
                                    City <span style={{ color: '#ff5722' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={values.city}
                                        onChange={handleFieldChange}
                                        placeholder="City name"
                                        style={{
                                            width: '100%',
                                            padding: '11px 14px',
                                            fontSize: '13px',
                                            border: errors.city && touched.city ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            background: '#fafafa',
                                            color: '#212121',
                                            fontWeight: '500'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.border = '2px solid #0349b8';
                                            e.target.style.background = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            handleBlur('city');
                                            e.target.style.border = errors.city && touched.city ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                            e.target.style.background = '#fafafa';
                                        }}
                                    />
                                </div>
                                {errors.city && touched.city && (
                                    <div style={{ 
                                        color: '#ff5722', 
                                        fontSize: '10px', 
                                        marginTop: '4px',
                                        fontWeight: '500'
                                    }}>
                                        ⚠ {errors.city}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginBottom: '6px',
                                    color: '#212121'
                                }}>
                                    State <span style={{ color: '#ff5722' }}>*</span>
                                </label>
                                <select
                                    id="state"
                                    name="state"
                                    value={values.state}
                                    onChange={handleFieldChange}
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        fontSize: '13px',
                                        border: errors.state && touched.state ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        background: '#fafafa',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        color: values.state ? '#212121' : '#999',
                                        fontWeight: '500'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '2px solid #0349b8';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        handleBlur('state');
                                        e.target.style.border = errors.state && touched.state ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                        e.target.style.background = '#fafafa';
                                    }}
                                >
                                    <option value="">Select State</option>
                                    <option value="AP">Andhra Pradesh</option>
                                    <option value="AR">Arunachal Pradesh</option>
                                    <option value="AS">Assam</option>
                                    <option value="BR">Bihar</option>
                                    <option value="CT">Chhattisgarh</option>
                                    <option value="GA">Goa</option>
                                    <option value="GJ">Gujarat</option>
                                    <option value="HR">Haryana</option>
                                    <option value="HP">Himachal Pradesh</option>
                                    <option value="JK">Jammu &amp; Kashmir</option>
                                    <option value="JH">Jharkhand</option>
                                    <option value="KA">Karnataka</option>
                                    <option value="KL">Kerala</option>
                                    <option value="MP">Madhya Pradesh</option>
                                    <option value="MH">Maharashtra</option>
                                    <option value="MN">Manipur</option>
                                    <option value="ML">Meghalaya</option>
                                    <option value="MZ">Mizoram</option>
                                    <option value="NL">Nagaland</option>
                                    <option value="OR">Odisha</option>
                                    <option value="PB">Punjab</option>
                                    <option value="RJ">Rajasthan</option>
                                    <option value="SK">Sikkim</option>
                                    <option value="TN">Tamil Nadu</option>
                                    <option value="TS">Telangana</option>
                                    <option value="TR">Tripura</option>
                                    <option value="UK">Uttarakhand</option>
                                    <option value="UP">Uttar Pradesh</option>
                                    <option value="WB">West Bengal</option>
                                    <option value="AN">Andaman &amp; Nicobar</option>
                                    <option value="CH">Chandigarh</option>
                                    <option value="DN">Dadra and Nagar Haveli</option>
                                    <option value="DD">Daman &amp; Diu</option>
                                    <option value="DL">Delhi</option>
                                    <option value="LD">Lakshadweep</option>
                                    <option value="PY">Puducherry</option>
                                </select>
                                {errors.state && touched.state && (
                                    <div style={{ 
                                        color: '#ff5722', 
                                        fontSize: '10px', 
                                        marginTop: '4px',
                                        fontWeight: '500'
                                    }}>
                                        ⚠ {errors.state}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* House/Building */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '6px',
                                color: '#212121'
                            }}>
                                House No., Building Name <span style={{ color: '#ff5722' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="house"
                                name="house"
                                value={values.house}
                                onChange={handleFieldChange}
                                placeholder="Flat, House No., Building, Company"
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    fontSize: '13px',
                                    border: errors.house && touched.house ? '2px solid #ff5722' : '2px solid #e8e8e8',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: '#fafafa',
                                    color: '#212121',
                                    fontWeight: '500'
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = '2px solid #0349b8';
                                    e.target.style.background = '#fff';
                                }}
                                onBlur={(e) => {
                                    handleBlur('house');
                                    e.target.style.border = errors.house && touched.house ? '2px solid #ff5722' : '2px solid #e8e8e8';
                                    e.target.style.background = '#fafafa';
                                }}
                            />
                            {errors.house && touched.house && (
                                <div style={{ 
                                    color: '#ff5722', 
                                    fontSize: '11px', 
                                    marginTop: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500'
                                }}>
                                    <span style={{ fontSize: '12px' }}>⚠</span> {errors.house}
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #ff6200 0%, #ff5200 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            marginTop: '12px',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 16px rgba(255,98,0,0.35)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,98,0,0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,98,0,0.35)';
                        }}
                    >
                        Save Address & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Address;