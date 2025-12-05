import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Registration failed");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", "false");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-card" onSubmit={handleRegister}>
        <h2 className="register-title">Register</h2>

        <input
          type="text"
          className="register-input"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          className="register-input"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="register-input"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="register-error">{error}</p>}

        <button className="register-btn" type="submit">
          Register
        </button>

        <p className="register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
