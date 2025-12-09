import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    loan_type: '',
    full_name: '',
    phone: '',
    address: '',
    salary: '',
  });

  // File state
  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    salarySlip: null,
    rc: null,
    property_doc: null,
    fee_structure: null,
    bank_statement: null,
    admission_letter: null,
  });

  // Loan types
  const loanTypes = [
    { id: 'vehicle', name: 'Vehicle Loan', icon: '🚗' },
    { id: 'education', name: 'Education Loan', icon: '🎓' },
    { id: 'personal', name: 'Personal Loan', icon: '💼' },
    { id: 'house', name: 'House Loan', icon: '🏠' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const getRequiredFiles = () => {
    const baseFiles = ['aadhaar', 'pan', 'salarySlip', 'bank_statement'];
    
    switch(formData.loan_type) {
      case 'vehicle':
        return [...baseFiles, 'rc'];
      case 'education':
        return [...baseFiles, 'fee_structure', 'admission_letter'];
      case 'house':
        return [...baseFiles, 'property_doc'];
      default:
        return baseFiles;
    }
  };

  const validateStep1 = () => {
    if (!formData.loan_type) {
      setError('Please select a loan type');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const requiredFields = ['full_name', 'phone', 'address', 'salary'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }
    
    // Validate phone number
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate salary
    if (formData.salary && parseInt(formData.salary) <= 0) {
      setError('Please enter a valid loan amount');
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    const requiredFiles = getRequiredFiles();
    for (const file of requiredFiles) {
      if (!files[file]) {
        setError(`Please upload ${file.replace('_', ' ')} document`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep3()) return;

    setLoading(true);
    try {
      await authService.applyForLoan(formData, files);
      setSuccess('Loan application submitted successfully!');
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.msg || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Enhanced Mobile */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => navigate('/user/dashboard')}
                className="mr-2 sm:mr-3 md:mr-4 text-gray-600 hover:text-gray-900 flex items-center flex-shrink-0"
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
                <span className="hidden sm:inline text-sm sm:text-base">Dashboard</span>
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate ml-1">
                Apply for Loan
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                Step <span className="text-blue-700 font-bold">{step}</span> of 3
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="px-0 sm:px-4 py-4 sm:py-6">
          {/* Progress Bar - Mobile Enhanced */}
          <div className="mb-6 sm:mb-8 px-2 sm:px-0">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-3.5 sm:top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step - 1) * 50}%` }}
                ></div>
              </div>
              
              {/* Steps */}
              <div className="flex justify-between">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      step >= num 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <span className="text-sm font-medium">{num}</span>
                    </div>
                    <span className={`text-xs sm:text-sm mt-2 font-medium ${
                      step >= num ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {num === 1 ? 'Loan Type' : num === 2 ? 'Details' : 'Documents'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error/Success Messages - Mobile Enhanced */}
          {(error || success) && (
            <div className={`mb-4 sm:mb-6 rounded-lg text-sm p-4 ${
              error 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
            }`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 mr-3 ${error ? 'text-red-500' : 'text-green-500'}`}>
                  {error ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium">{error ? 'Error' : 'Success'}</p>
                  <p className="mt-1">{error || success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Steps */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
            {/* Step 1: Select Loan Type - Mobile Optimized */}
            {step === 1 && (
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Loan Type</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">Choose the type of loan you want to apply for</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {loanTypes.map((loan) => (
                    <button
                      key={loan.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, loan_type: loan.id }));
                        setError('');
                      }}
                      className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                        formData.loan_type === loan.id
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mr-3 sm:mr-4 ${
                          formData.loan_type === loan.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {loan.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{loan.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                            {loan.id === 'vehicle' && 'For cars, bikes & other vehicles'}
                            {loan.id === 'education' && 'For studies, courses & education'}
                            {loan.id === 'personal' && 'For personal needs & expenses'}
                            {loan.id === 'house' && 'For home purchase & renovation'}
                          </p>
                        </div>
                        <div className={`ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.loan_type === loan.id 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {formData.loan_type === loan.id && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Details - Mobile Optimized */}
            {step === 2 && (
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Personal Details</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">Fill in your personal information</p>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">+91</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                          placeholder="9876543210"
                          maxLength="10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors resize-none"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>
                  
                  <div className="sm:w-1/2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                        placeholder="500000"
                        min="1000"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">INR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload - Mobile Optimized */}
            {step === 3 && (
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Upload Documents</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  Upload required documents for your {formData.loan_type || 'loan'} application
                </p>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Common Documents */}
                  {[
                    { name: 'aadhaar', label: 'Aadhaar Card', required: true },
                    { name: 'pan', label: 'PAN Card', required: true },
                    { name: 'salarySlip', label: 'Salary Slip (Last 3 months)', required: true },
                    { name: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true },
                  ].map((doc) => (
                    <div key={doc.name} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{doc.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                          </div>
                        </div>
                        {doc.required && (
                          <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Required</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <input
                            type="file"
                            name={doc.name}
                            onChange={handleFileChange}
                            className="block w-full text-xs sm:text-sm text-gray-500 
                              file:mr-3 file:py-2 file:px-4 
                              file:rounded-lg file:border-0 
                              file:text-xs sm:file:text-sm 
                              file:font-semibold
                              file:bg-blue-600 file:text-white
                              hover:file:bg-blue-700
                              transition-colors"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>
                        {files[doc.name] && (
                          <div className="ml-3 flex items-center text-green-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">Uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loan-specific Documents */}
                  {formData.loan_type === 'vehicle' && (
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600">🚗</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Vehicle RC Book</h3>
                            <p className="text-xs text-gray-500 mt-1">Vehicle registration document</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Required</span>
                      </div>
                      <input
                        type="file"
                        name="rc"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 
                          file:mr-3 file:py-2 file:px-4 
                          file:rounded-lg file:border-0 
                          file:text-xs sm:file:text-sm 
                          file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          transition-colors"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}

                  {formData.loan_type === 'education' && (
                    <>
                      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-600">📊</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Fee Structure</h3>
                              <p className="text-xs text-gray-500 mt-1">Official fee structure from institution</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Required</span>
                        </div>
                        <input
                          type="file"
                          name="fee_structure"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-500 
                            file:mr-3 file:py-2 file:px-4 
                            file:rounded-lg file:border-0 
                            file:text-xs sm:file:text-sm 
                            file:font-semibold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700
                            transition-colors"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-600">🎓</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Admission Letter</h3>
                              <p className="text-xs text-gray-500 mt-1">Official admission confirmation</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Required</span>
                        </div>
                        <input
                          type="file"
                          name="admission_letter"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-500 
                            file:mr-3 file:py-2 file:px-4 
                            file:rounded-lg file:border-0 
                            file:text-xs sm:file:text-sm 
                            file:font-semibold
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700
                            transition-colors"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </>
                  )}

                  {formData.loan_type === 'house' && (
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600">🏠</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Property Documents</h3>
                            <p className="text-xs text-gray-500 mt-1">Ownership & property papers</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Required</span>
                      </div>
                      <input
                        type="file"
                        name="property_doc"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 
                          file:mr-3 file:py-2 file:px-4 
                          file:rounded-lg file:border-0 
                          file:text-xs sm:file:text-sm 
                          file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          transition-colors"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons - Mobile Optimized */}
            <div className="mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  )}
                </div>
                <div>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold text-sm sm:text-base transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                      Continue
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold text-sm sm:text-base transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Submit Application
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Step Indicator - Mobile Only */}
              <div className="mt-4 text-center text-xs text-gray-500 sm:hidden">
                Step {step} of 3
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Padding */}
      <div className="h-16 sm:h-0"></div>
    </div>
  );
};

export default ApplyLoan;