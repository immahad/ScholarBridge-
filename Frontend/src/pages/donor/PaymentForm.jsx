import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { FiDollarSign, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';

// Initialize Stripe with publishable key from environment
// In production, this would come from an environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const PaymentForm = () => {
  const { scholarshipId, studentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [scholarship, setScholarship] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch scholarship details
        const scholarshipResponse = await axios.get(`/api/scholarships/${scholarshipId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch student details
        const studentResponse = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (scholarshipResponse.data.success && studentResponse.data.success) {
          setScholarship(scholarshipResponse.data.scholarship);
          setStudent(studentResponse.data.student);
        } else {
          setError('Failed to load scholarship or student details');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [scholarshipId, studentId, token]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-2">Loading payment details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </p>
      </div>
    );
  }
  
  if (!scholarship || !student) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
        <p className="flex items-center">
          <FiAlertCircle className="mr-2" />
          Unable to load payment information. Please try again later.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Fund Scholarship</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Scholarship Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Scholarship</p>
            <p className="font-semibold">{scholarship.title}</p>
          </div>
          <div>
            <p className="text-gray-600">Amount</p>
            <p className="font-semibold text-green-600 flex items-center">
              <FiDollarSign className="mr-1" />
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(scholarship.amount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Student</p>
            <p className="font-semibold">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <p className="text-gray-600">Institution</p>
            <p className="font-semibold">{student.institution}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            scholarship={scholarship} 
            student={student} 
            navigate={navigate}
          />
        </Elements>
      </div>
    </div>
  );
};

const CheckoutForm = ({ scholarship, student, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  
  const [amount, setAmount] = useState(scholarship.amount);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    // Create a payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(
          '/api/payments/create-payment-intent',
          {
            scholarshipId: scholarship._id,
            studentId: student._id,
            amount
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setPaymentError('Could not initialize payment. Please try again.');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setPaymentError(err.response?.data?.message || 'Failed to initialize payment');
      }
    };
    
    createPaymentIntent();
  }, [scholarship._id, student._id, amount, token]);
  
  const handleAmountChange = (e) => {
    const newAmount = parseFloat(e.target.value);
    if (!isNaN(newAmount) && newAmount > 0) {
      setAmount(newAmount);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }
    
    setProcessing(true);
    setPaymentError('');
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Donor Name', // In a real app, you would get this from the user's profile
          },
        }
      });
      
      if (error) {
        setPaymentError(error.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful, now create donation in our system
        const donationResponse = await axios.post(
          '/api/payments/make-donation',
          {
            scholarshipId: scholarship._id,
            studentId: student._id,
            amount,
            paymentMethod: 'credit_card',
            transactionId: paymentIntent.id,
            isAnonymous,
            notes: 'Donation via Stripe'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (donationResponse.data.success) {
          setPaymentSuccess(true);
          setTimeout(() => {
            navigate('/donor/dashboard');
          }, 3000);
        } else {
          setPaymentError('Payment processed but donation not recorded. Please contact support.');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'An error occurred during payment processing');
    } finally {
      setProcessing(false);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {paymentSuccess ? (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-md mb-4">
          <p className="flex items-center">
            <FiCheckCircle className="mr-2" />
            Payment successful! Thank you for your donation. Redirecting to dashboard...
          </p>
        </div>
      ) : (
        <>
          {paymentError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md mb-4">
              <p className="flex items-center">
                <FiAlertCircle className="mr-2" />
                {paymentError}
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 mb-2">Donation Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiDollarSign className="text-gray-500" />
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                className="pl-10 p-2 border rounded w-full"
                min="1"
                step="1"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="card-element" className="block text-gray-700 mb-2">Credit Card</label>
            <div className="p-3 border rounded">
              <CardElement id="card-element" options={cardElementOptions} />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Your card information is secured by Stripe. We never store your card details.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="mr-2"
              />
              Make this donation anonymous
            </label>
            <p className="text-gray-500 text-sm ml-6">
              If checked, your name will not be visible to the student receiving the scholarship.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!stripe || processing}
              className={`px-6 py-2 rounded text-white ${
                processing || !stripe
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                `Pay ${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(amount)}`
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default PaymentForm; 