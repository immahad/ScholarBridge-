import { createContext, useState, useEffect } from 'react';
import { useGetStudent, useCreateStudent, useUpdateStudent, useDeleteStudent } from './Studentapi';
import { useFeeDetails, useGetUsers, useDonorDetails, useAddFeeDetail, useUpdateDonor, useUpdateFees, useCreateUser, useUpdateUser, useDeleteUser } from './Adminapi';

export const StudentContext = createContext({});

export default function StudentProvider({ children }) {
    const [student, setStudent] = useState(null);
    // Initialize with localStorage value
    const [userEmailID, setEmail] = useState(localStorage.getItem('userEmail'));
    const [userDataDetails, setUserDataDetails] = useState({});
    const [roleValue, setRolevalue] = useState(localStorage.getItem('role'));

    // Custom setter that logs updates
    const setEmailWithLogging = (newEmail) => {
        console.log('Setting email to:', newEmail);
        setEmail(newEmail);
    };

    // Log whenever userEmailID changes
    useEffect(() => {
        // console.log('Email value updated:', userEmailID);
    }, [userEmailID]);

    useEffect(() => {
        // Get both role and email from localStorage
        const storedRole = localStorage.getItem('role');
        const storedEmail = localStorage.getItem('userEmail');
        
        if (storedRole) {
            setRolevalue(storedRole);
            // console.log('Context Role initialized from localStorage:', storedRole);
        }
        
        if (storedEmail) {
            setEmail(storedEmail);
            // console.log('Context Email initialized from localStorage:', storedEmail);
        }
    }, []);

    // Add an effect to update context when localStorage changes
    useEffect(() => {
        const handleStorageChange = (event) => {
            console.log('Storage event detected:', event);
            if (event.key === 'role') {
                setRolevalue(event.newValue);
                console.log('Role updated from storage event:', event.newValue);
            }
            if (event.key === 'userEmail') {
                setEmail(event.newValue);
                console.log('Email updated from storage event:', event.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <StudentContext.Provider value={{
            useAddFeeDetail, 
            setRolevalue, 
            roleValue, 
            useUpdateFees, 
            useFeeDetails, 
            userEmailID, 
            userDataDetails, 
            setUserDataDetails,
            useUpdateDonor, 
            setEmail: setEmailWithLogging, // Use the logging version
            useUpdateUser, 
            student, 
            setStudent, 
            useDonorDetails, 
            useGetUsers, 
            useCreateStudent, 
            useGetStudent, 
            useDeleteStudent, 
            useUpdateStudent
        }}>
            {children}
        </StudentContext.Provider>
    );
}
