import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    pendingApprovals: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalRevenue: 0,
  });
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Check if user is actually admin
        if (!authService.isAdmin()) {
          navigate('/user/dashboard');
          return;
        }
        
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch all data
        await fetchUsers();
        await fetchApplications();
        await fetchLoans();
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (error.response?.status === 401) {
          authService.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      // Note: You need to create a /admin/users endpoint in your backend
      // For now, we'll extract unique users from applications
      const response = await authService.getAllLoanApplications();
      const apps = response.applications || [];
      
      // Extract unique users based on user_id
      const uniqueUserIds = [...new Set(apps.map(app => app.user_id))];
      setUsers(uniqueUserIds); // This would be actual user objects in real app
      
      // Update stats
      calculateStats(apps);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

 const fetchApplications = async () => {
  try {
    const response = await authService.getAllLoanApplications();
    
    // Debug: Log the response
    console.log('=== APPLICATIONS FROM BACKEND ===');
    console.log('Total applications:', response.applications?.length || 0);
    
    if (response.applications && response.applications.length > 0) {
      response.applications.forEach((app, index) => {
        console.log(`\nApplication #${index + 1}:`);
        console.log('ID:', app.id);
        console.log('Loan Type:', app.loan_type);
        console.log('Status:', app.status);
        
        // Check documents field
        console.log('Documents field type:', typeof app.documents);
        console.log('Documents field:', app.documents);
        
        if (typeof app.documents === 'string') {
          try {
            const parsed = JSON.parse(app.documents);
            console.log('Parsed documents keys:', Object.keys(parsed || {}));
          } catch (e) {
            console.log('Could not parse documents as JSON');
          }
        } else if (app.documents && typeof app.documents === 'object') {
          console.log('Documents object keys:', Object.keys(app.documents));
        }
      });
    }
    console.log('=================================');
    
    setApplications(response.applications || []);
    calculateStats(response.applications || []);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
  }
};

  const fetchLoans = async () => {
    try {
      const response = await authService.getAllLoans();
      setLoans(response || []);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  };

  const calculateStats = (apps) => {
    // Count unique users from applications
    const uniqueUsers = [...new Set(apps.map(app => app.user_id))].length;
    
    const pendingApps = apps.filter(app => 
      app.status === 'Under Review' || app.status === 'pending'
    ).length;
    
    const approvedApps = apps.filter(app => 
      app.status === 'approved'
    ).length;
    
    const rejectedApps = apps.filter(app => 
      app.status === 'rejected'
    ).length;

    // Calculate total revenue from approved loans
    const totalRevenue = apps
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + (parseFloat(app.salary) || 0), 0);

    setStats({
      totalUsers: uniqueUsers,
      totalApplications: apps.length,
      pendingApprovals: pendingApps,
      approvedApplications: approvedApps,
      rejectedApplications: rejectedApps,
      totalRevenue: totalRevenue,
    });
  };

 const handleViewDocuments = async (application) => {
  try {
    setSelectedApplication(application);
    setLoading(true);
    
    // Parse documents from JSON string
    let appDocuments = {};
    try {
      if (typeof application.documents === 'string') {
        appDocuments = JSON.parse(application.documents);
      } else if (application.documents) {
        appDocuments = application.documents;
      }
    } catch (parseError) {
      console.warn('Failed to parse documents JSON:', parseError);
      // Try alternative parsing
      if (application.documents && typeof application.documents === 'object') {
        appDocuments = application.documents;
      }
    }
    
    // Debug: Log the documents object
    console.log('Documents object:', appDocuments);
    
    // Convert documents object to array for display
    const docsArray = Object.entries(appDocuments)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        const filename = typeof value === 'string' ? value : 'document';
        return {
          name: key.replace(/_/g, ' ').toUpperCase(),
          filename: filename,
          url: `http://localhost:5000/uploads/${filename}`
        };
      });
    
    console.log('Processed documents array:', docsArray);
    
    setDocuments(docsArray);
    setShowDocumentModal(true);
  } catch (error) {
    console.error('Failed to load documents:', error);
    alert('Failed to load documents. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleQuickUpdateStatus = async (id, type, status, application) => {
    const confirmation = window.confirm(
      `Are you sure you want to ${status} this application?\n\n` +
      `Application ID: ${id}\n` +
      `Applicant: ${application.full_name}\n` +
      `Loan Type: ${application.loan_type}\n` +
      `Amount: ${formatCurrency(application.salary || 0)}\n\n` +
      `Note: This will send a ${status} email to the applicant.`
    );

    if (!confirmation) return;

    try {
      if (type === 'application') {
        await authService.updateApplicationStatus(id, status);
        await fetchApplications();
      } else {
        await authService.updateLoanStatus(id, status);
        await fetchLoans();
      }
      
      alert(`Application ${status} successfully! Email sent to applicant.`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleUpdateStatus = async (id, type, status) => {
    if (!selectedApplication) {
      alert('Please review documents first before approving/rejecting.');
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to ${status} this application?\n\n` +
      `Application ID: ${id}\n` +
      `Applicant: ${selectedApplication.full_name}\n` +
      `Loan Type: ${selectedApplication.loan_type}\n` +
      `Amount: ${formatCurrency(selectedApplication.salary || 0)}\n\n` +
      `Note: This will send a ${status} email to the applicant.`
    );

    if (!confirmation) return;

    try {
      if (type === 'application') {
        await authService.updateApplicationStatus(id, status);
        await fetchApplications();
      } else {
        await authService.updateLoanStatus(id, status);
        await fetchLoans();
      }
      
      alert(`Application ${status} successfully! Email sent to applicant.`);
      setShowDocumentModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under review':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const DocumentModal = () => {
  if (!showDocumentModal || !selectedApplication) return null;

  const downloadDocument = (doc) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Review Application Documents</h3>
              <p className="text-blue-200 text-sm">
                Application #{selectedApplication.id} • {selectedApplication.loan_type} Loan
              </p>
            </div>
            <button
              onClick={() => {
                setShowDocumentModal(false);
                setSelectedApplication(null);
              }}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Applicant Details - Fixed */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Applicant Name</p>
              <p className="font-medium">{selectedApplication.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{selectedApplication.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Applied On</p>
              <p className="font-medium">{formatDate(selectedApplication.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Submitted Documents</h4>
              <span className="text-sm text-gray-600">{documents.length} documents</span>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No documents uploaded for this application.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{doc.filename}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between px-6 py-4 bg-gray-50 flex-shrink-0">
          <div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
              Current Status: {selectedApplication.status}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleUpdateStatus(selectedApplication.id, 'application', 'rejected')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Reject Application
            </button>
            <button
              onClick={() => handleUpdateStatus(selectedApplication.id, 'application', 'approved')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Approve Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (loading && !showDocumentModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Document Review Modal */}
      <DocumentModal />

      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Vasu Consultancy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin: {user?.name}</p>
                <p className="text-xs text-gray-500">Administrator Account</p>
              </div>
              
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unique Applicants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Based on {stats.totalApplications} applications
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {stats.approvedApplications} approved • {stats.rejectedApplications} rejected
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Requires document review
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              From {stats.approvedApplications} approved loans
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 px-4 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Advanced Applications
                <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-blue-100 text-blue-600">
                  {applications.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'loans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Simple Loans
                <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-600">
                  {loans.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Applications/Loans Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 sm:mx-0">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'applications' ? 'Loan Applications (Review Required)' : 'Simple Loans'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'applications' 
                ? 'Click "View Docs" to review documents or use quick Approve/Reject buttons' 
                : 'Simple loan applications for review'}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeTab === 'applications' ? (
                  applications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{app.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                          <div className="text-sm text-gray-500">{app.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{app.loan_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(app.salary || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(app.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDocuments(app)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs"
                            >
                              View Docs
                            </button>
                            
                            {(app.status === 'Under Review' || app.status === 'pending') ? (
                              <>
                                <button
                                  onClick={() => handleQuickUpdateStatus(app.id, 'application', 'approved', app)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleQuickUpdateStatus(app.id, 'application', 'rejected', app)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-xs"
                                >
                                  Reject
                                </button>
                              </>
                            ) : app.status === 'approved' ? (
                              <span className="px-3 py-1 text-green-600 text-xs font-medium">
                                ✓ Approved
                              </span>
                            ) : app.status === 'rejected' ? (
                              <span className="px-3 py-1 text-red-600 text-xs font-medium">
                                ✗ Rejected
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  loans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No simple loans found
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{loan.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">User ID: {loan.user_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{loan.loan_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(loan.amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(loan.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {loan.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleQuickUpdateStatus(loan.id, 'loan', 'approved', loan)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleQuickUpdateStatus(loan.id, 'loan', 'rejected', loan)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-xs"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="px-3 py-1 text-gray-500 text-xs">
                                Action completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
            <h4 className="font-semibold mb-4">Status Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Pending Review</span>
                <span className="font-bold">{stats.pendingApprovals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-200">Approved</span>
                <span className="font-bold">{stats.approvedApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-200">Rejected</span>
                <span className="font-bold">{stats.rejectedApplications}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.full_name}</p>
                    <p className="text-xs text-gray-500">{app.loan_type} Loan</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Admin Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  fetchApplications();
                  fetchLoans();
                  alert('Data refreshed successfully!');
                }}
                className="w-full py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              <button 
                onClick={() => alert('Report generation feature coming soon!')}
                className="w-full py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
              >
                Generate Report
              </button>
              <button 
                onClick={() => alert('System settings feature coming soon!')}
                className="w-full py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors"
              >
                System Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-gray-900">Admin Portal</h3>
              <p className="text-sm text-gray-600">Vasu Consultancy Management System</p>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Vasu Consultancy. Admin access only.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;