import { Button, Card, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function ViewDonor() {
    const id = '679bb4b022eff9d9ee6b4ca5';

    // State to store donor details
    const [donorData, setDonorData] = useState(null);

    // Fetch donor details
    const getDonorDetails = async () => {
        try {
            const url = `http://localhost:3333/ifl_system/admin/approved-case-donor-profile`;
            const response = await axios.get(url, {
                headers: {
                    "auth-token": "your-auth-token-here"
                }
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching donor:", error);
        }
    };

    // Using React Query but disabling automatic fetching
    const { data, refetch } = useQuery({
        queryKey: ['donor'],
        queryFn: getDonorDetails,
        enabled: false, // Prevent auto-fetching on component mount
    });

    // Handle button click: fetch and update UI
    const handleViewDonor = async () => {
        const fetchedData = await refetch(); // Fetch new data
        if (fetchedData.data) setDonorData(fetchedData.data); // Update state
    };

    return (
        <div className='h-screen bg-slate-300 flex justify-center items-center'>
            <Card sx={{
                backgroundColor: '#1b263b',
                width: '70%',
                minHeight: '50%',
                padding: '2rem',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                color: '#e0e1dd',
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ marginBottom: 5 }}>
                        <Typography variant='h4' align='center'>Donor Details</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={12}>
                                <Typography variant='h5' sx={typographyStyle}>Name: {donorData?.name || 'N/A'}</Typography>
                                <Typography variant='h5' sx={typographyStyle}>Email: {donorData?.email || 'N/A'}</Typography>
                                <Typography variant='h5' sx={typographyStyle}>Phone: {donorData?.phone || 'N/A'}</Typography>
                                <Typography variant='h5' sx={typographyStyle}>CNIC: {donorData?.cnic || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12} lg={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant='contained' color='primary' onClick={handleViewDonor}>
                                    View Donor
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
}

// Reusable typography style
const typographyStyle = {
    border: 2,
    paddingY: 1,
    paddingX: 2,
    margin: 2,
    borderRadius: 2
};
