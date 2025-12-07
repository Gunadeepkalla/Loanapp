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
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/user/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Apply for Loan</h1>
            </div>
            <div className="text-sm text-gray-600">
              Step {step} of 3
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-24 h-1 mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Select Loan Type</span>
              <span>Personal Details</span>
              <span>Upload Documents</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Form Steps */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Step 1: Select Loan Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Select Loan Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loanTypes.map((loan) => (
                    <button
                      key={loan.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, loan_type: loan.id }));
                        setError('');
                      }}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        formData.loan_type === loan.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{loan.icon}</span>
                        <div>
                          <h3 className="font-medium text-lg">{loan.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
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

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      required
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                      required
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
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Loan Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Loan amount"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Upload Required Documents</h2>
                <p className="text-gray-600 mb-6">
                  Please upload the following documents for {formData.loan_type} loan application
                </p>
                
                <div className="space-y-6">
                  {/* Common Documents */}
                  {[
                    { name: 'aadhaar', label: 'Aadhaar Card', required: true },
                    { name: 'pan', label: 'PAN Card', required: true },
                    { name: 'salarySlip', label: 'Salary Slip (Last 3 months)', required: true },
                    { name: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true },
                  ].map((doc) => (
                    <div key={doc.name} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc.label} {doc.required && '*'}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          name={doc.name}
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {files[doc.name] && (
                          <span className="text-sm text-green-600">
                            ✓ Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loan-specific Documents */}
                  {formData.loan_type === 'vehicle' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle RC Book *
                      </label>
                      <input
                        type="file"
                        name="rc"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}

                  {formData.loan_type === 'education' && (
                    <>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fee Structure *
                        </label>
                        <input
                          type="file"
                          name="fee_structure"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission Letter *
                        </label>
                        <input
                          type="file"
                          name="admission_letter"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </>
                  )}

                  {formData.loan_type === 'house' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Documents *
                      </label>
                      <input
                        type="file"
                        name="property_doc"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Application'
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