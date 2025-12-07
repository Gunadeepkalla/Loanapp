import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loanId, amount, loanType } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('full');
  const [paymentType, setPaymentType] = useState('credit_card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedEMIMonths, setSelectedEMIMonths] = useState(12);
  const [partialAmount, setPartialAmount] = useState('');
  
  const loanAmount = parseFloat(amount || 0);
  const processingFee = 500;
  const gst = 90;
  const totalAmount = loanAmount + processingFee + gst;
  
  // Get current date and time
  const currentDate = format(new Date(), 'dd-MM-yyyy');
  const currentTime = format(new Date(), 'HH:mm');
  
  // EMI Calculation
  const calculateEMI = (principal, annualRate, months) => {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };
  
  const emiOptions = [
    { months: 6, label: '6 Months', rate: 12 },
    { months: 12, label: '12 Months', rate: 12 },
    { months: 18, label: '18 Months', rate: 12.5 },
    { months: 24, label: '24 Months', rate: 13 },
    { months: 36, label: '36 Months', rate: 13.5 }
  ];
  
  const selectedEMI = emiOptions.find(option => option.months === selectedEMIMonths);
  const emiAmount = calculateEMI(totalAmount, selectedEMI?.rate || 12, selectedEMIMonths);
  const totalEMIAmount = emiAmount * selectedEMIMonths;
  const interestAmount = totalEMIAmount - totalAmount;
  
  useEffect(() => {
    // Set partial amount to 50% of total
    setPartialAmount(Math.round(totalAmount * 0.5).toString());
  }, [totalAmount]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setProcessing(false);
      
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 2000);
    }, 1500);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handlePartialAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || parseFloat(value) <= totalAmount) {
      setPartialAmount(value);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Minimal */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm text-gray-500">
            <span className="font-medium">ENG</span> | {currentDate}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-4 pb-8">
        {success ? (
          <div className="mt-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
              <div className="animate-pulse text-sm text-gray-500">
                Redirecting...
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section - Clean */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Complete Your Payment
              </h1>
              <p className="text-gray-600 mb-6">
                Choose from multiple flexible payment options
              </p>
              
              {/* Total Amount Card */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Total Amount</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">{currentTime}</p>
                  </div>
                </div>
              </div>
              
              {/* Loan Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Loan Details</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Loan ID</span>
                      <span className="text-sm text-gray-900">#{loanId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Type</span>
                      <span className="text-sm text-gray-900 capitalize">{loanType || 'Personal'} Loan</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Principal Amount</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loanAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-4">Select Payment Option</h3>
              
              <div className="space-y-3">
                {/* Full Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('full')}
                  className={`w-full p-4 border rounded-xl flex justify-between items-center transition-all ${
                    paymentMethod === 'full' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      paymentMethod === 'full' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'full' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Full Payment</div>
                      <div className="text-sm text-gray-600">Pay entire amount</div>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-700">
                    {formatCurrency(totalAmount)}
                  </div>
                </button>

                {/* Partial Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('partial')}
                  className={`w-full p-4 border rounded-xl flex justify-between items-center transition-all ${
                    paymentMethod === 'partial' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      paymentMethod === 'partial' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'partial' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Partial Payment</div>
                      <div className="text-sm text-gray-600">Pay a portion now</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Choose amount
                  </div>
                </button>
                
                {/* EMI Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('emi')}
                  className={`w-full p-4 border rounded-xl flex justify-between items-center transition-all ${
                    paymentMethod === 'emi' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      paymentMethod === 'emi' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'emi' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">EMI Payment</div>
                      <div className="text-sm text-gray-600">Pay in installments</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-700">
                    {formatCurrency(emiAmount)}/month
                  </div>
                </button>
              </div>
            </div>

            {/* Partial Payment Amount Input */}
            {paymentMethod === 'partial' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount to Pay Now
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="text"
                    value={partialAmount}
                    onChange={handlePartialAmountChange}
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum: {formatCurrency(totalAmount * 0.1)} (10%)
                </p>
              </div>
            )}

            {/* EMI Options */}
            {paymentMethod === 'emi' && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Select EMI Plan</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {emiOptions.map((option) => (
                    <button
                      key={option.months}
                      type="button"
                      onClick={() => setSelectedEMIMonths(option.months)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedEMIMonths === option.months
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {formatCurrency(calculateEMI(totalAmount, option.rate, option.months))}/month
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'credit-card', label: 'Card', icon: '💳' },
                  { id: 'debit-card', label: 'Card', icon: '💳' },
                  { id: 'net-banking', label: 'Bank', icon: '🏦' },
                  { id: 'upi', label: 'UPI', icon: '📱' }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentType(method.id)}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      paymentType === method.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{method.icon}</div>
                    <span className="text-xs text-gray-900">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="sticky bottom-4">
              <button
                onClick={handleSubmit}
                disabled={processing}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {paymentMethod === 'full' && `Pay ${formatCurrency(totalAmount)} Now`}
                    {paymentMethod === 'partial' && `Pay ${partialAmount ? formatCurrency(parseFloat(partialAmount)) : 'Now'}`}
                    {paymentMethod === 'emi' && `Start EMI of ${formatCurrency(emiAmount)}/month`}
                  </>
                )}
              </button>
            </div>

            {/* Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loan Amount</span>
                  <span className="font-medium">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">{formatCurrency(processingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">{formatCurrency(gst)}</span>
                </div>
                
                {paymentMethod === 'emi' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest</span>
                      <span className="font-medium text-red-600">{formatCurrency(interestAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">EMI Amount</span>
                      <span className="font-medium">{formatCurrency(emiAmount)}/month</span>
                    </div>
                  </>
                )}
                
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {paymentMethod === 'full' ? 'Total Payable' : 
                       paymentMethod === 'partial' ? 'Amount to Pay Now' : 
                       'Monthly EMI'}
                    </span>
                    <span className="text-lg font-semibold text-blue-700">
                      {paymentMethod === 'full' && formatCurrency(totalAmount)}
                      {paymentMethod === 'partial' && (partialAmount ? formatCurrency(parseFloat(partialAmount)) : '₹0')}
                      {paymentMethod === 'emi' && formatCurrency(emiAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation - Simple */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
        <div className="max-w-md mx-auto flex justify-center">
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} VASU CONSULTANCY • Secure Payment Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;