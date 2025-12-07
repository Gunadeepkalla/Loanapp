import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!authService.isAuthenticated() || authService.isAdmin()) {
          navigate('/login');
          return;
        }
        
        // Fetch user loans and find the specific one
        const loansData = await authService.getUserLoans();
        const foundLoan = loansData.applications?.find(app => app.id == id);
        
        if (!foundLoan) {
          setError('Loan application not found');
        } else {
          setLoan(foundLoan);
        }
      } catch (err) {
        setError('Failed to load loan details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under review':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => navigate('/user/loans')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Loans
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error || 'Loan not found'}</h3>
            <button
              onClick={() => navigate('/user/loans')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Loans
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/user/loans')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back to Loans
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Loan Application Details</h1>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(loan.status)}`}>
              {loan.status}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Application Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{loan.loan_type} Loan</h2>
                <p className="text-gray-600 mt-1">Application ID: {loan.application_id || loan.id}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">₹{(loan.salary || loan.amount || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Loan Amount</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Applied Date</p>
                <p className="font-medium">{formatDate(loan.created_at || loan.applied_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(loan.updated_at || loan.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Type</p>
                <p className="font-medium">{loan.loan_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{loan.status}</p>
              </div>
            </div>
          </div>

          {/* Applicant Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Applicant Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{loan.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{loan.phone || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{loan.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Salary</p>
                <p className="font-medium">₹{(loan.salary || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            {loan.documents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(JSON.parse(loan.documents || '{}')).map(([docName, fileName]) => (
                  fileName && (
                    <div key={docName} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{docName.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">{fileName}</p>
                        </div>
                        <a
                          href={`http://localhost:5000/uploads/${fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No documents uploaded</p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Application Status</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-gray-600">{formatDate(loan.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-full ${
                    loan.status === 'under review' || loan.status === 'pending' 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Under Review</p>
                  <p className="text-sm text-gray-600">
                    {loan.status === 'under review' || loan.status === 'pending'
                      ? 'Currently being reviewed'
                      : 'Pending review'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-full ${
                    loan.status === 'approved' 
                      ? 'bg-green-500' 
                      : loan.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Final Decision</p>
                  <p className="text-sm text-gray-600">
                    {loan.status === 'approved' && 'Application approved'}
                    {loan.status === 'rejected' && 'Application rejected'}
                    {(loan.status === 'under review' || loan.status === 'pending') && 'Awaiting decision'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanDetails;