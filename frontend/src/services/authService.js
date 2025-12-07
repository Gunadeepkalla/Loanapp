import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Decode JWT token to get user info
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const authService = {
  // ============= AUTH FUNCTIONS =============
  
  // Register/Sign Up (default role is 'user')
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Registration failed' };
    }
  },

  // Login/Sign In
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Decode token to get user info including role
        const decoded = decodeToken(response.data.token);
        
        // Store user data with role
        localStorage.setItem('user', JSON.stringify({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name || ''
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Login failed' };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch user data' };
    }
  },

  // ============= LOAN RELATED FUNCTIONS =============
  
  // Get user's loan applications (advanced system)
  getUserLoans: async () => {
    try {
      const response = await api.get('/loans/my-applications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch loans' };
    }
  },

  // Get user's simple loans (old system)
  getSimpleLoans: async () => {
    try {
      const response = await api.get('/loans/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch simple loans' };
    }
  },

 // Apply for a new loan (advanced system with file upload)
applyForLoan: async (loanData, files = {}) => {
  try {
    const formData = new FormData();
    
    // Append all form data
    Object.keys(loanData).forEach(key => {
      formData.append(key, loanData[key] || '');
    });
    
    // Debug: Count files before appending
    console.log('Files to upload:', Object.keys(files).filter(key => files[key]));
    
    // Append files - Ensure ALL files are included
    Object.keys(files).forEach(key => {
      if (files[key]) {
        if (files[key] instanceof File) {
          formData.append(key, files[key]);
          console.log(`✅ Appending file: ${key} = ${files[key].name} (${files[key].size} bytes)`);
        } else if (typeof files[key] === 'string') {
          formData.append(key, files[key]);
          console.log(`📝 Appending string value for: ${key} = ${files[key]}`);
        }
      } else {
        console.log(`❌ No file for: ${key}`);
      }
    });
    
    // Debug: Check what's being sent
    console.log('=== FormData entries being sent ===');
    let fileCount = 0;
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`📄 ${pair[0]}: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
        fileCount++;
      } else {
        console.log(`📝 ${pair[0]}: ${pair[1]}`);
      }
    }
    console.log(`Total files: ${fileCount}`);
    console.log('===================================');
    
    const response = await api.post('/loans/apply-loan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Backend response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Loan application error:', error.response?.data || error);
    throw error.response?.data || { msg: 'Loan application failed' };
  }
},

  // Simple loan apply (old system)
  applySimpleLoan: async (loanData) => {
    try {
      const response = await api.post('/loans/apply', loanData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Simple loan application failed' };
    }
  },

  // Get specific loan details
  getLoanDetails: async (loanId) => {
    try {
      // First get all loans and filter
      const loansData = await authService.getUserLoans();
      const loan = loansData.applications?.find(app => app.id == loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      return { success: true, loan };
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch loan details' };
    }
  },

  // ============= ADMIN FUNCTIONS =============
  
  // Get all loan applications (admin only)
  getAllLoanApplications: async () => {
    try {
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch loan applications' };
    }
  },

  // Get all simple loans (admin only)
  getAllLoans: async () => {
    try {
      const response = await api.get('/admin/loans');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch loans' };
    }
  },

  // Get single application details
  getApplicationDetails: async (applicationId) => {
    try {
      const response = await api.get(`/admin/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch application details' };
    }
  },

  // Update application status (approve/reject)
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const response = await api.put(`/admin/applications/${applicationId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update application status' };
    }
  },

  // Update simple loan status
  updateLoanStatus: async (loanId, status) => {
    try {
      const response = await api.put(`/admin/loans/${loanId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update loan status' };
    }
  },

  // ============= AUTH & USER FUNCTIONS =============

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'user'; // Default to 'user' if no role
  },

  // Check if user is admin
  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'admin';
  },

  // Check if user is regular user
  isUser: () => {
    const role = authService.getUserRole();
    return role === 'user';
  },

  // Get user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },


  getLoanDetails: async (loanId) => {
  try {
    const response = await api.get(`/loans/application/${loanId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to fetch loan details' };
  }
},

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;