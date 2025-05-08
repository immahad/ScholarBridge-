import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import RequestedCases from './RequestedCases';
import ApprovalCases from './ApprovalCases';
import StudentDetailsChecking from './StudentDetailsChecking';
import DonorDetailsChecking from './DonorDetailsChecking';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function MainContainer() {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item md={6} xs={12}>
          <RequestedCases/>
        </Grid>
        <Grid item md={6} xs={12}>
          <ApprovalCases/>
        </Grid>
        <Grid item md={6} xs={12}>
          <StudentDetailsChecking/>
        </Grid>
        <Grid item md={6} xs={12}>
          <DonorDetailsChecking/>
        </Grid>
      </Grid>
    </Box>
  );
}