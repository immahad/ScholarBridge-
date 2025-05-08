
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchUsers = async () => {
  const { data } = await axios.get('http://localhost:3333/ifl_system/studentCase/student/get_all_requests_by_student');
  return data;
};

const updateUser = async (updatedUser) => {
  const { data } = await axios.put(`http://localhost:3333/ifl_system/adminCase/student_profile/${updatedUser._id}`, updatedUser);
  return data;
};

const createStudent = async (newUser) => {
  const { data } = await axios.post('http://localhost:3333/ifl_system/adminCase/student_profile/', newUser);
  return data;
};

const updateStudent = async (updatedUser) => {
  const { data } = await axios.put(`http://localhost:3333/ifl_system/adminCase/student_profile/${updatedUser.id}`, updatedUser);
  return data;
};

const deleteStudent = async (id) => {
  const { data } = await axios.delete(`http://localhost:3333/ifl_system/adminCase/student_profile/${id}`);
  return data;
};

export const useGetStudent = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation(createStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation(updateStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
};
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
