import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthUtils';
import axios from 'axios';
import { FiArrowLeft, FiEdit, FiUsers, FiClock, FiAward, FiTag, FiCalendar, FiFileText, FiCheck, FiX } from 'react-icons/fi';

const DonorScholarshipView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/scholarships/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setScholarship(response.data.scholarship);
        } else {
          setError('Failed to load scholarship details');
        }
      } catch (err) {
        console.error('Error fetching scholarship details:', err);
        setError(err.response?.data?.message || 'Error loading scholarship details');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipDetails();
  }, [id, token]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading scholarship details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/donor/scholarships')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            <FiArrowLeft className="inline mr-2" /> Back to Scholarships
          </button>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          <p>Scholarship not found</p>
          <button 
            onClick={() => navigate('/donor/scholarships')}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
          >
            <FiArrowLeft className="inline mr-2" /> Back to Scholarships
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    let color = 'gray';
    let label = status;

    switch (status) {
      case 'active':
        color = 'green';
        label = 'Active';
        break;
      case 'pending_approval':
        color = 'yellow';
        label = 'Pending Approval';
        break;
      case 'rejected':
        color = 'red';
        label = 'Rejected';
        break;
      case 'closed':
        color = 'gray';
        label = 'Closed';
        break;
      case 'expired':
        color = 'gray';
        label = 'Expired';
        break;
      default:
        color = 'gray';
    }

    return (
      <span className={`bg-${color}-100 text-${color}-800 px-3 py-1 rounded-full text-sm`}>
        {label}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/donor/scholarships')}
          className="text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="inline mr-2" /> Back to Scholarships
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-4">{scholarship.title}</h1>
          <div className="flex gap-2">
            {getStatusBadge(scholarship.status)}
          </div>
        </div>

        {scholarship.status === 'rejected' && scholarship.rejectionReason && (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
            <p className="font-semibold">Rejection Reason:</p>
            <p>{scholarship.rejectionReason}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Scholarship Details</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <FiAward className="text-blue-500 mr-2" />
                <span className="font-medium">Amount:</span>
                <span className="ml-2">${scholarship.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="text-blue-500 mr-2" />
                <span className="font-medium">Deadline:</span>
                <span className="ml-2">{new Date(scholarship.deadlineDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <FiTag className="text-blue-500 mr-2" />
                <span className="font-medium">Category:</span>
                <span className="ml-2">{scholarship.category}</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="text-blue-500 mr-2" />
                <span className="font-medium">Applicants:</span>
                <span className="ml-2">{scholarship.applicantCount || 0}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="text-blue-500 mr-2" />
                <span className="font-medium">Created:</span>
                <span className="ml-2">{new Date(scholarship.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{scholarship.description}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Eligibility Requirements</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">{scholarship.eligibilityRequirements}</p>
          </div>
        </div>

        {scholarship.criteria && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Academic Criteria</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="mb-2">
                  <span className="font-medium">Minimum GPA:</span> {scholarship.criteria.minGPA || 'Not specified'}
                </div>
                {scholarship.criteria.eligiblePrograms?.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">Eligible Programs:</span>
                    <ul className="list-disc list-inside mt-1">
                      {scholarship.criteria.eligiblePrograms.map((program, index) => (
                        <li key={index} className="text-gray-700">{program}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {scholarship.criteria.eligibleInstitutions?.length > 0 && (
                  <div>
                    <span className="font-medium">Eligible Institutions:</span>
                    <ul className="list-disc list-inside mt-1">
                      {scholarship.criteria.eligibleInstitutions.map((institution, index) => (
                        <li key={index} className="text-gray-700">{institution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Application Requirements</h2>
              <div className="bg-gray-50 p-4 rounded">
                {scholarship.criteria.requiredDocuments?.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">Required Documents:</span>
                    <ul className="list-disc list-inside mt-1">
                      {scholarship.criteria.requiredDocuments.map((doc, index) => (
                        <li key={index} className="text-gray-700">
                          {doc.charAt(0).toUpperCase() + doc.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {scholarship.criteria.additionalCriteria?.length > 0 && (
                  <div>
                    <span className="font-medium">Additional Criteria:</span>
                    <ul className="list-disc list-inside mt-1">
                      {scholarship.criteria.additionalCriteria.map((criteria, index) => (
                        <li key={index} className="text-gray-700">{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorScholarshipView; 