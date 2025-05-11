import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/createScholarship.css'; // To be created
import { FiPlusCircle, FiSave, FiX } from 'react-icons/fi';

const CreateScholarship = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', // Use 'title' instead of 'name'
    description: '',
    amount: '',
    deadline: '',
    category: 'Engineering', // Default to a valid category
    eligibilityRequirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation (can be expanded)
    if (!formData.title || !formData.amount || !formData.deadline) {
      setError('Title, Amount, and Deadline are required fields.');
      setLoading(false);
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be a positive number.');
      setLoading(false);
      return;
    }
    if (new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be a future date.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/scholarships', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(response.data.message || 'Scholarship created successfully!');
      setFormData({
        title: '',
        description: '',
        amount: '',
        deadline: '',
        category: 'Engineering',
        eligibilityRequirements: '',
      });
    } catch (err) {
      console.error('Error creating scholarship:', err);
      setError(err.response?.data?.message || 'An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="create-scholarship-container">
      <div className="page-header">
        <h1>
          <FiPlusCircle /> Create New Scholarship
        </h1>
        <p>Fill out the form below to establish a new scholarship opportunity.</p>
      </div>

      <form onSubmit={handleSubmit} className="create-scholarship-form card">
        {error && <div className="form-error-message">{error}</div>}
        {success && <div className="form-success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="title">Scholarship Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Application Deadline</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category / Field of Study</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="Engineering">Engineering</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="eligibilityRequirements">Eligibility Requirements</label>
          <textarea
            id="eligibilityRequirements"
            name="eligibilityRequirements"
            value={formData.eligibilityRequirements}
            onChange={handleChange}
            rows="4"
            placeholder="e.g., Minimum GPA, specific major, essay required..."
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : 'Create Scholarship'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <FiX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateScholarship;