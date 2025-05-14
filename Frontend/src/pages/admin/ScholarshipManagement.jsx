import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiWrench, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import { toast } from 'react-toastify';
import '../../styles/admin.css';

const ScholarshipManagement = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    approved: 0,
    pending: 0,
    expired: 0
  });

  useEffect(() => {
    fetchScholarshipStats();
  }, []);

  const fetchScholarshipStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/scholarships/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        toast.error('Failed to fetch scholarship statistics');
      }
    } catch (error) {
      console.error('Error fetching scholarship stats:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch scholarship statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchScholarships = async () => {
    try {
      const response = await axios.get('/api/admin/scholarships', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchScholarshipStats();
        toast.success('Scholarship list refreshed');
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      toast.error(error.response?.data?.message || 'Failed to refresh scholarship list');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Scholarship Management</h1>
      </div>
      
      <div className="admin-card">
        <h2 className="admin-card-title">Scholarship Statistics</h2>
        
        <div className="admin-stats-grid">
          <div className="admin-stats-item">
            <span className="admin-stats-label">Total Scholarships</span>
            <span className="admin-stats-value">{stats.total}</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">Active</span>
            <span className="admin-stats-value">{stats.active}</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">Approved</span>
            <span className="admin-stats-value">{stats.approved}</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">Pending</span>
            <span className="admin-stats-value">{stats.pending}</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">Expired</span>
            <span className="admin-stats-value">{stats.expired}</span>
          </div>
        </div>

        <div className="admin-card-actions">
          <button
            onClick={fetchScholarshipStats}
            className="admin-button admin-button-secondary"
            disabled={loading}
          >
            <FiRefreshCw />
            Refresh Statistics
          </button>
        </div>
      </div>
      
      <div className="admin-card">
        <h2 className="admin-card-title">System Actions</h2>
        
        {/* Scholarship Repair Button */}
        <div className="admin-action-item">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await axios.post('/api/admin/scholarships/fix', {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.success) {
                  toast.success('Scholarships repaired successfully');
                  console.log('Fix results:', response.data.fixed);
                  // Show detailed message
                  const { activeFixCount, approvedFixCount } = response.data.fixed;
                  const totalFixed = activeFixCount + approvedFixCount;
                  if (totalFixed > 0) {
                    toast.info(`Fixed ${totalFixed} scholarships: ${activeFixCount} active + ${approvedFixCount} approved`);
                  } else {
                    toast.info('No scholarships needed fixing');
                  }
                  // Refresh the scholarship list
                  fetchScholarships();
                } else {
                  toast.error('Failed to repair scholarships');
                }
              } catch (error) {
                console.error('Error fixing scholarships:', error);
                toast.error(error.response?.data?.message || 'Failed to repair scholarships');
              } finally {
                setLoading(false);
              }
            }}
            className="admin-button admin-button-warning"
            disabled={loading}
          >
            <FiWrench />
            Repair Scholarship Visibility
          </button>
          <p className="admin-action-description">
            Use this to fix scholarships that should be visible to students but aren't appearing correctly.
          </p>
        </div>
      </div>
      
      {loading && (
        <div className="admin-loading-spinner">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default ScholarshipManagement; 