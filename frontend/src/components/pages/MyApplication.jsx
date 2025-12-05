import React, { useEffect, useState } from "react";
import "../../styles/myApplications.css";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApps();
  }, []);

  async function fetchApps() {
    const res = await fetch("http://localhost:5000/api/loans/my-applications", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setApps(data.applications || []);
  }

  return (
    <div className="my-app-wrap">
      <h1>My Loan Applications</h1>

      <div className="my-app-list">
        {apps.map((app) => (
          <div key={app.id} className="my-app-card">
            <h2>{app.loan_type}</h2>

            <p><strong>Status:</strong> {app.status}</p>
            <p><strong>Applied:</strong> {new Date(app.created_at).toLocaleDateString()}</p>

            {app.documents && (
              <div className="docs">
                <p><strong>Documents:</strong></p>
                {Object.entries(app.documents).map(([key, value]) => (
                  value && (
                    <a
                      key={key}
                      href={`http://localhost:5000/uploads/${value}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {key}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
