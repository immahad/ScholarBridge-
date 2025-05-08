import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// /admin/get-all-donors
const fetchUsers = async () => {
  const { data } = await axios.get('http://localhost:3333/ifl_system/studentCase/student/get_all_requests_by_student');
  console.log(data);
  console.log("called");
  return data;
};

const fetchDonor = async () => { 
  const { data } = await axios.get('http://localhost:3333/ifl_system/adminCase/admin/get-all-donors');
  return data;
};

const updateDonor = async ({ donorId, studentEmail }) => {
  try {
    const token = localStorage.getItem("authToken"); 
console.log("Retrieved Token:", token);
    if (!token) {
      console.error("No authentication token found");
      return { success: false, message: "Unauthorized: No token found" };
    }

    if (!donorId || !studentEmail) {
      console.error("Missing donorId or studentEmail");
      return { success: false, message: "Invalid data: donorId and studentEmail are required" };
    }

    const url = `http://localhost:3333/ifl_system/adminCase/admin/assign-student/${donorId}`;
    
    const headers = {
      Authorization: `Bearer ${token.trim()}`, // Trim spaces
      "Content-Type": "application/json",
    };
    

    const response = await axios.post(url, { studentEmail }, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      console.error(`Error updating donor: ${error.response.status} - ${error.response.data}`);
      return { success: false, message: `API Error: ${error.response.status} - ${error.response.data}` };
    } else {
      console.error("Network or server error:", error.message);
      return { success: false, message: "Network error. Please try again later." };
    }
  }
};

const createUser = async (newUser) => {
  const { data } = await axios.post('http://localhost:3333/ifl_system/studentCase/adminCase/student_profile/', newUser);
  return data;
};

const updateUser = async (updatedUser) => {
  console.log("called", updatedUser);
  const { data } = await axios.put(`http://localhost:3333/ifl_system/studentCase/student/get_all_requests_by_student/${updatedUser._id}`, updatedUser);
  return data;
};

const deleteUser = async (id) => {
  const { data } = await axios.delete(`http://localhost:3333/ifl_system/adminCase/student_profile/${id}`);
  return data;
};

export const useDonorDetails = () => {
  return useQuery({
    queryKey: ['donor'],
    queryFn: fetchDonor,
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser, // Separate `mutationFn` property
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
};

const fetchFees = async (email) => {
  const { data } = await axios.get(`http://localhost:3333/ifl_system/studentCase/feeDetails?email=${email}`);
  return data;
};

const updateFees = async (updatedFeeDetails, email) => {
  const { data } = await axios.put(`http://localhost:3333/ifl_system/studentCase/feeDetails?email=${email}`, {
    feeDetails: updatedFeeDetails,
    headers: {
      "Content-Type": "application/json"
    }
  });
  return data;
};

const addFeeDetail = async ({ newFeeDetail, email }) => {
  console.log(email);
  console.log("Field data in API (JSON object):", newFeeDetail.Object);

  await axios.post(
    `http://localhost:3333/ifl_system/studentCase/uploadedFees?email=${email}`,
    newFeeDetail,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

export const useFeeDetails = (email) => {
  return useQuery({
    queryKey: ['feeDetails', email], // Include email in the query key
    queryFn: () => fetchFees(email),
    enabled: !!email, // Only fetch when email is available
  });
};
export const useUpdateFees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFees,
    onSuccess: () => {
      queryClient.invalidateQueries(['feeDetails']);
    },
  });
};

export const useAddFeeDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFeeDetail, // Separate `mutationFn` property
    onSuccess: (data, variables) => { // Access email from variables
      queryClient.invalidateQueries(['feeDetails', variables.email]); // Invalidate with the correct email
      queryClient.refetchQueries(['feeDetails', variables.email]); 
    },
    onError: (error) => {
      console.error('Error adding fee detail:', error);
    },
  });
};

export const useUpdateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDonor,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      console.error("Error updating user:", error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

const submitProof = async (proofData) => {
  try {
    const { data } = await axios.post("http://localhost:3333/ifl_system/donorCase/submit-proof", proofData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    if (error.response) {
      console.error("Error submitting payment proof:", error.response.data);
      alert(`Failed: ${error.response.data.message || "Unknown error"}`);
    } else {
      console.error("Error submitting payment proof:", error.message);
    }
  }
  
};

const approveProof = async ({ requestId }) => {
  try {
    const { data } = await axios.put(`http://localhost:3333/ifl_system/adminCase/admin/approve-proof/${requestId}`, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    console.error("Error approving proof:", error.message);
    throw error;
  }
};

// Hook for submitting proof
export const useSubmitProof = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitProof,
    onSuccess: () => {
      queryClient.invalidateQueries(["proofSubmissions"]);
    },
    onError: (error) => {
      console.error("Error submitting proof:", error.message);
    },
  });
};

// Hook for approving proof
export const useApproveProof = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveProof,
    onSuccess: () => {
      queryClient.invalidateQueries(["proofApprovals"]);
    },
    onError: (error) => {
      console.error("Error approving proof:", error.message);
    },
  });
};
const fetchProofs = async () => {
  try {
    const { data } = await axios.get("http://localhost:3333/ifl_system/adminCase/admin/all-requests");
    return data;
  } catch (error) {
    console.error("Error fetching proofs:", error.message);
    throw error;
  }
};

// Hook for fetching proofs
export const useGetProofs = () => {
  return useQuery({
    queryKey: ["proofs"],
    queryFn: fetchProofs,
  });
};




export const useGetTotalInformation = () => {
  return axios.get('http://localhost:3333/ifl_system/adminCase/admin/total-information')
  .then(response => response.data)
  .catch(error => console.error('Error fetching total information:', error));

};
