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
        navigate('/user/loans');
      }, 2000);
    } catch (err) {
      setError(err.msg || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <nav className="bg-white shadow-sm border-b">
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
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden text-sm">Back</span>
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate ml-1">
                Apply for Loan
              </h1>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ml-2">
              Step <span className="font-bold">{step}</span> of 3
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="px-2 sm:px-4 py-4 sm:py-6 md:px-0">
          {/* Progress Bar - Mobile Responsive */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="text-sm sm:text-base">{num}</span>
                  </div>
                  {num < 3 && (
                    <div className={`w-12 sm:w-16 md:w-24 h-1 mx-1 sm:mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 px-1">
              <span className="text-center w-1/3">Select Loan Type</span>
              <span className="text-center w-1/3">Personal Details</span>
              <span className="text-center w-1/3">Upload Documents</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {(error || success) && (
            <div className={`mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {error || success}
            </div>
          )}

          {/* Form Steps */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
            {/* Step 1: Select Loan Type - Mobile Responsive */}
            {step === 1 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Select Loan Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {loanTypes.map((loan) => (
                    <button
                      key={loan.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, loan_type: loan.id }));
                        setError('');
                      }}
                      className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                        formData.loan_type === loan.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{loan.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base sm:text-lg truncate">{loan.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                            {loan.id === 'vehicle' && 'For cars, bikes & other vehicles'}
                            {loan.id === 'education' && 'For studies, courses & education'}
                            {loan.id === 'personal' && 'For personal needs & expenses'}
                            {loan.id === 'house' && 'For home purchase & renovation'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Details - Mobile Responsive */}
            {step === 2 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Required Loan Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 sm:top-3 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full pl-7 sm:pl-8 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Loan amount"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload - Mobile Responsive */}
            {step === 3 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Upload Required Documents</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Please upload the following documents for {formData.loan_type} loan application
                </p>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Common Documents */}
                  {[
                    { name: 'aadhaar', label: 'Aadhaar Card', required: true },
                    { name: 'pan', label: 'PAN Card', required: true },
                    { name: 'salarySlip', label: 'Salary Slip (Last 3 months)', required: true },
                    { name: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true },
                  ].map((doc) => (
                    <div key={doc.name} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        {doc.label} {doc.required && '*'}
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <input
                          type="file"
                          name={doc.name}
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {files[doc.name] && (
                          <span className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-0">
                            ✓ Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loan-specific Documents */}
                  {formData.loan_type === 'vehicle' && (
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Vehicle RC Book *
                      </label>
                      <input
                        type="file"
                        name="rc"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}

                  {formData.loan_type === 'education' && (
                    <>
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Fee Structure *
                        </label>
                        <input
                          type="file"
                          name="fee_structure"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Admission Letter *
                        </label>
                        <input
                          type="file"
                          name="admission_letter"
                          onChange={handleFileChange}
                          className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </>
                  )}

                  {formData.loan_type === 'house' && (
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Property Documents *
                      </label>
                      <input
                        type="file"
                        name="property_doc"
                        onChange={handleFileChange}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons - Mobile Responsive */}
            <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">← Back</span>
                    <span className="sm:hidden">← Back</span>
                  </button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next Step →</span>
                    <span className="sm:hidden">Next →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm sm:text-base disabled:opacity-70 w-32 sm:w-auto"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs sm:text-sm">Submitting...</span>
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Submit Application</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplyLoan;