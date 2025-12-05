import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ApplyLoan() {
  const [searchParams] = useSearchParams();
  const loanType = searchParams.get("type"); // vehicle, house, etc.

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    salary: "",
  });

  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
    salarySlip: null,
  });

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setDocuments({
      ...documents,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sendData = new FormData();
    sendData.append("loan_type", loanType);
    sendData.append("full_name", formData.full_name);
    sendData.append("phone", formData.phone);
    sendData.append("address", formData.address);
    sendData.append("salary", formData.salary);

    if (documents.aadhaar) sendData.append("aadhaar", documents.aadhaar);
    if (documents.pan) sendData.append("pan", documents.pan);
    if (documents.salarySlip) sendData.append("salarySlip", documents.salarySlip);

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/loans/apply-loan", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: sendData,
    });

    const data = await res.json();
    alert(data.msg);
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Apply for {loanType?.toUpperCase()} Loan</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          name="full_name"
          placeholder="Full Name"
          required
          onChange={handleTextChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          required
          onChange={handleTextChange}
        />

        <input
          name="address"
          placeholder="Address"
          required
          onChange={handleTextChange}
        />

        <input
          name="salary"
          placeholder="Monthly Salary"
          type="number"
          required
          onChange={handleTextChange}
        />

        {/* Documents */}
        <p>Aadhaar Card:</p>
        <input type="file" name="aadhaar" onChange={handleFileChange} />

        <p>PAN Card:</p>
        <input type="file" name="pan" onChange={handleFileChange} />

        <p>Salary Slip:</p>
        <input type="file" name="salarySlip" onChange={handleFileChange} />

        <button type="submit" style={{ marginTop: "20px" }}>
          Submit Application
        </button>
      </form>
    </div>
  );
}
