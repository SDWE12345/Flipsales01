import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Navigation = () => {
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        router.push('/login');
    };

    const NavLink = ({ href, icon, children }) => {
        const isActive = router.pathname === href;
        
        return (
            <Link href={href} style={{ textDecoration: 'none' }}>
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '8px',
                        color: isActive ? '#667eea' : '#64748b',
                        background: isActive ? '#f0f4ff' : 'transparent',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#334155';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#64748b';
                        }
                    }}
                >
                    <span>{icon}</span>
                    <span className="nav-text">{children}</span>
                </div>
            </Link>
        );
    };

    return (
        <>
            <nav style={{
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: '1rem',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    gap: '1rem'
                }}>
                    {/* Logo */}
                    <h2 style={{ 
                        margin: 0, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700',
                        fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                        whiteSpace: 'nowrap'
                    }}>
                        🛍️ <span className="logo-text">Admin Panel</span>
                        <span className="logo-text-mobile">Admin</span>
                    </h2>

                    {/* Desktop Navigation */}
                    <div className="desktop-nav" style={{ 
                        display: 'flex', 
                        gap: '0.5rem' 
                    }}>
                        <NavLink href="/Producttable" icon="📦">
                            Products
                        </NavLink>
                        <NavLink href="/settings" icon="⚙️">
                            Settings
                        </NavLink>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="desktop-nav" style={{ 
                        display: 'flex',
                        alignItems: 'center', 
                        gap: '1rem' 
                    }}>
                        {/* User Info */}
                        <div className="user-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 1rem',
                            background: '#f8fafc',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}>
                                A
                            </div>
                            <span className="user-name" style={{ 
                                color: '#334155', 
                                fontWeight: '500',
                                fontSize: '0.875rem'
                            }}>
                                Admin
                            </span>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid #e2e8f0',
                                color: '#64748b',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.borderColor = '#fecaca';
                                e.currentTarget.style.color = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.color = '#64748b';
                            }}
                        >
                            🚪 <span className="logout-text">Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {mobileMenuOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="mobile-menu" style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e2e8f0',
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.5rem' 
                        }}>
                            <NavLink href="/Producttable" icon="📦">
                                Products
                            </NavLink>
                            <NavLink href="/settings" icon="⚙️">
                                Settings
                            </NavLink>
                            
                            {/* User Info Mobile */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1.25rem',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '0.875rem'
                                }}>
                                    A
                                </div>
                                <span style={{ 
                                    color: '#334155', 
                                    fontWeight: '500',
                                    fontSize: '0.875rem'
                                }}>
                                    Admin User
                                </span>
                            </div>

                            {/* Logout Button Mobile */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowLogoutConfirm(true);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    marginTop: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={() => setShowLogoutConfirm(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: 'clamp(1.5rem, 4vw, 2rem)',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        animation: 'scaleIn 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ 
                            margin: '0 0 1rem 0', 
                            color: '#1e293b',
                            fontSize: 'clamp(1.1rem, 4vw, 1.25rem)'
                        }}>
                            Confirm Logout
                        </h3>
                        <p style={{ 
                            color: '#64748b', 
                            margin: '0 0 1.5rem 0',
                            lineHeight: '1.6',
                            fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                        }}>
                            Are you sure you want to logout? You'll need to login again to access the admin panel.
                        </p>
                        <div className="modal-actions" style={{ 
                            display: 'flex', 
                            gap: '0.75rem', 
                            justifyContent: 'flex-end' 
                        }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#dc2626',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#b91c1c';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#dc2626';
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .logo-text-mobile {
                    display: none;
                }

                .mobile-menu {
                    display: none;
                }

                @media (max-width: 768px) {
                    nav {
                        padding: 0.75rem 1rem !important;
                    }

                    .desktop-nav {
                        display: none !important;
                    }

                    .mobile-menu-btn {
                        display: flex !important;
                    }

                    .mobile-menu {
                        display: block;
                    }

                    .logo-text {
                        display: none;
                    }

                    .logo-text-mobile {
                        display: inline;
                    }
                }

                @media (max-width: 900px) {
                    .user-name {
                        display: none !important;
                    }
                }

                @media (max-width: 640px) {
                    .nav-text,
                    .logout-text {
                        display: none !important;
                    }
                }

                @media (max-width: 480px) {
                    .modal-actions {
                        flex-direction: column !important;
                    }

                    .modal-actions button {
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Navigation;