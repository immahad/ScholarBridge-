import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { 
  FiUser, 
  FiBook, 
  FiDollarSign, 
  FiCalendar, 
  FiArrowLeft, 
  FiMapPin,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiInfo
} from 'react-icons/fi';
import '../../styles/donor.css';

const DonationDetail = () => {
  const { donationId } = useParams();
  const { token } = useAuth();
  
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/donors/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setDonation(response.data.donation);
        } else {
          setError('Failed to load donation details');
        }
      } catch (err) {
        console.error('Error fetching donation details:', err);
        setError(err.response?.data?.message || 'Error loading donation details');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && donationId) {
      fetchDonationDetails();
    }
  }, [donationId, token]);
  
  if (loading) {
    return (
      <div className="donor-page">
        <div className="container">
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <FiLoader className="animate-spin mr-3" size={24} />
            <span>Loading donation details...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="donor-page">
        <div className="container">
          <Link to="/donor/dashboard" className="donor-back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <div className="donor-card">
            <div className="donor-badge donor-badge-error">
              <FiAlertCircle /> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!donation) {
    return (
      <div className="donor-page">
        <div className="container">
          <Link to="/donor/dashboard" className="donor-back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <div className="donor-card">
            <div className="donor-badge donor-badge-info">
              <FiInfo /> Donation not found.
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="donor-page">
      <div className="container">
        <Link to="/donor/dashboard" className="donor-back-link">
          <FiArrowLeft /> Back to Dashboard
        </Link>
        
        <div className="donor-page-header">
          <h1 className="donor-page-title">Donation Details</h1>
        </div>
        
        <div className="donor-card">
          <div className="text-center">
            <div className="donation-icon-circle">
              <FiDollarSign size={32} />
            </div>
            <div className="donation-amount-display">{formatCurrency(donation.amount)}</div>
            <div className="donation-meta">
              <FiCalendar /> {formatDate(donation.donationDate)}
            </div>
            <div className="mt-3">
              <div className="donor-badge donor-badge-success">
                <FiCheckCircle /> {donation.status === 'completed' ? 'Completed' : donation.status}
              </div>
            </div>
          </div>
          
          <div className="donation-divider"></div>
          
          <h2 className="donor-card-title">Payment Information</h2>
          <div className="payment-info-section">
            <div className="payment-info-grid">
              <div className="payment-info-item">
                <div className="donor-label">Payment Method</div>
                <div className="donor-value donor-icon-text">
                  <FiCreditCard /> {donation.paymentMethod || 'Credit Card'}
                </div>
              </div>
              
              {donation.transactionId && (
                <div className="payment-info-item">
                  <div className="donor-label">Transaction ID</div>
                  <div className="transaction-id">{donation.transactionId}</div>
                </div>
              )}
              
              {donation.isAnonymous !== undefined && (
                <div className="payment-info-item">
                  <div className="donor-label">Anonymity</div>
                  <div className="donor-value">
                    {donation.isAnonymous ? 'Anonymous Donation' : 'Public Donation'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {donation.notes && (
            <>
              <div className="donation-divider"></div>
              <div>
                <div className="donor-label">Notes</div>
                <div className="donor-value">{donation.notes}</div>
              </div>
            </>
          )}
        </div>
        
        <div className="donor-card">
          <h2 className="donor-card-title">Scholarship Information</h2>
          
          {donation.scholarship ? (
            <div className="donation-info-grid">
              <div>
                <div className="donor-label">Scholarship Name</div>
                <div className="donor-value">{donation.scholarship.title || 'General Donation'}</div>
              </div>
              
              {donation.scholarship.amount && (
                <div>
                  <div className="donor-label">Scholarship Amount</div>
                  <div className="donor-value donor-icon-text">
                    <FiDollarSign /> {formatCurrency(donation.scholarship.amount)}
                  </div>
                </div>
              )}
              
              {donation.scholarship.description && (
                <div className="col-span-full">
                  <div className="donor-label">Description</div>
                  <div className="donor-value">{donation.scholarship.description}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="donation-info-grid">
              <div>
                <div className="donor-label">Donation Type</div>
                <div className="donor-value">General Donation</div>
              </div>
              
              <div>
                <div className="donor-label">Amount</div>
                <div className="donor-value donor-icon-text">
                  <FiDollarSign /> {formatCurrency(donation.amount)}
                </div>
              </div>
              
              <div className="col-span-full">
                <div className="donor-label">Description</div>
                <div className="donor-value">General donation to the ScholarBridge Foundation</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="donor-card">
          <h2 className="donor-card-title">Student Information</h2>
          
          {donation.student ? (
            <div className="donation-info-grid">
              <div>
                <div className="donor-label">Student Name</div>
                <div className="donor-value">
                  {(donation.student.firstName === 'General' && donation.student.lastName === 'Fund')
                    ? 'General Fund'
                    : `${donation.student.firstName || ''} ${donation.student.lastName || ''}`.trim() || 'N/A'}
                </div>
              </div>
              
              {donation.student.institution && donation.student.institution !== 'ScholarBridge Foundation' && (
                <div>
                  <div className="donor-label">Institution</div>
                  <div className="donor-value donor-icon-text">
                    <FiMapPin /> {donation.student.institution}
                  </div>
                </div>
              )}
              
              {donation.student.program && donation.student.program !== 'General Support' && (
                <div>
                  <div className="donor-label">Program</div>
                  <div className="donor-value donor-icon-text">
                    <FiBook /> {donation.student.program}
                  </div>
                </div>
              )}
              
              {donation.application && (
                <div>
                  <div className="donor-label">Application Status</div>
                  <div className="donor-value">{donation.application.status}</div>
                  {donation.application.fundedAt && (
                    <div className="donor-value">
                      Funded on {formatDate(donation.application.fundedAt)}
                    </div>
                  )}
                </div>
              )}
              
              {(donation.student.firstName === 'General' && donation.student.lastName === 'Fund') && (
                <div className="col-span-full">
                  <div className="donor-label">Information</div>
                  <div className="donor-value">
                    This donation was made to the general fund and will be used to support multiple students.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No specific student information available for this donation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetail; 