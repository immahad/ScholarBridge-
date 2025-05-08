import React, { useContext, useEffect, useState } from "react";
import { StudentContext } from "../../api/studentContext";
import { useSubmitProof, } from "../../api/Adminapi";

const DonorSponsoredDetails = () => {
  const { useGetUsers, useDonorDetails } = useContext(StudentContext);
  const students = useGetUsers();
  const { isLoading, isError, data } = useDonorDetails();
  const studentData = students.data;

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donorId, setDonorId] = useState(null);

  const submitProofMutation = useSubmitProof();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const foundUser = data?.find((donor) => donor.email === userEmail);

    if (foundUser) {
      setDonorId(foundUser._id); // Store donorId
      const donorStudentEmails = foundUser.students.map((s) => s.studentEmail);
      if (studentData) {
        const matchedStudents = studentData.filter((student) =>
          donorStudentEmails.includes(student.email)
        );
        setFilteredStudents(matchedStudents);
      }
    }
  }, [data, studentData]);

  const handlePayClick = (fee, studentId) => {
    setSelectedFee({ ...fee, studentId });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(URL.createObjectURL(file));
      setProofFile(file);
    }
  };

  const handlePaymentSubmit = () => {
    if (!proofFile) {
      alert("Please upload a payment proof image.");
      return;
    }
  
    const userEmail = localStorage.getItem("userEmail");
    const foundUser = data?.find((donor) => donor.email === userEmail);
  
    if (!foundUser) {
      alert("Donor not found.");
      return;
    }
  
    console.log("User Email:", userEmail);
    console.log("Found User:", foundUser);
    console.log("Selected Fee:", selectedFee);
    console.log("Proof File:", proofFile);
  
    // Convert image file to Base64
    const reader = new FileReader();
    reader.readAsDataURL(proofFile);
    reader.onloadend = () => {
      const base64String = reader.result; // Base64 encoded string
  
      console.log("Base64 Encoded Image:", base64String);
  
      // Ensure data types
      console.log("donorId type:", typeof foundUser._id, foundUser._id);
      console.log("studentId type:", typeof selectedFee._id, selectedFee._id);
      console.log("photo type:", typeof base64String);
      console.log("title type:", typeof `Fee Payment Proof for ${selectedFee.latestFee}`);
      console.log("description type:", typeof "Donor has submitted the payment proof.");
  
      const formData = {
        photo: base64String, // Store Base64 string
        title: selectedFee.latestFee,
        description: "Donor has submitted the payment proof.",
        studentId: String(selectedFee._id), // Ensure it's a string
        donorId: String(foundUser._id), // Ensure it's a string
        status: "Pending Approval",
      };
  
      console.log("Final Data to be Submitted:", formData);
  
      submitProofMutation.mutate(formData, {
        onSuccess: () => {
          alert("Payment proof submitted successfully!");
          setIsModalOpen(false);
          setProofImage(null);
          setProofFile(null);
        },
        onError: (error) => {
          console.error("Error submitting payment proof:", error);
          alert("Failed to submit payment proof. Please try again.");
        },
      });
    };
  
    reader.onerror = (error) => {
      console.error("Error converting image to Base64:", error);
      alert("Failed to process image. Please try again.");
    };
  };
  
  

  return (
    <main className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Details of Sponsored Students</h1>
      {filteredStudents.length === 0 && <p className="text-center">No sponsored students found.</p>}
      {filteredStudents.map((student, index) => (
        <section key={student._id} className="mb-8 border p-4 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Student {index + 1}</h2>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>CNIC:</strong> {student.cnic}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">Fee Status</h2>
          <div className="overflow-x-auto">
            {student?.feeDetails?.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-6 border-b text-left">Sno</th>
                    <th className="py-3 px-6 border-b text-left">Latest Fee</th>
                    <th className="py-3 px-6 border-b text-left">Status</th>
                    <th className="py-3 px-6 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {student.feeDetails.map((fee, feeIndex) => (
                    <tr key={feeIndex} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{feeIndex + 1}</td>
                      <td className="py-3 px-6 text-left">{fee.latestFee || "N/A"}</td>
                      <td className="py-3 px-6 text-left">{fee.status || "Pending"}</td>
                      <td className="py-3 px-6 text-left">
                        <button
                          onClick={() => handlePayClick(fee, student._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Pay Fees
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No fee details available.</p>
            )}
          </div>
        </section>
      ))}
      {isModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>
            <p><strong>Latest Fee:</strong> {selectedFee.latestFee || "N/A"}</p>
            <p><strong>Status:</strong> {selectedFee.status || "Pending"}</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-4" />
            {proofImage && <img src={proofImage} alt="Payment Proof" className="mt-4 w-full h-40 object-cover" />}
            <button
              onClick={handlePaymentSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full"
              disabled={submitProofMutation.isLoading}
            >
              {submitProofMutation.isLoading ? "Submitting..." : "Submit Payment"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-2 text-red-500 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DonorSponsoredDetails;
