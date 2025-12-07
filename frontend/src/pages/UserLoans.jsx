// ApplyLoan.js - Complete with file upload indicators
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../assets/Logo';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loanType, setLoanType] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    loan_type: '',
    full_name: '',
    phone: '',
    address: '',
    salary: ''
  });

  // File state with upload status
  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    salarySlip: null,
    rc: null,
    property_doc: null,
    fee_structure: null,
    bank_statement: null,
    admission_letter: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({});

  // Loan type configurations
  const loanTypes = [
    { id: 'vehicle', name: 'Vehicle Loan', icon: '🚗', description: 'For car/bike purchase' },
    { id: 'education', name: 'Education Loan', icon: '🎓', description: 'For studies/fees' },
    { id: 'house', name: 'House Loan', icon: '🏠', description: 'For property purchase' },
    { id: 'personal', name: 'Personal Loan', icon: '💼', description: 'For personal expenses' }
  ];

  // Required documents for each loan type
  const requiredDocs = {
    vehicle: ['aadhaar', 'pan', 'salarySlip', 'bank_statement', 'rc'],
    education: ['aadhaar', 'pan', 'salarySlip', 'bank_statement', 'admission_letter', 'fee_structure'],
    house: ['aadhaar', 'pan', 'salarySlip', 'bank_statement', 'property_doc'],
    personal: ['aadhaar', 'pan', 'salarySlip', 'bank_statement']
  };

  // Document labels
  const docLabels = {
    aadhaar: 'Aadhaar Card',
    pan: 'PAN Card',
    salarySlip: 'Salary Slip (Last 3 months)',
    bank_statement: 'Bank Statement (6 months)',
    rc: 'Vehicle RC (Registration Certificate)',
    property_doc: 'Property Documents',
    fee_structure: 'Fee Structure from Institution',
    admission_letter: 'Admission Letter'
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload with progress indication
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only PDF, JPEG or PNG files');
      return;
    }

    // Update file state
    setFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Mark as uploaded with delay for visual feedback
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: false // Uploading
    }));

    // Simulate upload delay
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: true // Uploaded
      }));
    }, 300);
  };

  // Remove file
  const removeFile = (fieldName) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  // Handle loan type selection
  const handleLoanTypeSelect = (type) => {
    setLoanType(type);
    setFormData(prev => ({ ...prev, loan_type: type }));
    setStep(2);
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loanType) {
      alert('Please select a loan type');
      return;
    }

    // Check required files
    const required = requiredDocs[loanType] || [];
    const missingFiles = required.filter(doc => !files[doc]);
    
    if (missingFiles.length > 0) {
      alert(`Please upload: ${missingFiles.map(doc => docLabels[doc]).join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.applyForLoan(formData, files);
      
      alert('Loan application submitted successfully!');
      navigate('/user/loans');
    } catch (error) {
      console.error('Application error:', error);
      alert(error.msg || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Loan Type Selection
  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Select Loan Type</h1>
        <p className="text-gray-600">Choose the type of loan that fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loanTypes.map((loan) => (
          <button
            key={loan.id}
            onClick={() => handleLoanTypeSelect(loan.id)}
            className="group bg-white border-2 border-gray-200 rounded-2xl p-6 text-left hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl mb-4">
              {loan.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{loan.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{loan.description}</p>
            
            {/* Required docs preview */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Required Documents:</p>
              <div className="flex flex-wrap gap-1">
                {(requiredDocs[loan.id] || []).slice(0, 3).map(doc => (
                  <span key={doc} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {docLabels[doc].split(' ')[0]}
                  </span>
                ))}
                {(requiredDocs[loan.id] || []).length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{(requiredDocs[loan.id] || []).length - 3} more
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Application Form
  const renderStep2 = () => {
    const currentDocs = requiredDocs[loanType] || [];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setStep(1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Loan Types</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{loanType} Loan Application</h1>
            <p className="text-gray-600">Step 2 of 2: Complete your details</p>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹) *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your required loan amount"
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
            <p className="text-gray-600 mb-6">Upload clear scanned copies of the following documents (Max 5MB each)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentDocs.map((doc) => (
                <div key={doc} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{docLabels[doc]}</h3>
                      <p className="text-sm text-gray-500">PDF, JPEG, PNG (Max 5MB)</p>
                    </div>
                    
                    {/* Upload Status Indicator */}
                    {uploadedFiles[doc] && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {files[doc] ? (
                      <div className="flex items-center space-x-3 w-full">
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {files[doc].name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(files[doc].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(doc)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="w-full">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-600">
                            Click to upload
                          </p>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, doc)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Progress Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Uploaded {Object.values(files).filter(f => f).length} of {currentDocs.length} documents
                  </p>
                  <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(Object.values(files).filter(f => f).length / currentDocs.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  {Object.values(files).filter(f => f).length === currentDocs.length ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">All documents uploaded</span>
                    </div>
                  ) : (
                    <p className="text-yellow-600 text-sm">
                      {currentDocs.length - Object.values(files).filter(f => f).length} documents remaining
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.values(files).filter(f => f).length !== currentDocs.length}
              className={`px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all ${
                loading || Object.values(files).filter(f => f).length !== currentDocs.length
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go back"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <Logo size="md" showText={false} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {step === 1 ? 'Apply for Loan' : `${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan Application`}
                </h1>
                <p className="text-sm text-gray-600">
                  {step === 1 ? 'Choose your loan type' : 'Complete your application'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-600'}`}>
                  {step === 1 ? '1' : '✓'}
                </div>
                <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 ? renderStep1() : renderStep2()}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Logo size="sm" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Vasu Consultancy</p>
                <p>Professional Financial Management</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Vasu Consultancy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApplyLoan;