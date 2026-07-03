import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleNewPostClick = () => {
    if (onClose) onClose();
    if (!user) {
      navigate('/login');
    } else {
      navigate('/new-post');
    }
  };

  return (
    <>
      {/* Blurred overlay backdrop on mobile when drawer is active */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-action">
          <button className="btn btn-primary btn-new-post" onClick={handleNewPostClick}>
            <Plus size={18} />
            <span>New Post</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">Workspace</p>
          
          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user-badge">
              <span className="user-badge-text">Logged in as {user.username}</span>
            </div>
          ) : (
            <div className="sidebar-user-badge logged-out">
              <span className="user-badge-text">Viewing as Guest</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
