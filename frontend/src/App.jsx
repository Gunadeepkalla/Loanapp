import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login.jsx";
import Register from "./components/pages/Register.jsx";
import AdminDashboard from "./components/pages/AdminDashboard.jsx";
import UserDashboard from "./components/pages/UserDashboard.jsx";
import ApplyLoan from "./components/pages/ApplyLoan.jsx";
import MyApplications from "./components/pages/MyApplication.jsx";
import AdminApplications from "./components/pages/AdminApplications.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Login />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />

        {/* User */}
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Apply Loan (query param version → /apply-loan?type=vehicle) */}
        <Route path="/apply-loan" element={<ApplyLoan />} />

        {/* User applications */}
        <Route path="/my-applications" element={<MyApplications />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
  