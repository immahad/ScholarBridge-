import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { Badge,Avatar, Dialog , DialogTitle,DialogContent,DialogContentText,DialogActions } from "@mui/material";
import Account_Img from "../../images/Account (1).svg"
import { useState,useContext,useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { StudentContext } from "../../api/studentContext"
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack"
import Divider from "@mui/material/Divider"
import { useTheme,styled } from '@mui/material/styles';
import Modal from "@mui/material/Modal"; 

import { School, CalendarMonth, Grade, WorkspacePremium, Close, Email, Phone, LocationOn,CheckBoxOutlined } from "@mui/icons-material"


export default function DonorTotalpayment() {

  const currentDate = new Date();
  const theme = useTheme();

  const StatusChip = styled(Chip)(({ theme }) => ({
    fontWeight: "semibold",
    borderRadius: theme.shape.borderRadius,
    fontSize: "0.875rem",
    
  }))

  const StyledModal = styled(Modal)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }))
  
  const ModalContent = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: "16px",
    boxShadow: theme.shadows[24],
    padding: theme.spacing(2),
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: "4px",
    },
  }))
  
  const InfoCard = styled(Card)(({ theme }) => ({
    height: "100%",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[8],
    },
  }))
  // Format the updated date
  const formattedUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const details = localStorage.getItem("confirmationDetails")
  const { useGetStudent, useUpdateStudent } = useContext(StudentContext);
  const { isLoading, isError, data } = useGetStudent();
  const [ModalData, setModalData] = useState({});
  const [studentDetail, setstudentDetail] = useState({});
  const [open, setOpen] = useState(false);
  const [openPay, setOpenPay] = useState(false);

  const handleOpen = () => setOpen(true);
  const handlePay = () => setOpenPay(true);

  useEffect(() => {
    if(data){
      
      const studentdetails=data.find((item)=>item.id === details.id);
      setstudentDetail(studentdetails);
      setModalData({ profileimage:
        studentdetails?.profileimage ||{Account_Img},
        selfCnic:studentdetails?.selfCnic ||"",
        id: studentdetails._id? `STU-${studentdetails._id.slice(0, 6).toUpperCase()}` : "Error in loading",
        name: `${studentdetails?.name || ""}`,
        fatherName:studentdetails?.fatherName ||"Error Loading",
        cnic:studentdetails?.cnic || "Not Specified",
        familyIncome:`Rs :${studentdetails?.familyIncome||"Not specified"}`,
        Email: studentdetails.email || "Set Email",
        status: studentdetails?.status || "Please Wait",
        sex: studentdetails?.sex || "Gender",
        dobYear: studentdetails?.dobYear || "not specified",
        profileImage: studentdetails?.profileImage || "Dont",
        phone: studentdetails?.phone || "123456789",
        Address :studentdetails?.permanentAddress ||"not specfied",
        Domicle:studentdetails?.domicile ||"not specfied",
        feeDetails:studentdetails?.feeDetails || "Not Specified"
      })
    }  
    
   
  }, [data])
  
  // const api= ModalData?.feeDetails?.filter((item) => item.status = "accepted");
  // console.log(api)
  

  return (
    <Card
      sx={{
        minWidth: 275,
        backgroundColor: "white",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
        },
        "@media (max-width: 600px)": {
          minWidth: "100%",
        },
      }}
      className="mx-2 my-2"
    >
      <CardContent>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }} gutterBottom>
          {currentDate.toLocaleString()}
        </Typography>
       
        <Typography variant="h5"   component="div" sx={{ color: "primary.main", marginBottom: 2 }}>
          Payment Details:
        </Typography>
        <CardActions>
          <Button onClick={handleOpen} size="small" startIcon={<PersonIcon />}
                  variant="contained"
                  
                  sx={{
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    textTransform: "none",
                    fontSize: "1.1rem",
                  }}
                >
                  Student Details
                </Button>

          <StyledModal open={open} onClose={() => setOpen(false)}>
            <ModalContent>
           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                              <Avatar
                                src={ModalData.profileImage}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  border: "3px solid #2196F3",
                                }}
                              />
                              <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {ModalData.name}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <Chip icon={<School />} label="Computer Science" color="primary" size="small" />
                          <Chip icon={<CheckBoxOutlined />} label={ModalData?.status} color="success" size="small" />

                        </Stack>
                      </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>           
          <Box sx={{ mb: 4}}>
            <Stack sx={{ spacing:{xs:3,md:2}, flexDirection: { xs: "column", md: "row" } }} direction="row" >
              <Chip icon={<Email />} label={ModalData.Email} variant="outlined" />
              <Chip icon={<Phone />} label={ModalData.phone} variant="outlined" />
              <Chip icon={<LocationOn />} label={"karachi"} variant="outlined" />
            </Stack>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} >
              <InfoCard>
                <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Student Info
                  </Typography>
                  <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Student Id</Typography>
                       {ModalData.id}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Father Name</Typography>
                      <Chip label={ModalData.fatherName} color="primary" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Date of Birth</Typography>
                      <Chip
                        icon={<CalendarMonth />}
                        label={ModalData.dobYear}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Domicile</Typography>
                      <Chip label={ModalData.Domicle} color="primary" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Family Income</Typography>
                     
                        <h2>
                        {ModalData.familyIncome}
                        </h2>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Cnic No :</Typography>
                      <Typography color="text.primary">{ModalData.cnic}</Typography>

                     
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography color="text.secondary">Scholarship Status :</Typography>
                      <Typography color="text.primary">{ModalData.status}</Typography>

                     
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">CNIC Image: </Typography>
                        <Box
                          component="img"
                          src={ModalData?.selfCnic || "/placeholder.png"} // Fallback image
                          alt="CNIC Image"
                          sx={{ width: 200, height: "auto", mt: 2, borderRadius: 2, boxShadow: 3 }}
                        />
                      </Box>
                  </Stack>
                </CardContent>
              </InfoCard>
            </Grid>

            
          </Grid>
            </ModalContent>
          </StyledModal>
                       
        
          <Button onClick={handlePay } size="small" startIcon={<PersonIcon />}
                  variant="contained"
                  
                  sx={{
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    textTransform: "none",
                    fontSize: "1.1rem",
                  }}
                >
                  Payment Details
                </Button>
          {/* Payment Details Modal */}

          <StyledModal open={openPay} onClose={()=>setOpenPay(false)}>
             <ModalContent>
             <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Payment Info
                  </Typography>
                  {ModalData?.feeDetails?.filter((item) => item.status = "accepted").length > 0 ? (
                    ModalData.feeDetails.filter((item) => item.status === "accepted")
                    .map((item, index) => (
                      
                      <InfoCard>
                      <CardContent>
                  
                        <Stack key={index} className="mb-2">
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography color="text.primary">Fee Invoice</Typography>
                            <Chip label={item.feeInvoiceNo} color="primary" size="small" />
                           </Box>
                         
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography color="text.primary">Fee Last Date</Typography>
                             {item.lastDate}
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography color="text.primary">Fee Status</Typography>
                            <Chip label={item.status} color="success" size="small" />

                           
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography color="text.primary">Fee Payment Date</Typography>
                             {item.uploadedDate   }
                          </Box>
                        </Stack>
                        </CardContent> 
                        </InfoCard> 
                  ))
                ):(
                  <Typography sx={{ color: "red", fontWeight: "bold", mt: 2 }}>
                  No accepted payments found.
                   </Typography>
                  )
                  }

              
             </ModalContent>
          </StyledModal>
        </CardActions>
        <div className="mt-2">
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
           Check out your donation history to IFL organization.
           <br/>
            Last Updated: {formattedUpdatedDate}
            <br />
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
 
  
}
