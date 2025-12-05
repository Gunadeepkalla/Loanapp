import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Invalid credentials");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // CASE 1 → Backend returns user info (BEST)
      if (data.user && data.user.role) {
        if (data.user.role === "admin") {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin");
        } else {
          localStorage.setItem("isAdmin", "false");
          navigate("/user-dashboard");
        }
        return;
      }

      // CASE 2 → Backend did NOT send user role → fetch /me
      const meRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: "Bearer " + data.token
        }
      });

      const me = await meRes.json();

      if (me.role === "admin") {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin");
      } else {
        localStorage.setItem("isAdmin", "false");
        navigate("/user-dashboard");
      }

    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Login Form */}
      <div className="login-left">
        <div className="login-content">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          <div className="login-form-wrapper">
            <h1 className="login-title">Login</h1>
            <p className="login-subtitle">See your growth and get consulting support!</p>

            {/* Google Sign In */}
            <button type="button" className="google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="divider">
              <span>or Sign in with Email</span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@website.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password*</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 character"
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forget password?
                </Link>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-btn">
                Login
              </button>

              <p className="register-link">
                Not registered yet? <Link to="/register">Create an Account</Link>
              </p>
            </form>
          </div>

          <p className="footer-text">©2020 Vasu Consultancy. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="login-right">
        <div className="decorative-blocks">
          <div className="block block-1"></div>
          <div className="block block-2"></div>
          <div className="block block-3"></div>
          <div className="block block-4"></div>
          <div className="block block-5"></div>
        </div>

        {/* Social Icons */}

        {/* Main Content */}
        <div className="showcase-content">
          {/* Revenue Card */}
          <div className="revenue-card">
            <div className="revenue-header">
              <div>
                <div className="revenue-amount">$ 162,751</div>
                <div className="revenue-label">Last year</div>
              </div>
            </div>

            <div className="chart-container">
              <svg viewBox="0 0 300 100" className="chart-svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 L 50 70 L 100 60 L 150 40 L 200 50 L 250 30 L 300 45"
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth="3"
                />
                <path
                  d="M 0 80 L 50 70 L 100 60 L 150 40 L 200 50 L 250 30 L 300 45 L 300 100 L 0 100 Z"
                  fill="url(#chartGradient)"
                />
              </svg>

              <div className="chart-labels">
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
              </div>
            </div>

            <div className="chart-indicator">
              <div className="indicator-value">$ 23,827</div>
              <div className="indicator-label">August</div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="rewards-card">
            <div className="rewards-title">Rewards</div>
            <div className="rewards-content">
              <div className="rewards-avatar">
                <div className="avatar-ring">
                  <div className="avatar-circle"></div>
                </div>
              </div>
              <div className="rewards-info">
                <div className="rewards-label">Points</div>
                <div className="rewards-points">172,832</div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="tagline-section">
            <h2 className="tagline-title">
              Turn your ideas<br/>into reality.
            </h2>
            <p className="tagline-text">
              Consistent quality and experience across<br/>all platforms and devices.
            </p>

            <div className="pagination-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>

        {/* Arrow Navigation */}
        <button className="arrow-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}