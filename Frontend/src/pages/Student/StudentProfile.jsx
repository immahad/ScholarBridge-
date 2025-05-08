import React, { useState, useContext, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Button, TextField, Typography, Link, Grid, Paper, Skeleton,Avatar, Box } from '@mui/material';
import FeeStatus from '../../components/FeeStatus';
import { StudentContext } from '../../api/studentContext';
import StudentFeeDetails from '../../components/studentfeeupload';
import axios from 'axios';
import Upload from "../../images/Upload.svg";
export default function StudentProfile() {
  const { useGetUsers } = useContext(StudentContext);
  const { isLoading, isError, data } = useGetUsers();
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [dataUser, setDataUser] = useState(null);
  const initialFormData = {
    name: '',
    sex: '',
    dob: '',
    fatherName: '',
    email: '',
    currentAddress: '',
    permanentAddress: '',
    cnic: '',
    fatherCnic: '',
    phone: '',
  };
  useEffect(() => {
    if(!data)return;
    const userEmail = localStorage.getItem('userEmail');
    const foundUser = data?.find((user) => user.email === userEmail);
    console.log("datauser", foundUser)
    if (foundUser) {
      setFormData({
        name: foundUser?.name || '',
        sex: foundUser?.sex || '',
        dob: `${foundUser?.dobDay}/${foundUser?.dobMonth}/${foundUser?.dobYear}` || '',
        fatherName: foundUser?.fatherName || '',
        email: foundUser?.email || '',
        currentAddress: foundUser?.currentAddress || '',
        permanentAddress: foundUser?.permanentAddress || '',
        cnic: foundUser?.cnic || '',
        fatherCnic: foundUser?.fatherCnic || '',
        phone: foundUser?.phone || ''
      });
      setDataUser(foundUser);
      setProfileLoaded(true);
    }
  }, [data]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveProfile = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    if (selectedImage) {
      formDataToSend.append('profileImage', selectedImage);
    }

    try {
      await axios.put(`http://localhost:3333/ifl_system/studentCase/upload-personal-data/${dataUser._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsEditable(false);
      toast.success('Profile Updated Successfully!', {});
    } catch (error) {
      toast.error('Error updating profile. Please try again.', {});
    }
  };

  const cancelEdit = () => {
    setFormData(initialFormData);
    setIsEditable(false);
  };

  const editProfile = () => {
    setIsEditable(true);
  };

  if (isLoading || !profileLoaded) {
    return (
      <div>
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
        
      </div>
    );
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      {profileLoaded && (
        <Grid container spacing={3} className="p-5 md:p-8 rounded-lg">
          <Grid item xs={12}>
            <Typography variant="h4" >Student Profile</Typography>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper className="flex flex-col justify-center items-center p-1 md:p-5">
              <div  style={{ backgroundImage:`url(/Account.svg)`  }}  className="m-5 bg rounded-full overflow-hidden bg-no-repeat bg-cover w-40 h-40">
                <input
                  type="file"
                  accept="image/*"
                  id="imageInput"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label  htmlFor="imageInput">
                  <img className='w-15 h-15 mt-20 ml-20' src={selectedImage ? URL.createObjectURL(selectedImage) : Upload} />
      
                </label>
              </div>
              <Typography variant="h5" > Edit Profile</Typography>

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
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Date of Birth"
                  name="dob"
                  type="text"
                  value={formData.dob}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Father's Name"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Current Address"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Permanent Address"
                  name="permanentAddress"
                  value={formData.permanentAddress}
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
                  label="Father's CNIC"
                  name="fatherCnic"
                  value={formData.fatherCnic}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
                <TextField
                  label="Phone No"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  className='rounded-xl'
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: !isEditable }}
                />
              </form>
              {isEditable ? (
                <div className="mb-3" id='saveDiv'>
                  <Button
                    variant="contained"
                    onClick={saveProfile}
                    sx={{ bgcolor: '#FFD700', '&:hover': { bgcolor: '#FFC300' }, mr: 2 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={cancelEdit}
                    sx={{ bgcolor: '#1E3A8A', '&:hover': { bgcolor: '#1C2D61' } }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="mb-3" id='editDiv'>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={editProfile}
                     sx={{
                    mb: 5,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    textTransform: "none",
                    fontSize: "1.1rem",
                  }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={12}>
                <Paper className="rounded-lg w-full bg-black">
                  <FeeStatus status={dataUser?.status === "accepted" ? "accepted" : dataUser?.status === "rejected" ? "rejected" : "pending"} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className="rounded-lg overflow-hidden p-4">
                  
                  <StudentFeeDetails />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <ToastContainer />
    </>
  );
}