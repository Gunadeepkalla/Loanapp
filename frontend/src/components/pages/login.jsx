import React, { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ IMPORT THIS
import "../../styles/login.css";

export default function Login() {
  const navigate = useNavigate();  // ✅ USE IT HERE

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login Response:", data);

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Login Successful");
      navigate("/dashboard");   // 👉 now it works without crashes
    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  };

  return (
    <div className="login-container">
      <h1 className="company-title">Vasu Loan Consultancy</h1>

      <div className="login-card">
        <h2 className="login-heading">Login</h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}
