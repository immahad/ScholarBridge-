import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import DonorProfileEdit from '../../components/DonorProfileEdit';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function DonorProfile() {

    const getDonor = async () => {
        try {
            const url = 'http://localhost:3333/ifl_system/auth/donor/get-profile';
            const response = await axios.get(url, {
                headers: {
                    "auth-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjYzNjdjZjNjMTc4OTQxY2NmOGE3MWUzIn0sImlhdCI6MTcxNDg0Njk2M30.G4ppfM-3KosodIaLhvTlJsbCDkP_4m4oejU21eQkMEg"
                }
            });

            if (!response.data) {
                throw new Error('Error fetching donor');
            }
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: getDonor,
    });

    return (
        <>
            {profile && <DonorProfileEdit profile={profile} />}
        </>
    )
}