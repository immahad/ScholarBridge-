"use client"

import { useState, useContext, useEffect } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Button, TextField, Typography, Link, Grid, Paper, Box, Avatar } from "@mui/material"
import { styled } from "@mui/system"
import { motion } from "framer-motion"
import DonorTotalpayment from "./DonorTotalpayment"
import PaymentForm from "./PayementDetail"
import { StudentContext } from "../../api/studentContext"
import axios from "axios"
import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import firebaseConfig from '../firebaseConfig';

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing ? theme.spacing(3) : "24px",
  transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
  background: "#f5f5f5", // Light grey background
  borderRadius: "15px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  "&:hover": {
    boxShadow: "0 6px 8px rgba(0,0,0,0.15)",
    transform: "translateY(-5px)",
  },
}))

const AnimatedTextField = styled(motion(TextField))(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: theme.palette?.primary?.light || "#90caf9",
    },
    "&:hover fieldset": {
      borderColor: theme.palette?.primary?.main || "#2196f3",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette?.primary?.dark || "#1976d2",
    },
  },
}))

export default function Profile() {
  const { useDonorDetails, useUpdateDonor } = useContext(StudentContext)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isEditable, setIsEditable] = useState(false)
  const [donorDetails, setDonorDetails] = useState({})
  const [formData, setFormData] = useState({})
  const confirmationDetails = localStorage.getItem("confirmationDetails")
  const { isLoading, isError, data } = useDonorDetails()
  const { mutate: updateDonor } = useUpdateDonor()

  useEffect(() => {
    if (data) {
      const donorIntro = data.find((item) => item._id === confirmationDetails)
      setDonorDetails(donorIntro)
      setFormData({
        profileimage:
          donorIntro?.profileimage ||
          "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg",
        name: `${donorIntro?.first_name || ""} ${donorIntro?.last_name || ""}`,
        Gender: donorIntro?.gender || "Gender",
        DOB: donorIntro?.dob ? new Date(donorIntro.dob).toISOString().split("T")[0] : "",
        Religion: donorIntro?.religion || "Religion",
        Email: donorIntro?.email || "Set Email",
        Occupation: donorIntro?.profession || "Profession",
        Office: donorIntro?.office || "Office",
        cnic: donorIntro?.cnic || "1234567891234",
        address: donorIntro?.address || "Address",
        phone: donorIntro?.phone_no || "123456789",
      })
    }
  }, [data, confirmationDetails])

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    setSelectedImage(file)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first!")
      return null
    }

    const storageRef = ref(storage, `images/${uuidv4()}-${selectedImage.name}`)
    try {
      await uploadBytes(storageRef, selectedImage)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error) {
      console.error("Upload failed", error)
      return null
    }
  }

  const saveProfile = async () => {
    try {
      const imageUrl = await handleUpload()
      if (imageUrl) {
        formData.profileimage = imageUrl
      }

      await axios.put(
        `http://localhost:3333/ifl_system/adminCase/admin/get-all-donors/${confirmationDetails}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": "your_auth_token_here",
          },
        },
      )

      setIsEditable(false)
      toast.success("Profile Updated Successfully!", {})
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Error updating user profile")
    }
  }

  const cancelEdit = () => {
    setFormData({
      profileimage:
        donorDetails?.profileimage ||
        "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg",
      name: `${donorDetails?.first_name || ""} ${donorDetails?.last_name || ""}`,
      Gender: donorDetails?.gender || "Gender",
      DOB: donorDetails?.dob ? new Date(donorDetails.dob).toISOString().split("T")[0] : "",
      Religion: donorDetails?.religion || "Religion",
      Email: donorDetails?.email || "Set Email",
      Occupation: donorDetails?.profession || "Profession",
      Office: donorDetails?.office || "Office",
      cnic: donorDetails?.cnic || "1234567891234",
      address: donorDetails?.address || "Address",
      phone: donorDetails?.phone_no || "123456789",
    })
    setIsEditable(false)
  }

  const editProfile = () => {
    setIsEditable(true)
  }

  if (isLoading) {
    return <h1>Loading...</h1>
  }

  return (
    <Box
      sx={{
        background: "#e0e0e0", // Light grey background for the entire page
        minHeight: "100vh",
        padding: 3,
      }}
    >
      <Grid container spacing={3} className="p-5 md:p-8">
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
           
            
          </Box>
        </Grid>
        <Grid item xs={12} lg={4}>
          <StyledPaper>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Avatar
                  src={selectedImage ? URL.createObjectURL(selectedImage) : formData.profileimage}
                  alt="Profile"
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    border: "4px solid white",
                  }}
                />
              </motion.div>
              <input
                type="file"
                accept="image/*"
                id="imageInput"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="imageInput">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  Change Profile Picture
                </Button>
              </label>
            </Box>
            <form className="w-full flex flex-col justify-around px-5 lg:p-5">
              {Object.entries(formData).map(
                ([key, value]) =>
                  key !== "profileimage" && (
                    <AnimatedTextField
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: !isEditable }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ),
              )}
              <Box display="flex" justifyContent="center" mt={2}>
                {isEditable ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={saveProfile}
                      sx={{ mr: 2, borderRadius: "20px", textTransform: "none" }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={cancelEdit}
                      sx={{ borderRadius: "20px", textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={editProfile}
                    sx={{ borderRadius: "20px", textTransform: "none" }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </form>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StyledPaper sx={{ mb: 3 }}>
              <DonorTotalpayment />
            </StyledPaper>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StyledPaper>
              <PaymentForm />
            </StyledPaper>
          </motion.div>
        </Grid>
      </Grid>
      <ToastContainer />
    </Box>
  )
}


