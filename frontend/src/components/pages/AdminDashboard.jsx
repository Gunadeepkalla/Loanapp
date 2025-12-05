// src/components/pages/AdminDashboard.jsx
import React from "react";
import "../../styles/admin.css";
import AdminApplications from "./AdminApplications";

export default function AdminDashboard() {
  const name = localStorage.getItem("role") === "admin" ? "Admin" : "User";

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="logo-circle">L</div>
          <div>
            <h3>Loanify</h3>
            <p className="small">Admin Panel</p>
          </div>
        </div>

        <nav className="side-nav">
          <a className="active">Dashboard</a>
          <a href="/admin/applications">Applications</a>
          <a href="/admin/loans">Loans</a>
          <a href="/admin/settings">Settings</a>
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="topbar">
          <div className="search-box">
            <input placeholder="Search by name, id, type..." />
          </div>
          <div className="profile">
            <div className="avatar">{name?.charAt(0)}</div>
            <div className="profile-info">
              <div className="profile-name">Hello, {name}</div>
              <div className="profile-role">Administrator</div>
            </div>
          </div>
        </header>

        <section className="content-area">
          <h1 className="page-title">Loan Applications</h1>
          <p className="page-sub">Review and manage user loan submissions.</p>

          <AdminApplications />
        </section>
      </main>
    </div>
  );
}
