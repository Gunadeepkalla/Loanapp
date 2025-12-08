import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserLoans from './pages/UserLoans.jsx';
import ApplyLoan from './pages/ApplyLoan.jsx';
import LoanDetails from './pages/LoanDetails.jsx';
import PaymentGateway from './pages/PaymentGateway.jsx'; // Add this import
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/loans" element={<UserLoans />} />
        <Route path="/user/apply-loan" element={<ApplyLoan />} />
        <Route path="/user/loans/:id" element={<LoanDetails />} />
        <Route path="/user/payment" element={<PaymentGateway />} /> {/* Add this route */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Login />} />
        
        {/* Enhanced 404 Page with Navigation Options */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <span className="text-3xl">404</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
              <p className="text-gray-600 mb-8">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.history.back()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
                <a 
                  href="/user/dashboard" 
                  className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Go to Dashboard
                </a>
                <a 
                  href="/login" 
                  className="block w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Go to Login
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;