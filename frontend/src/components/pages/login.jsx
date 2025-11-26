import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      alert("Login Successful!");

      // redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      alert("Login failed. Try again.");
    }
  };

  return (
   <div className="login-page">
  <div className="login-container">
    <h2 className="company-title">Loan Consultancy</h2>

    <form onSubmit={handleLogin} className="login-form">
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" className="login-btn">Login</button>
    </form>

    <p className="register-text">
      Don’t have an account?{" "}
      <Link to="/register" className="register-link">Register</Link>
    </p>
  </div>
</div>

  );
}
