import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import { FiPlusCircle, FiEye, FiEdit, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import '../../styles/donor.css';

const DonorScholarships = () => {
  const { token } = useAuth();
  const [scholarships, setScholarships] = useState({
    pending: [],
    active: [],
    rejected: [],
    closed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonorScholarships = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('/api/scholarships/donor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setScholarships(response.data.scholarships);
          console.log("Fetched scholarships:", response.data.scholarships);
        } else {
          setError('Failed to fetch scholarships');
        }
      } catch (err) {
        console.error('Error fetching scholarships:', err);
        setError(err.response?.data?.message || 'Error loading scholarships');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonorScholarships();
  }, [token]);

  // Combine all scholarships for display
  const allScholarships = [
    ...scholarships.active.map(s => ({ ...s, statusLabel: 'Active' })),
    ...scholarships.pending.map(s => ({ ...s, statusLabel: 'Pending Approval' })),
    ...scholarships.rejected.map(s => ({ ...s, statusLabel: 'Rejected' })),
    ...scholarships.closed.map(s => ({ ...s, statusLabel: 'Closed' }))
  ];
  
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Active':
        return 'donor-badge donor-badge-success';
      case 'Pending Approval':
        return 'donor-badge donor-badge-pending';
      case 'Rejected':
        return 'donor-badge donor-badge-error';
      default:
        return 'donor-badge';
    }
  };

  return (
    <div className="donor-page">
      <div className="container">
        <div className="donor-page-header">
          <div className="scholarship-status-header">
            <h1 className="donor-page-title">My Scholarships</h1>
            <Link to="/donor/scholarships/create" className="scholarship-create-btn">
              <FiPlusCircle /> Create New Scholarship
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="donor-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FiLoader className="animate-spin" size={24} style={{ marginBottom: '10px', display: 'inline-block' }} />
            <p>Loading scholarships...</p>
          </div>
        ) : error ? (
          <div className="donor-card">
            <div className="donor-badge donor-badge-error" style={{ margin: '10px 0' }}>
              <FiAlertCircle /> {error}
            </div>
          </div>
        ) : allScholarships.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any scholarships yet.</p>
            <Link to="/donor/scholarships/create" className="scholarship-create-btn">
              Create Your First Scholarship
            </Link>
          </div>
        ) : (
          <div className="scholarships-table-container">
            <table className="scholarships-table">
              <thead>
                <tr>
                  <th>Scholarship Name</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allScholarships.map((scholarship) => (
                  <tr key={scholarship._id}>
                    <td>{scholarship.title}</td>
                    <td>${scholarship.amount.toLocaleString()}</td>
                    <td>
                      {new Date(scholarship.deadlineDate).toLocaleDateString()}
                    </td>
                    <td>{scholarship.applicantCount || 0}</td>
                    <td>
                      <span className={getBadgeClass(scholarship.statusLabel)}>
                        {scholarship.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="scholarship-actions">
                        <Link to={`/donor/scholarships/${scholarship._id}`} className="scholarship-action-btn">
                          <FiEye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorScholarships; 