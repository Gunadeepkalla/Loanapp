import React, { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
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
        if (isMounted.current) setUser(userData);
        
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
        
        if (isMounted.current) {
          setLoans(loansData);
          setAllLoans(loansData);
          calculateStats(loansData);
        }
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
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
      const loanDate = new Date(loan.applied_on || loan.created_at || loan.applied_date || new Date());
      
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
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved') return 'bg-green-100 text-green-800';
    if (statusLower === 'rejected') return 'bg-red-100 text-red-800';
    if (statusLower === 'processing' || statusLower === 'in progress') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'pending' || statusLower === 'under review') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const handlePay = (loan) => {
    navigate('/user/payment', { 
      state: { 
        loanId: loan.id,
        amount: loan.salary || loan.amount,
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-blue-800 tracking-tight truncate">
                  VASU CONSULTANCY
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Professional Financial Services</p>
                <p className="text-xs text-gray-500 sm:hidden">Financial Services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/user/dashboard')}
                  className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/user/loans')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                >
                  Apply Loan
                </button>
              </div>
              
              <button
                onClick={() => navigate('/user/loans')}
                className="hidden sm:inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm shadow-blue-200 transition-all"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Application</span>
                <span className="sm:hidden">New</span>
              </button>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">Loan Account</p>
              </div>
              
              <div className="relative group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm cursor-pointer">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                      <p className="font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        authService.logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 sm:hidden">
        <div className="flex justify-around py-2">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="flex flex-col items-center p-2 flex-1"
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1 text-blue-600">Home</span>
          </button>
          <button
            onClick={() => navigate('/user/loans')}
            className="flex flex-col items-center p-2 flex-1"
          >
            <div className="relative">
              <div className="w-10 h-10 -mt-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-600">Apply</span>
          </button>
          <button
            onClick={() => {
              authService.logout();
              navigate('/login');
            }}
            className="flex flex-col items-center p-2 flex-1"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-1 text-gray-600">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pb-16 sm:pb-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="mb-4 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{getCurrentDate()}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {getGreeting()} <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>,
              </h1>
              <p className="text-sm text-gray-600 mt-1">Here's your loan application overview</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 012 2z" />
                </svg>
                {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Approved</h3>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stats.totalApproved}</p>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="text-green-500 font-medium">Approved Loans</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Submissions</h3>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stats.totalSubmissions}</p>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="text-blue-500 font-medium">Total Applications</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500">Loan Approved</h3>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{formatCurrency(stats.totalAmount)}</p>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="text-purple-500 font-medium">Total Amount</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-base sm:text-lg font-semibold">Application Status</h3>
                  <p className="text-blue-200 text-xs sm:text-sm">Current loan status breakdown</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold">{stats.totalSubmissions}</p>
                  <p className="text-blue-200 text-xs sm:text-sm">TOTAL APPLICATIONS</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-1">{stats.onHold}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">On Hold</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-1">{stats.inProgress}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold mb-1">{stats.approvedLoans}</div>
                  <div className="text-xs text-blue-200 uppercase tracking-wider">Approved Loans</div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-500/30">
                <div className="flex justify-between text-xs sm:text-sm">
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

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm sm:font-semibold text-gray-900">This Week</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Approved loans amount</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Approved
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs text-gray-500">Total Approved Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.thisWeekAmount)}</p>
                
                <div className="pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                    <span>Loan In Progress</span>
                    <span className="font-medium">{stats.loanInProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalSubmissions > 0 ? (stats.loanInProgress / stats.totalSubmissions) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-3 sm:pt-4 border-t border-gray-100">
                  <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Details
                  </button>
                  <button 
                    onClick={() => navigate('/user/loans')}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    + Add New
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-4 sm:p-5 text-white shadow-lg">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm sm:font-semibold">Quick Actions</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">Manage your loans</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded-full">
                  Active
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={() => navigate('/user/loans')}
                  className="w-full py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Apply New Loan
                </button>
                
                <button 
                  onClick={() => navigate('/user/payment')}
                  className="w-full py-2 sm:py-3 bg-white text-blue-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Make Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications Table - CORRECTED VERSION */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {showAllLoans ? 'All Applications' : 'Recent Applications'}
            </h3>
            <button 
              onClick={toggleShowAllLoans}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              {showAllLoans ? 'Show Recent' : 'View All'}
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-gray-900 font-medium text-lg mb-2">No applications yet</p>
              <p className="text-gray-600 mb-6">Start your financial journey today</p>
              <button
                onClick={() => navigate('/user/loans')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Apply Now
              </button>
            </div>
          ) : (
            <>
             {/* Mobile View - COMPACT CARDS */}
<div className="block lg:hidden">
  {displayLoans.map((loan) => (
    <div key={loan.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-base">
                {loan.loan_type === 'vehicle' ? '🚗' : 
                 loan.loan_type === 'education' ? '🎓' : 
                 loan.loan_type === 'home' ? '🏠' : '💼'}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                #{loan.id}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {loan.loan_type || 'Personal'} Loan
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
            {loan.status || 'Pending'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium">{formatDate(loan.applied_on || loan.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-medium">{formatCurrency(loan.salary || 0)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Applicant</p>
            <p className="text-sm font-medium truncate">{loan.full_name || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          {loan.status?.toLowerCase() === 'approved' ? (
            <button onClick={() => handlePay(loan)} className="w-full py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded hover:from-green-700 hover:to-green-800 font-medium transition-all flex items-center justify-center text-xs">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay Now
            </button>
          ) : loan.status?.toLowerCase() === 'rejected' ? (
            <div className="text-center py-1 text-red-600 text-xs font-medium">
              ✗ Rejected
            </div>
          ) : (
            <div className="text-center py-1 text-gray-500 text-xs">
              Under Process
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>
             {/* Desktop View - PROFESSIONAL TABLE */}
<div className="hidden lg:block">
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header - Professional Style */}
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr className="h-11">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span>ID</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Loan Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Applicant
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Applied Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        
        {/* Table Body - Clean and Professional */}
        <tbody className="divide-y divide-gray-100">
          {displayLoans.map((loan, index) => (
            <tr 
              key={loan.id} 
              className={`h-12 hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {/* ID with subtle styling */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold text-blue-700">#{loan.id}</span>
                  </div>
                </div>
              </td>
              
              {/* Loan Type with icon */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    loan.loan_type === 'vehicle' ? 'bg-blue-100' :
                    loan.loan_type === 'education' ? 'bg-purple-100' :
                    loan.loan_type === 'home' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-sm">
                      {loan.loan_type === 'vehicle' ? '🚗' : 
                       loan.loan_type === 'education' ? '🎓' : 
                       loan.loan_type === 'home' ? '🏠' : '💼'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800 capitalize">
                    {loan.loan_type || 'Personal'}
                  </span>
                </div>
              </td>
              
              {/* Applicant */}
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{loan.full_name || 'N/A'}</p>
                  {loan.phone && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      📞 {loan.phone}
                    </p>
                  )}
                </div>
              </td>
              
              {/* Date */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {formatDate(loan.applied_on || loan.created_at)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(loan.applied_on || loan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </td>
              
              {/* Amount with professional formatting */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">
                    {formatCurrency(loan.salary || 0)}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                    Loan Amount
                  </span>
                </div>
              </td>
              
              {/* Status with professional badges */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  loan.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                  loan.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                  loan.status?.toLowerCase() === 'processing' || loan.status?.toLowerCase() === 'in progress' ? 
                    'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {loan.status?.toLowerCase() === 'approved' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {loan.status?.toLowerCase() === 'rejected' && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {loan.status?.toLowerCase() === 'processing' && (
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {loan.status?.toLowerCase() === 'pending' && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="capitalize">{loan.status || 'Pending'}</span>
                </div>
              </td>
              
              {/* Actions - Professional buttons */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {loan.status?.toLowerCase() === 'approved' ? (
                    <>
                      <button
                        onClick={() => handlePay(loan)}
                        className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all shadow-sm hover:shadow text-xs flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay Now
                      </button>
                      <button className="px-2 py-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </>
                  ) : loan.status?.toLowerCase() === 'rejected' ? (
                    <span className="text-red-600 text-xs font-medium px-2 py-1.5 bg-red-50 rounded-lg">
                      Cannot Process
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs font-medium px-2 py-1.5 bg-gray-100 rounded-lg">
                      Under Review
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Table Footer with pagination/info */}
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{displayLoans.length}</span> of <span className="font-semibold">{allLoans.length}</span> applications
      </div>
      <div className="flex items-center space-x-1">
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="px-2 text-sm text-gray-700">Page 1 of 1</span>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div></>
          )}

          {/* Show Count Info */}
          {allLoans.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-600">
              Showing {displayLoans.length} of {allLoans.length} applications
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Application Notes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs sm:text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Total Approved: {stats.totalApproved}</p>
                <p className="text-xs sm:text-sm text-gray-600">Your approved loans are ready for disbursal</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xs sm:text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Total Applications: {stats.totalSubmissions}</p>
                <p className="text-xs sm:text-sm text-gray-600">Complete application history available</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;