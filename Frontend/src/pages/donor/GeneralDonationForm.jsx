import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiLock } from 'react-icons/fi';
import '../../styles/donationForm.css';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const GeneralDonationForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(100);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const handleAmountChange = (e) => {
    const newAmount = parseFloat(e.target.value);
    if (!isNaN(newAmount) && newAmount > 0) {
      setAmount(newAmount);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (processing) return;
    
    setProcessing(true);
    setError('');
    
    try {
      // Create a Checkout Session
      const response = await axios.post(
        '/api/payments/create-checkout-session',
        { 
          amount,
          isAnonymous 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      if (!response.data.success) {
        throw new Error('Failed to create checkout session');
      }
      
      // Get the Stripe instance
      const stripe = await stripePromise;
      
      // Redirect to Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'An error occurred during payment processing');
    } finally {
      setProcessing(false);
    }
  };
  
  const predefinedAmounts = [50, 100, 250, 500, 1000];
  
  return (
    <div className="donation-container">
      <div className="donation-wrapper">
        <div className="donation-header">
          <h1 className="donation-title">Support Our Mission</h1>
          <p className="donation-subtitle">Your donation helps us connect more students with life-changing educational opportunities.</p>
        </div>
        
        <div className="donation-card">
          <div className="card-header">
            <FiCreditCard />
            <h2>Make a Donation</h2>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message">
                  <FiAlertCircle className="error-icon" />
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Select Donation Amount</label>
                <div className="amount-grid">
                  {predefinedAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`amount-button ${amount === preset ? 'active' : ''}`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="amount-input"
                    min="1"
                    step="1"
                  />
                </div>
              </div>
              
              <div className="anonymous-section">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(!isAnonymous)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">Make this donation anonymous</span>
                </div>
                <p className="anonymous-hint">
                  Your name will not be displayed publicly if you choose to remain anonymous
                </p>
              </div>
              
              <button
                type="submit"
                disabled={processing}
                className="submit-button"
              >
                {processing ? (
                  <span className="processing-indicator">
                    <div className="spinner"></div>
                    Processing...
                  </span>
                ) : (
                  `Proceed to Payment - ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(amount)}`
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="footer-security">
          <div className="footer-security-icon">
            <FiLock />
            Secure Payment by Stripe
          </div>
          <p>Your financial information is encrypted and secure.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralDonationForm; 