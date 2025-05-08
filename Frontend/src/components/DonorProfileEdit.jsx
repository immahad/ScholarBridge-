import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, TextField, Typography, Link, Grid, Paper } from '@mui/material';
import { donorProfileSchema } from '../utils/Schemas';
import axios from 'axios';
import { Formik } from 'formik';
import { useMutation } from '@tanstack/react-query';


export default function DonorProfileEdit(props) {
    const { profile } = props;
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedImage(file);
            const image = document.getElementById('image');
            if (image && file instanceof File) {
                image.src = URL.createObjectURL(file);
            }
        }
    };
    const editProfile = useMutation({
        mutationFn: async (values) => {
            console.log(values)
            const response = await axios.put('http://localhost:3333/ifl_system/auth//donor/update-profile', values, {
                headers: {
                    "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjYyODFjZWZhODI3MzY1Yzc2NjZkZmU1In0sImlhdCI6MTcxNDgxNzI5NX0.SZAzF9XCUmdBZVe6W3ZaIwYkaPVaGXE3NC--e6mmVb0"
                }
            });
        },
        onError: (error) => {
            console.log(error);
            toast.error("Error logging in user...");
        },
        onSuccess: (data) => {
            toast.success(data.data.message);
        }
    });


    return (
        <div>
            <Formik
                initialValues={{
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    phone_no: profile.phone_no,
                    cnic: profile.cnic,
                    email: profile.email,
                    profession: profile.profession,
                }}
                validationSchema={donorProfileSchema}
                onSubmit={(values) => {
                    editProfile.mutate(values)
                }}

            >
                {({
                    errors,
                    touched,
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                }) => (
                    <Grid container spacing={3} className="p-5 md:p-8">
                        <Grid item xs={12}>
                            <Typography variant="h4">Donor Profile</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Link href="/">Home </Link>
                            <Typography variant="span"> / </Typography>
                            <Link href="/messaging"> Donor Profile</Link>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <Paper className="flex flex-col justify-center items-center h-full p-1 md:p-5">
                                <div className="m-5 rounded-full ">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="imageInput"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="imageInput">
                                        <img
                                            id='image'
                                            src={selectedImage ? URL.createObjectURL(selectedImage) : 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg'}
                                            alt=""
                                            width='250px'
                                            height='250px'
                                        />
                                    </label>
                                </div>
                                <div className='flex justify-center items-center'>
                                    <Button
                                        size='large'
                                        variant="contained"
                                        component="span"
                                        onClick={handleImageChange}
                                        sx={{ bgcolor: '#1E3A8A', '&:hover': { bgcolor: '#1C2D61' }, mt: 2 }}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} lg={8}>
                            <Paper className="rounded-lg">
                                <form className="w-full flex flex-col justify-around px-5 lg:p-5">
                                    <Grid container spacing={2}>
                                        <Grid item lg={12}>
                                            <Typography variant="h5">Personal Details</Typography>
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <label htmlFor="first_name">First Name:</label>
                                            <TextField
                                                id="first_name"
                                                name="first_name"
                                                variant="outlined"
                                                size="small"
                                                autoComplete="given-name"
                                                required
                                                fullWidth
                                                autoFocus
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.first_name}
                                                error={errors.first_name && touched.first_name}
                                                helperText={errors.first_name && touched.first_name && errors.first_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <label htmlFor="last_name">Last Name:</label>
                                            <TextField
                                                id="last_name"
                                                size="small"
                                                required
                                                fullWidth
                                                name="last_name"
                                                autoComplete="family-name"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.last_name}
                                                error={errors.last_name && touched.last_name}
                                                helperText={errors.last_name && touched.last_name && errors.last_name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <label htmlFor="phone_no">Phone Number:</label>
                                            <TextField
                                                id="phone_no"
                                                size="small"
                                                required
                                                fullWidth
                                                name="phone_no"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.phone_no}
                                                error={errors.phone_no && touched.phone_no}
                                                helperText={errors.phone_no && touched.phone_no && errors.phone_no}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <label htmlFor="cnic">CNIC:</label>
                                            <TextField
                                                id="cnic"
                                                size="small"
                                                required
                                                fullWidth
                                                name="cnic"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.cnic}
                                                error={errors.cnic && touched.cnic}
                                                helperText={errors.cnic && touched.cnic && errors.cnic}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={12}>
                                            <label htmlFor="email">Email Address:</label>
                                            <TextField
                                                id="email"
                                                size="small"
                                                required
                                                fullWidth
                                                name="email"
                                                autoComplete="email"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.email}
                                                error={errors.email && touched.email}
                                                helperText={errors.email && touched.email && errors.email}
                                            />
                                        </Grid>
                                        <Grid item lg={12}>
                                            <Typography variant="h5">General Information</Typography>
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <label htmlFor="profession">Profession:</label>
                                            <TextField
                                                id="profession"
                                                size="small"
                                                required
                                                fullWidth
                                                name="profession"
                                                // label="Profession"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.profession}
                                                error={errors.profession && touched.profession}
                                                helperText={errors.profession && touched.profession && errors.profession}
                                            />
                                        </Grid>

                                        <Grid item xs={12} lg={12} sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                            <Button
                                                size='large'
                                                variant="contained"
                                                onClick={handleSubmit}
                                                sx={{ bgcolor: '#1E3A8A', '&:hover': { bgcolor: '#1C2D61' }, px: 5 }}
                                            >
                                                Edit
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Formik>
        </div>
    )
}
