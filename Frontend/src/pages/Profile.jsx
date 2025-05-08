import React, { useState, useContext, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, TextField, Typography, Link, Grid, Paper,Skeleton,Avatar, Box } from '@mui/material';
import axios from 'axios';
import { StudentContext } from '../api/studentContext';
import DonorTotalpayment from '../pages/Donor/DonorTotalpayment';
import PaymentForm from './Donor/PayementDetail';
import imageCompression from 'browser-image-compression';

export default function Profile() {
  const { useDonorDetails, useUpdateDonor } = useContext(StudentContext);
  const [isEditable, setIsEditable] = useState(false);
  const [donorDetails, setDonorDetails] = useState({});
  const [formData, setFormData] = useState({});
  const confirmationDetails = localStorage.getItem('confirmationDetails');
  const { isLoading, isError, data } = useDonorDetails();
  const { mutate: updateDonor } = useUpdateDonor();

  useEffect(() => {
    if (data) {
      const donorIntro = data.find((item) => item._id === confirmationDetails);
      setDonorDetails(donorIntro);
      setFormData({
        name: `${donorIntro?.first_name || ''} ${donorIntro?.last_name || ''}`,
        Gender: donorIntro?.gender || 'Gender',
        DOB: donorIntro?.dob ? new Date(donorIntro.dob).toISOString().split('T')[0] : '',
        Religion: donorIntro?.religion || 'Religion',
        Email: donorIntro?.email || 'Set Email',
        Occupation: donorIntro?.profession || 'Profession',
        Office: donorIntro?.office || 'Office',
        cnic: donorIntro?.cnic || '1234567891234',
        address: donorIntro?.address || 'Address',
        phone: donorIntro?.phone_no || '123456789',
        // If an image URL/path is already stored, use it; otherwise, use a default icon.
        profileimage: donorIntro?.profileimage || 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg',
      });
    }
  }, [data, confirmationDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert the selected image to a Base64 string
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Compress the image
      const options = {
        maxSizeMB: 1, // Adjust max size in MB as needed
        maxWidthOrHeight: 800, // Adjust max dimensions if needed
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          // Set the Base64 string in formData
          setFormData(prev => ({
            ...prev,
            profileimage: reader.result
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  // Save profile sending JSON with the Base64 string image
  const saveProfile = async () => {
    try {
      await axios.put(
        `http://localhost:3333/ifl_system/adminCase/admin/get-all-donors/${confirmationDetails}`,
        formData, // sending JSON instead of FormData
        {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': 'your_auth_token_here'
          }
        }
      );

      setIsEditable(false);
      toast.success('Profile Updated Successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user profile');
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: `${donorDetails?.first_name || ''} ${donorDetails?.last_name || ''}`,
      Gender: donorDetails?.gender || 'Gender',
      DOB: donorDetails?.dob ? new Date(donorDetails.dob).toISOString().split('T')[0] : '',
      Religion: donorDetails?.religion || 'Religion',
      Email: donorDetails?.email || 'Set Email',
      Occupation: donorDetails?.profession || 'Profession',
      Office: donorDetails?.office || 'Office',
      cnic: donorDetails?.cnic || '1234567891234',
      address: donorDetails?.address || 'Address',
      phone: donorDetails?.phone_no || '123456789',
      profileimage: donorDetails?.profileimage || 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg',
    });
    setIsEditable(false);
  };

  const editProfile = () => {
    setIsEditable(true);
  };

  if (isLoading) {
    return  <div>
    {/* <Typography variant="h6">Loading Profile...</Typography> */}
    <Grid container spacing={3} className="p-5 md:p-8">
  
  {/* Breadcrumb Loader */}
  <Grid item xs={12}>
    <Skeleton variant="text" width="15%" height={35} />
  </Grid>

  {/* Profile Image Skeleton */}
  <Grid item xs={12} lg={4}>
     <Paper className="flex flex-col justify-center items-center p-7 ">
      <Skeleton variant="circular"  width={120} height={120} />
      <Skeleton variant="text" className='text-center' width="25%" height={35}  />

          <Grid container spacing={2}>

          {/* First Input Field */}
          <Grid item xs={12}>           
            <Skeleton variant="rectangular"className='rounded-lg' width="100%" height={45} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" className='rounded-lg' width="100%" height={45} />
          </Grid>
          <Grid item xs={12} >
            <Skeleton variant="rectangular"className='rounded-lg' width="100%" height={45} />
          </Grid>
          <Grid item xs={12} >
            <Skeleton variant="rectangular"className='rounded-lg' width="100%" height={45} />
          </Grid>
          <Grid item xs={12} >
            <Skeleton variant="rectangular"className='rounded-lg' width="100%" height={45} />
          </Grid>
          <Grid item xs={12} >
            <Skeleton variant="rectangular"className='rounded-lg' width="100%" height={45} />
          </Grid>
        </Grid>
    </Paper>
  </Grid>
  <Grid item xs={12} lg={8}>
  <Paper className="rounded-xl p-5 ">
  <Skeleton variant="text" width="36%" height={25}  sx={{mb:1}}/>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>     
          <Skeleton variant="text" width="20%" height={45}  />
          <Skeleton variant="text" width="16%" height={45}  />
        </Box>
        <Skeleton variant="text" width="16%" height={45} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="56%" height={25}  />
        <Skeleton variant="text" width="36%" height={25}  />        
    </Paper>
    <Grid item xs={12}>
    <Paper className="rounded-lg overflow-hidden p-4 mt-12" >
      <Skeleton variant="rectangular" width="100%" height={190} />
    </Paper>
  </Grid>
  </Grid>
  
</Grid>
    
  </div>;
  }

  return (
    <Grid container spacing={3} className="p-5 md:p-8">
      <Grid item xs={12}>
        <Typography variant="h4">Donor Profile</Typography>
      </Grid>
     
      <Grid item xs={12} lg={4}>
        <Paper className="flex flex-col justify-center items-center p-1 md:p-5">
          <div className="m-5 rounded-xl overflow-hidden">
            <input
              type="file"
              accept="image/*"
              id="imageInput"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="imageInput">
              <img
                // Display the profile image (which now is the Base64 string)
                src={formData.profileimage}
                alt="Profile"
                width="150px"
                height="150px"
              />
            </label>
          </div>
          <form className="w-full flex flex-col justify-around px-5 lg:p-5">
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Gender"
              name="Gender"
              value={formData.Gender}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Date of Birth"
              name="DOB"
              type="date"
              value={formData.DOB}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Religion"
              name="Religion"
              value={formData.Religion}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Email"
              name="Email"
              value={formData.Email}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Occupation"
              name="Occupation"
              value={formData.Occupation}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Office"
              name="Office"
              value={formData.Office}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="CNIC"
              name="cnic"
              value={formData.cnic}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              InputProps={{ readOnly: !isEditable }}
            />
            {isEditable ? (
              <div className="flex justify-center items-center space-x-5">
                <Button variant="contained" color="success" onClick={saveProfile}>Save</Button>
                <Button variant="contained" color="error" onClick={cancelEdit}>Cancel</Button>
              </div>
            ) : (
              <div className="flex justify-center items-center space-x-5">
                <Button variant="contained" sx={{mt: 2,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    textTransform: "none",
                    fontSize: "1.1rem"}} color="success" onClick={editProfile}>Edit Profile</Button>
              </div>
            )}
          </form>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={8}>
        <DonorTotalpayment />
        <PaymentForm />
      </Grid>
      <ToastContainer />
    </Grid>
  );
}
