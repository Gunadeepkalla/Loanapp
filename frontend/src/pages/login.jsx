import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService"; // Make sure to import this

const Login = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isNewUser) {
        // Sign Up logic
        if (!firstName || !lastName || !email || !password) {
          setError('All fields are required');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const userData = {
          firstName,
          lastName,
          email,
          phone,
          password,
        };

        const response = await authService.register(userData);
        console.log("Sign up successful:", response);
        
        // After successful registration, automatically login
        const loginResponse = await authService.login({ email, password });
        console.log("Auto login after registration:", loginResponse);
        
        // Redirect based on role
        redirectBasedOnRole();
        
      } else {
        // Sign In logic
        if (!email || !password) {
          setError('Email and password are required');
          setIsLoading(false);
          return;
        }

        if (!email.includes('@')) {
          setError('Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        const credentials = { email, password };
        const response = await authService.login(credentials);
        console.log("Sign in successful:", response);
        
        // Redirect based on role
        redirectBasedOnRole();
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.msg || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = () => {
    const role = authService.getUserRole();
    
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/user/dashboard', { replace: true });
    }
  };

  // REMOVE THIS DUPLICATE HANDLESUBMIT FUNCTION
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setIsLoading(true);

  //   setTimeout(() => {
  //     if (isNewUser) {
  //       console.log("Signing up with:", { firstName, lastName, email, phone, password });
  //       alert('Account created successfully! Welcome to Vasu Consultancy.');
  //     } else {
  //       console.log("Signing in with:", { email, password });
        
  //       if (!email.includes('@')) {
  //         setError('Please enter a valid email address');
  //         setIsLoading(false);
  //         return;
  //       }
        
  //       if (password.length < 6) {
  //         setError('Password must be at least 6 characters');
  //         setIsLoading(false);
  //         return;
  //       }
        
  //       navigate('/profile', { replace: true });
  //     }
  //     setIsLoading(false);
  //   }, 1000);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header - Clean Google-style */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">VC</span>
            </div>
            <h1 className="text-3xl font-normal text-gray-900 tracking-tight">VASU CONSULTANCY</h1>
          </div>
          <p className="text-gray-600">Professional Financial Management Platform</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form (Smaller size) */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Toggle - Clean Google-style */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setIsNewUser(true)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  isNewUser 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign up
              </button>
              <button
                onClick={() => setIsNewUser(false)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  !isNewUser 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign in
              </button>
            </div>

            <h2 className="text-xl font-normal text-gray-900 mb-6">
              {isNewUser ? "Create an account" : "Welcome back"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isNewUser && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {isNewUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="(775) 351-6501"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder={isNewUser ? "Create a password" : "Enter your password"}
                  required
                />
                {isNewUser && (
                  <p className="mt-1 text-xs text-gray-500">
                    Use 6 or more characters with a mix of letters, numbers & symbols
                  </p>
                )}
              </div>

              {!isNewUser && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
                {/* Admin dashboard restriction note */}
              {!isNewUser && (
                <div className="mt-2 mb-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    <span className="font-medium">Note:</span> Admin dashboard access is restricted to authorized personnel only.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : isNewUser ? (
                  "Create an account"
                ) : (
                  "Sign in"
                )}
              </button>

              {/* Terms - Clean footer */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                </p>
              </div>
            </form>
          </div>

          {/* Right Column - Clean Features */}
          <div className="space-y-8">
            {/* Features Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Why Choose Vasu Consultancy?
                </h3>
                <p className="text-gray-600">
                  Join thousands managing their loans efficiently
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">All Loans in One Place</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Track mortgages, personal, auto & student loans with a unified dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Smart Analytics</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered insights to save on interest and optimize payments
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Bank-Level Security</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enterprise-grade encryption and compliance standards
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">Get Started Free</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    No credit card required. Start managing your loans today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Vasu Consultancy. All rights reserved.
          </p>
          <div className="mt-2">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mx-3">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mx-3">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mx-3">
              Contact
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 mx-3">
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;