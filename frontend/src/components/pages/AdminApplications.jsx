// src/components/pages/AdminApplications.jsx
import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line
  }, []);

  async function fetchApps() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.applications);
      else setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch apps error:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  function statusClass(status) {
    if (!status) return "badge-neutral";
    const s = status.toLowerCase();
    if (s.includes("approve")) return "badge-approved";
    if (s.includes("reject")) return "badge-rejected";
    return "badge-pending";
  }

  async function updateStatus(id, status) {
    if (!window.confirm(`Are you sure you want to mark this application as '${status}'?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.msg || `Application ${status}`);
        setSelected(null);
        fetchApps();
      } else {
        alert(data.msg || "Failed to update");
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("Network error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="apps-wrap">
      {loading ? (
        <div className="loader">Loading applications...</div>
      ) : (
        <>
          <div className="apps-grid">
            {applications.length === 0 && <div className="empty">No applications found.</div>}

            {applications.map((app) => (
              <div className="app-card" key={app.id} onClick={() => setSelected(app)}>
                <div className="card-top">
                  <div className="loan-type">{app.loan_type}</div>
                  <div className={["status-badge", statusClass(app.status)].join(" ")}>{app.status}</div>
                </div>

                <div className="card-body">
                  <h3 className="app-name">{app.full_name || `User ${app.user_id}`}</h3>
                  <p className="muted">Applied: {new Date(app.created_at || app.applied_on).toLocaleString()}</p>

                  <div className="meta-row">
                    <span>Amt: ₹{app.salary ?? "-"}</span>
                    <span>Phone: {app.phone ?? "-"}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button className="btn view-btn" onClick={(e) => { e.stopPropagation(); setSelected(app); }}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selected && (
            <div className="modal-backdrop" onClick={() => { if (!actionLoading) setSelected(null); }}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Application #{selected.id}</h2>
                  <div className={["status-badge", statusClass(selected.status)].join(" ")}>{selected.status}</div>
                </div>

                <div className="modal-body">
                  <div className="modal-grid">
                    <div>
                      <p><strong>Name:</strong> {selected.full_name}</p>
                      <p><strong>Type:</strong> {selected.loan_type}</p>
                      <p><strong>Phone:</strong> {selected.phone}</p>
                      <p><strong>Address:</strong> {selected.address}</p>
                      <p><strong>Salary:</strong> ₹{selected.salary}</p>
                      <p><strong>Applied:</strong> {new Date(selected.created_at || selected.applied_on).toLocaleString()}</p>
                    </div>

                    <div>
                      <h4>Documents</h4>
                      {selected.documents ? (
                        <ul className="doc-list">
                          {Object.entries(selected.documents).map(([k, v]) => (
                            v ? (
                              <li key={k}>
                                <strong>{k}:</strong>{" "}
                                <a href={`http://localhost:5000/uploads/${v}`} target="_blank" rel="noreferrer">
                                  {v}
                                </a>
                              </li>
                            ) : (
                              <li key={k}><strong>{k}:</strong> —</li>
                            )
                          ))}
                        </ul>
                      ) : (
                        <p className="muted">No documents uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn approve"
                    disabled={actionLoading}
                    onClick={() => updateStatus(selected.id, "approved")}
                  >
                    {actionLoading ? "Working..." : "Approve"}
                  </button>

                  <button
                    className="btn reject"
                    disabled={actionLoading}
                    onClick={() => updateStatus(selected.id, "rejected")}
                  >
                    {actionLoading ? "Working..." : "Reject"}
                  </button>

                  <button className="btn close" onClick={() => setSelected(null)} disabled={actionLoading}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
