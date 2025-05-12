import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthUtils';
import '../styles/application-form.css';

const ScholarshipApplicationForm = ({ scholarshipId, onSuccess, onCancel }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    academicInfo: {
      gpa: '',
      transcriptUrl: ''
    },
    statement: '',
    documents: []
  });
  const [documentInputs, setDocumentInputs] = useState([
    { type: 'recommendation', url: '', name: '' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDocumentChange = (index, field, value) => {
    const updatedDocuments = [...documentInputs];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      [field]: value
    };
    setDocumentInputs(updatedDocuments);
  };

  const addDocumentInput = () => {
    setDocumentInputs([
      ...documentInputs,
      { type: 'other', url: '', name: '' }
    ]);
  };

  const removeDocumentInput = (index) => {
    const updatedDocuments = [...documentInputs];
    updatedDocuments.splice(index, 1);
    setDocumentInputs(updatedDocuments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.academicInfo.gpa || !formData.academicInfo.transcriptUrl || !formData.statement) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Format documents array
    const validDocuments = documentInputs.filter(doc => doc.url && doc.name);
    const applicationData = {
      ...formData,
      documents: validDocuments
    };
    
    try {
      setLoading(true);
      const response = await axios.post(
        `/api/students/scholarships/${scholarshipId}/apply`,
        applicationData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Application submitted successfully!');
        onSuccess(response.data.application);
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <h2>Scholarship Application</h2>
      
      <div className="form-section">
        <h3>Academic Information</h3>
        
        <div className="form-group">
          <label htmlFor="gpa">Current GPA <span className="required">*</span></label>
          <input
            type="number"
            id="gpa"
            name="academicInfo.gpa"
            step="0.01"
            min="0"
            max="4.0"
            value={formData.academicInfo.gpa}
            onChange={handleChange}
            required
            className="form-control"
          />
          <small>Enter your GPA on a 4.0 scale</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="transcriptUrl">Transcript URL <span className="required">*</span></label>
          <input
            type="url"
            id="transcriptUrl"
            name="academicInfo.transcriptUrl"
            value={formData.academicInfo.transcriptUrl}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="https://example.com/transcript"
          />
          <small>Provide a link to your latest academic transcript</small>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Personal Statement <span className="required">*</span></h3>
        <textarea
          name="statement"
          value={formData.statement}
          onChange={handleChange}
          required
          className="form-control"
          rows="6"
          minLength="100"
          maxLength="2000"
          placeholder="Tell us why you deserve this scholarship (100-2000 characters)"
        ></textarea>
        <small>{formData.statement.length}/2000 characters</small>
      </div>
      
      <div className="form-section">
        <h3>Additional Documents (Optional)</h3>
        
        {documentInputs.map((doc, index) => (
          <div key={index} className="document-entry">
            <div className="form-row">
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={doc.type}
                  onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                  className="form-control"
                >
                  <option value="recommendation">Recommendation Letter</option>
                  <option value="financial">Financial Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Document Name</label>
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                  className="form-control"
                  placeholder="e.g., Professor Smith's Letter"
                />
              </div>
              
              <div className="form-group">
                <label>Document URL</label>
                <input
                  type="url"
                  value={doc.url}
                  onChange={(e) => handleDocumentChange(index, 'url', e.target.value)}
                  className="form-control"
                  placeholder="https://example.com/document"
                />
              </div>
            </div>
            
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeDocumentInput(index)}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={addDocumentInput}
        >
          Add Another Document
        </button>
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default ScholarshipApplicationForm; 