import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const UserDetailsCard = ({ profile }) => {
  return (
    <Card variant="outlined" sx={{ 
      width: '100%', // Set width
      height: 'auto',
      fontWeight: '600',
      lineHeight: '15px',
      backgroundColor: 'grey', // Set background color
      color: '#fff', // Set text color
    }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>{profile.first_name}</Typography>
        <Grid container spacing={2} sx={{ marginTop: '1rem' }}> {/* Add margin top */}
          {/* Column 1: Labels */}
          <Grid item xs={6} md={6}>
            <Typography><strong>First Name:</strong></Typography>
            <Typography><strong>Last Name:</strong></Typography>
            <Typography><strong>Contact Number:</strong></Typography>
            <Typography><strong>CNIC Number:</strong></Typography>
          </Grid>

          <Grid item xs={6} md={6}>
            <Typography>{profile.first_name}</Typography>
            <Typography>{profile.last_name}</Typography>
            <Typography>{profile.phone_no}</Typography>
            <Typography>{profile.cnic}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserDetailsCard;
