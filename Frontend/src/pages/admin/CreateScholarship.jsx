import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import { scholarshipService } from '../../services/api';
import '../../styles/createScholarship.css';
import { FiPlusCircle, FiSave, FiX, FiAlertTriangle } from 'react-icons/fi';

const AdminCreateScholarship = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    deadline: '',
    category: 'Engineering',
    eligibilityRequirements: '',
    criteria: {
      minGPA: 0,
      requiredDocuments: ['transcript'],
      eligibleInstitutions: [],
      eligiblePrograms: [],
      additionalCriteria: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // For handling multi-select options
  const [newInstitution, setNewInstitution] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('criteria.')) {
      const criteriaField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          [criteriaField]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentsChange = (document) => {
    const currentDocs = formData.criteria.requiredDocuments;
    const updatedDocs = currentDocs.includes(document)
      ? currentDocs.filter(doc => doc !== document)
      : [...currentDocs, document];
    
    setFormData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        requiredDocuments: updatedDocs
      }
    }));
  };
  
  const addListItem = (type, value) => {
    if (!value.trim()) return;
    
    if (type === 'institution') {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          eligibleInstitutions: [...prev.criteria.eligibleInstitutions, value.trim()]
        }
      }));
      setNewInstitution('');
    } else if (type === 'program') {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          eligiblePrograms: [...prev.criteria.eligiblePrograms, value.trim()]
        }
      }));
      setNewProgram('');
    } else if (type === 'criteria') {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          additionalCriteria: [...prev.criteria.additionalCriteria, value.trim()]
        }
      }));
      setNewCriteria('');
    }
  };
  
  const removeListItem = (type, index) => {
    if (type === 'institution') {
      const updated = [...formData.criteria.eligibleInstitutions];
      updated.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          eligibleInstitutions: updated
        }
      }));
    } else if (type === 'program') {
      const updated = [...formData.criteria.eligiblePrograms];
      updated.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          eligiblePrograms: updated
        }
      }));
    } else if (type === 'criteria') {
      const updated = [...formData.criteria.additionalCriteria];
      updated.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          additionalCriteria: updated
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.name || !formData.amount || !formData.deadline) {
        setError('Name, Amount, and Deadline are required fields.');
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

      // Format the data according to the backend controller's requirements
      const scholarshipData = {
        name: formData.name,
        title: formData.name,
        description: formData.description,
        amount: parseFloat(formData.amount),
        deadline: formData.deadline,
        category: formData.category,
        eligibilityRequirements: formData.eligibilityRequirements || "Open to all eligible students",
        // Only include criteria if required fields are provided
        criteria: {
          minGPA: parseFloat(formData.criteria.minGPA) || 0,
          requiredDocuments: formData.criteria.requiredDocuments || ['transcript'],
          eligibleInstitutions: formData.criteria.eligibleInstitutions || [],
          eligiblePrograms: formData.criteria.eligiblePrograms || [],
          additionalCriteria: formData.criteria.additionalCriteria || []
        }
      };

      console.log("Submitting scholarship data:", scholarshipData);

      // Use the scholarship service to create a scholarship
      const response = await scholarshipService.createScholarship(scholarshipData);

      console.log("Success response:", response.data);
      setSuccess('Scholarship created successfully!');
      
      // Show success message for 3 seconds, then redirect
      setTimeout(() => {
        navigate('/admin/scholarships');
      }, 3000);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        amount: '',
        deadline: '',
        category: 'Engineering',
        eligibilityRequirements: '',
        criteria: {
          minGPA: 0,
          requiredDocuments: ['transcript'],
          eligibleInstitutions: [],
          eligiblePrograms: [],
          additionalCriteria: []
        }
      });
    } catch (err) {
      console.error('Error creating scholarship:', err.response || err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create scholarship. Please try again.';
      setError(`${errorMessage} ${err.response?.status === 403 ? '(Permission denied)' : ''}`);
    }
    setLoading(false);
  };

  return (
    <div className="create-scholarship-container">
      <div className="page-header">
        <h1>
          <FiPlusCircle /> Create New Scholarship
        </h1>
        <p>Create a new scholarship opportunity for students.</p>
      </div>

      <form onSubmit={handleSubmit} className="create-scholarship-form card">
        {error && (
          <div className="form-error-message">
            <FiAlertTriangle className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="form-success-message">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Scholarship Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
        
        <h3 className="text-lg font-semibold mt-6 mb-4">Advanced Criteria</h3>
        
        <div className="form-group">
          <label htmlFor="criteria.minGPA">Minimum GPA</label>
          <input
            type="number"
            id="criteria.minGPA"
            name="criteria.minGPA"
            value={formData.criteria.minGPA}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="4"
          />
        </div>
        
        <div className="form-group">
          <label>Required Documents</label>
          <div className="checkbox-group grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="doc-transcript"
                checked={formData.criteria.requiredDocuments.includes('transcript')}
                onChange={() => handleDocumentsChange('transcript')}
                className="mr-2"
              />
              <label htmlFor="doc-transcript">Transcript</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="doc-recommendation"
                checked={formData.criteria.requiredDocuments.includes('recommendation')}
                onChange={() => handleDocumentsChange('recommendation')}
                className="mr-2"
              />
              <label htmlFor="doc-recommendation">Recommendation Letter</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="doc-financial"
                checked={formData.criteria.requiredDocuments.includes('financial')}
                onChange={() => handleDocumentsChange('financial')}
                className="mr-2"
              />
              <label htmlFor="doc-financial">Financial Documents</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="doc-id"
                checked={formData.criteria.requiredDocuments.includes('id')}
                onChange={() => handleDocumentsChange('id')}
                className="mr-2"
              />
              <label htmlFor="doc-id">ID Verification</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="doc-essay"
                checked={formData.criteria.requiredDocuments.includes('essay')}
                onChange={() => handleDocumentsChange('essay')}
                className="mr-2"
              />
              <label htmlFor="doc-essay">Essay</label>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Eligible Institutions</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInstitution}
              onChange={(e) => setNewInstitution(e.target.value)}
              placeholder="Add institution..."
              className="flex-grow"
            />
            <button 
              type="button" 
              onClick={() => addListItem('institution', newInstitution)}
              className="px-3 py-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <div className="tags-list">
            {formData.criteria.eligibleInstitutions.map((inst, index) => (
              <div key={index} className="tag-item">
                {inst}
                <button 
                  type="button" 
                  onClick={() => removeListItem('institution', index)}
                  className="tag-remove"
                >
                  &times;
                </button>
              </div>
            ))}
            {formData.criteria.eligibleInstitutions.length === 0 && (
              <p className="text-sm text-gray-500 italic">No institutions added (open to all)</p>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Eligible Programs</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newProgram}
              onChange={(e) => setNewProgram(e.target.value)}
              placeholder="Add program..."
              className="flex-grow"
            />
            <button 
              type="button" 
              onClick={() => addListItem('program', newProgram)}
              className="px-3 py-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <div className="tags-list">
            {formData.criteria.eligiblePrograms.map((prog, index) => (
              <div key={index} className="tag-item">
                {prog}
                <button 
                  type="button" 
                  onClick={() => removeListItem('program', index)}
                  className="tag-remove"
                >
                  &times;
                </button>
              </div>
            ))}
            {formData.criteria.eligiblePrograms.length === 0 && (
              <p className="text-sm text-gray-500 italic">No programs added (open to all)</p>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Additional Criteria</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              placeholder="Add additional criteria..."
              className="flex-grow"
            />
            <button 
              type="button" 
              onClick={() => addListItem('criteria', newCriteria)}
              className="px-3 py-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <div className="tags-list">
            {formData.criteria.additionalCriteria.map((crit, index) => (
              <div key={index} className="tag-item">
                {crit}
                <button 
                  type="button" 
                  onClick={() => removeListItem('criteria', index)}
                  className="tag-remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSave /> {loading ? 'Creating...' : 'Create Scholarship'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/admin/scholarships')}
            disabled={loading}
          >
            <FiX /> Cancel
          </button>
        </div>
      </form>
      
      <style>
        {`
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .tag-item {
          background-color: #e5f0ff;
          border: 1px solid #cce0ff;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }
        .tag-remove {
          margin-left: 0.5rem;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
        .tag-remove:hover {
          background-color: #e0e0e0;
        }
        .checkbox-group {
          margin-top: 0.5rem;
        }
        `}
      </style>
    </div>
  );
};

export default AdminCreateScholarship; 