import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalSubmissions: 0,
    loanInProgress: 0,
    totalAmount: 0,
    onHold: 0,
    inProgress: 0,
    approvedLoans: 0,
    thisWeekAmount: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        if (authService.isAdmin()) {
          navigate('/admin/dashboard');
          return;
        }
        
        // Fetch user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Fetch loan applications
        let loansData = [];
        try {
          const response = await authService.getUserLoans();
          loansData = response.applications || [];
        } catch (error) {
          console.log('Using simple loans API');
          const simpleLoans = await authService.getSimpleLoans();
          loansData = simpleLoans || [];
        }
        
        setLoans(loansData);
        setAllLoans(loansData);
        calculateStats(loansData);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const calculateStats = (loanList) => {
    const stats = {
      totalApproved: 0,
      totalSubmissions: loanList.length,
      loanInProgress: 0,
      totalAmount: 0,
      onHold: 0,
      inProgress: 0,
      approvedLoans: 0,
      thisWeekAmount: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    loanList.forEach(loan => {
      const amount = parseFloat(loan.salary || loan.amount || 0);
      stats.totalAmount += amount;
      
      const status = loan.status?.toLowerCase();
      const loanDate = new Date(loan.created_at || loan.applied_date || new Date());
      
      if (status === 'approved') {
        stats.totalApproved++;
        stats.approvedLoans++;
        if (loanDate >= oneWeekAgo) {
          stats.thisWeekAmount += amount;
        }
      } else if (status === 'processing' || status === 'in progress') {
        stats.loanInProgress++;
        stats.inProgress++;
      } else if (status === 'pending' || status === 'under review') {
        stats.onHold++;
      }
    });

    setStats(stats);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing':
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayOfWeek}, ${day}${suffix} ${month}`;
  };
  // Add this function right after getCurrentDate() function
const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning!';
  } else if (hour < 17) {
    return 'Good Afternoon!';
  } else {
    return 'Good Evening!';
  }
};

  const handlePay = (loan) => {
    navigate('/user/payment', { 
      state: { 
        loanId: loan.id,
        amount: loan.amount || loan.salary,
        loanType: loan.loan_type
      }
    });
  };

  const toggleShowAllLoans = () => {
    setShowAllLoans(!showAllLoans);
  };

  const displayLoans = showAllLoans ? allLoans : allLoans.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-blue-800 tracking-tight">VASU CONSULTANCY</h1>
                <p className="text-xs text-gray-500">Professional Financial Services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => navigate('/user/dashboard')}
                  className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/user/apply-loan')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                >
                  Apply Loan
                </button>
                <button 
                  onClick={() => navigate('/user/profile')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                >
                  Profile
                </button>
              </div>
              
              <button
                onClick={() => navigate('/user/loans')}
                className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm shadow-blue-200 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Application
              </button>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Loan Account</p>
              </div>
              
              <div className="relative group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm cursor-pointer">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        authService.logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">{getCurrentDate()}</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()} <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>,
              </h1>
              <p className="text-gray-600 mt-1">Here's your loan application overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </button>
            </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* First Row - Basic Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Approved */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Approved</h3>
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalApproved}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 font-medium">Approved Loans</span>
                </div>
              </div>

              {/* Total Submissions */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalSubmissions}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-blue-500 font-medium">Total Applications</span>
                </div>
              </div>

              {/* Loan Approved Amount */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Loan Approved</h3>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(stats.totalAmount)}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-purple-500 font-medium">Total Amount</span>
                </div>
              </div>
            </div>

            {/* Mortgage Data Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Application Status</h3>
                  <p className="text-blue-200 text-sm">Current loan status breakdown</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.totalSubmissions}</p>
                  <p className="text-blue-200 text-sm">TOTAL APPLICATIONS</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats.onHold}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">On Hold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats.inProgress}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{stats.approvedLoans}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">Approved Loans</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-blue-500/30">
                <div className="flex justify-between text-sm">
                  <span>Application Summary</span>
                  <button 
                    onClick={toggleShowAllLoans}
                    className="font-medium hover:text-blue-200 transition-colors"
                  >
                    {showAllLoans ? 'Show Less' : 'View All →'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Charts & Details */}
          <div className="space-y-6">
            {/* This Week Summary */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">This Week</h3>
                  <p className="text-sm text-gray-500">Approved loans amount</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Approved
                </span>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Total Approved Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisWeekAmount)}</p>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Loan In Progress</span>
                    <span className="font-medium">{stats.loanInProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalSubmissions > 0 ? (stats.loanInProgress / stats.totalSubmissions) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Details
                  </button>
                  <button 
                    onClick={() => navigate('/user/apply-loan')}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    + Add New
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold">Quick Actions</h3>
                  <p className="text-blue-100 text-sm">Manage your loans</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-white/20 rounded-full">
                  Active
                </span>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/user/loans')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Apply New Loan
                </button>
                
              
                
                <button 
                  onClick={() => navigate('/user/payment')}
                  className="w-full py-3 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Make Payment
                </button>
              </div>
            </div>
          </div>
        </div>

       

        {/* Recent Applications Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {showAllLoans ? 'All Applications' : 'Recent Applications'}
            </h3>
            <button 
              onClick={toggleShowAllLoans}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              {showAllLoans ? 'Show Recent Only' : 'View All'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {allLoans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-2">No applications yet</p>
              <p className="text-gray-600 mb-6">Start your financial journey today</p>
              <button
                onClick={() => navigate('/user/apply-loan')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Apply Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-lg">
                                {loan.loan_type === 'vehicle' ? '🚗' : 
                                 loan.loan_type === 'education' ? '🎓' : 
                                 loan.loan_type === 'house' ? '🏠' : '💼'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{loan.application_id || loan.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {loan.loan_type || 'Personal'} Loan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{loan.loan_type || 'Personal'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(loan.created_at || loan.applied_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(loan.salary || loan.amount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {loan.status?.toLowerCase() === 'approved' ? (
                            <button
                              onClick={() => handlePay(loan)}
                              className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all flex items-center"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Pay Now
                            </button>
                          ) : (
                            <span className="px-3 py-1 text-gray-500 text-xs">Payment Available After Approval</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Show Count Info */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                Showing {displayLoans.length} of {allLoans.length} applications
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Notes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Approved: {stats.totalApproved}</p>
                <p className="text-sm text-gray-600">Your approved loans are ready for disbursal</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Total Applications: {stats.totalSubmissions}</p>
                <p className="text-sm text-gray-600">Complete application history available</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* High-Level Footer - Same as Payment Gateway */}
      <footer className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">VASU CONSULTANCY</h3>
                <p className="text-gray-300 text-sm">
                  Professional Financial Advisory & Loan Services. 
                  We help you achieve your financial goals with expert guidance.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.796 0-1.44-.645-1.44-1.44s.644-1.44 1.44-1.44z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Home</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Loan Products</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Apply Now</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Track Application</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">EMI Calculator</a></li>
                </ul>
              </div>
              
              {/* Services */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Services</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Home Loans</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Personal Loans</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Business Loans</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Education Loans</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white text-sm">Vehicle Loans</a></li>
                </ul>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Contact Us</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-gray-300 text-sm">support@vasuconsultancy.com</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="text-gray-300 text-sm">+91 98765 43210</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm">Bhimavaram, Ap</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-700 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Vasu Consultancy. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Disclaimer</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;