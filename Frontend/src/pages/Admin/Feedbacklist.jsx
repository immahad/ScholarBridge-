import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:3333/ifl_system/auth/api/feedback');
        setFeedbacks(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center mt-10">Error loading feedbacks</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">All Feedbacks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Subject</th>
              <th className="py-2 px-4 border-b">Purpose</th>
              <th className="py-2 px-4 border-b">Suggestions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{feedback.email}</td>
                <td className="py-2 px-4 border-b">{feedback.subject}</td>
                <td className="py-2 px-4 border-b">{feedback.purpose}</td>
                <td className="py-2 px-4 border-b">{feedback.suggestions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackList;
