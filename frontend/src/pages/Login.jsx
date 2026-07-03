import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, error, setError, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false); // kinematic shake trigger

  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard or previous page
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Clear errors on initial load
  useEffect(() => {
    setError(null);
    setFormError("");
  }, [setError]);

  // Trigger shake animation when any error occurs
  useEffect(() => {
    if (error || formError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error, formError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setError(null);

    // Form validations
    if (!username.trim()) {
      setFormError("Username is required.");
      return;
    }
    if (!password.trim()) {
      setFormError("Password is required.");
      return;
    }

    setSubmitting(true);
    const success = await login(username.trim(), password.trim());
    setSubmitting(false);

    if (success) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page-container">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <div className="brand-badge">
            <span>Blog Management System</span>
          </div>
          <h2 className="login-title">Log in to workspace</h2>
          <p className="login-subtitle">
            Enter your username and password to continue
          </p>
        </div>

        {formError && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input 
                id="username"
                type="text" 
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-submit"
            disabled={submitting}
          >
            <span>{submitting ? "Logging in..." : "Sign In"}</span>
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Only administrators can register workspace accounts. Contact your system administrator to request access.
          </p>
        </div>
      </div>
    </div>
  );
};
