import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, LogIn, Sun, Moon, Menu, X, ArrowLeft } from 'lucide-react';

export const Navbar = ({ searchPlaceholder = "Search posts...", onSearch, onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false); // Mobile search overlay toggle
  
  // Theme state persistent in localStorage (Default: dark mode)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const enableMobileSearch = () => {
    setMobileSearchActive(true);
  };

  const disableMobileSearch = () => {
    setMobileSearchActive(false);
    setSearchVal("");
    if (onSearch) onSearch(""); // Reset search on close
  };

  return (
    <header className={`topnav ${isSearchFocused ? 'search-focused' : ''}`}>
      {/* Mobile Full-Width Search Overlay */}
      {mobileSearchActive && (
        <div className="mobile-search-overlay">
          <button 
            type="button" 
            className="mobile-search-back-btn" 
            onClick={disableMobileSearch}
            aria-label="Exit search"
          >
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            placeholder={searchPlaceholder} 
            value={searchVal}
            onChange={handleSearchChange}
            className="mobile-search-input"
            autoFocus
          />
        </div>
      )}

      {/* Hamburger menu button (Visible on mobile/tablet) */}
      <button 
        type="button"
        className="mobile-menu-toggle" 
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="topnav-brand">
        <Link to="/" className="brand-logo">
          Blog Management System
        </Link>
      </div>

      {/* Desktop Search Bar (Hidden on mobile) */}
      <div className="topnav-search desktop-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder={searchPlaceholder} 
          value={searchVal}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="search-input"
        />
      </div>

      <div className="topnav-actions">
        {/* Mobile Search Trigger Icon (Visible only on mobile) */}
        <button 
          type="button" 
          className="mobile-search-trigger-btn"
          onClick={enableMobileSearch}
          title="Search workspace"
        >
          <Search size={18} />
        </button>

        {/* Theme Switcher Button */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="profile-menu-container">
            <button 
              className="profile-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="username">{user.username}</span>
              <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)}></div>
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="user-display-name">{user.username}</p>
                    <p className="user-email">{user.email || 'No email provided'}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-link">
            <LogIn size={16} />
            <span>Log In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
