import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  const loanTypes = [
    { name: "Vehicle Loan", icon: "🚗", type: "vehicle" },
    { name: "House Loan", icon: "🏠", type: "house" },
    { name: "Education Loan", icon: "🎓", type: "education" },
    { name: "Personal Loan", icon: "💰", type: "personal" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="user-container">
      {/* Sidebar */}
      <aside className="user-sidebar">
        <h2 className="user-logo">User Panel</h2>

        <nav className="user-nav">
          <p onClick={() => navigate("/apply-loan")}>Apply Loan</p>
          <p onClick={() => navigate("/my-applications")}>My Applications</p>
          <p onClick={handleLogout} className="logout-btn">Logout</p>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="user-main">
        <section className="user-welcome">
          <h1>Welcome User 👋</h1>
          <p>Select a loan type and apply easily.</p>
        </section>

        {/* Loan Cards */}
        <section className="loan-card-section">
          {loanTypes.map((loan, index) => (
            <div
              key={index}
              className="loan-card"
              onClick={() => navigate(`/apply-loan?type=${loan.type}`)}
            >
              <span className="loan-icon">{loan.icon}</span>
              <h3>{loan.name}</h3>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
