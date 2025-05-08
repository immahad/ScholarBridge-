import { Button, Card, Grid, Typography } from '@mui/material'
import React from 'react'

export default function Application() {
    return (
        <div className=' h-screen bg-slate-300 flex justify-center items-center'>
            <Card sx={{
                backgroundColor: '#1b263b',
                width: '70%',
                minHeight: '50%', // Changed height to auto for better responsiveness
                height: 'auto', // Changed height to auto for better responsiveness
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                padding: '2rem', // Changed padding for better spacing
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)', // Added box shadow for depth
                borderRadius: '8px', // Added border radius for rounded corners
                color: '#e0e1dd', // Changed text color to white
            }}>
            <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ marginBottom: 5 }}>
                        <Typography variant='h4' align='center'>Application</Typography>
                        <Typography variant='body1' align='center' sx={{ border: 2, paddingY: 1, paddingX: 2, margin: 2, borderRadius: 2 }}>Application details</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant='h5'>Student</Typography>
                            </Grid>
                            <Grid item xs={12} lg={12}>
                                <Typography variant='body2' sx={{ border: 2, paddingY: 1, paddingX: 2, margin: 2, borderRadius: 2 }}>Student details</Typography>
                            </Grid>
                            <Grid item xs={12} lg={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Button variant='contained' color='primary'>View Student</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
        </Card>
        </div>
    )
}
