import { useMemo, useContext, useState, useEffect } from "react";
import axios from "axios";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Typography, Box, Modal } from "@mui/material";
import { StudentContext } from "../api/studentContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Example = () => {
    const { useGetUsers, useUpdateUser } = useContext(StudentContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState({});
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [newUser, setNewUser] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [fatherCnicImage, setFatherCnicImage] = useState(null);
    const [latestFeesImage, setLatestFeesImage] = useState(null);
    const [selfCnicImage, setSelfCnicImage] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);
    const [zoomOpen, setZoomOpen] = useState(false);

    const { isLoading, isError, data } = useGetUsers();
    const { mutate: updateUser } = useUpdateUser();

    const handleOpenDialog = (user) => {
        setSelectedUser(user);
        setFormState(user);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
        setFormState({});
        setDialogOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };

    const handleAccept = async () => {
        try {
            await updateUser({ ...formState, status: "accepted" });
            toast.success("User data accepted successfully");
            handleCloseDialog();
        } catch (error) {
            console.error("Error accepting user data:", error);
        }
    };

    const handleReject = async () => {
        try {
            await updateUser({ ...formState, status: "rejected" });
            toast.warn("User data rejected successfully");
            handleCloseDialog();
        } catch (error) {
            console.error("Error rejecting user data:", error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        formData.append('fatherCnicImage', fatherCnicImage);
        formData.append('latestFees', latestFeesImage);  // Updated to match Multer config
        formData.append('selfCnic', selfCnicImage);  // Updated to match Multer config
        Object.keys(newUser).forEach(key => formData.append(key, newUser[key]));

        try {
            const authToken = localStorage.getItem('authToken');
            await axios.post('http://localhost:3333/ifl_system/studentCase/upload-personal-data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'authToken': authToken,
                },
            });
            toast.success("User created successfully");
            setCreateFormOpen(false);
            setNewUser({});
            setProfileImage(null);
            setFatherCnicImage(null);
            setLatestFeesImage(null);
            setSelfCnicImage(null);
        } catch (error) {
            console.log(error)
            console.error("Error creating user:", error);
            toast.error("Error creating user");
        }
    };

    const handleOpenZoom = (imageSrc, title) => {
        setZoomImage({ src: imageSrc, title: title });
        setZoomOpen(true);
    };

    const handleCloseZoom = () => {
        setZoomImage(null);
        setZoomOpen(false);
    };

    // Function to check if a string is Base64 encoded
    const isBase64Image = (str) => {
        if (!str) return false;
        try {
            return str.startsWith('data:image') || str.startsWith('data:application');
        } catch (e) {
            return false;
        }
    };

    // Image component with zoom functionality that handles base64 images
    const ImageWithZoom = ({ src, alt, title }) => {
        if (!src) return null;
        
        // Ensure the image source is properly formatted for display
        const displaySrc = isBase64Image(src) ? src : src;
        
        return (
            <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
                <img 
                    src={displaySrc} 
                    alt={alt} 
                    style={{ width: '100px', height: '100px', cursor: 'pointer', objectFit: 'cover', border: '1px solid #ddd' }} 
                    onClick={() => handleOpenZoom(displaySrc, title)}
                />
            </Box>
        );
    };

    const transformedData = useMemo(() => {
        return data?.map(item => ({
            _id: item._id,
            name: item.name,
            dob: `${item.dobDay}/${item.dobMonth}/${item.dobYear}`,
            sex: item.sex,
            cnic: item.cnic,
            fatherName: item.fatherName,
            fatherCnic: item.fatherCnic,
            phone: item.phone,
            email: item.email,
            currentAddress: item.currentAddress,
            permanentAddress: item.permanentAddress,
            familyIncome: item.familyIncome,
            domicile: item.domicile,
            selfCnic: item.selfCnic,
            latestFees: item.latestFees,
            fatherCnicImage: item.fatherCnicImage,
            profileImage: item.profileImage,
            status: item.status,
        })) || [];
    }, [data]);

    const columns = useMemo(() => [
        { accessorKey: "_id", header: "ID", enableEditing: false, size: 80 },
        { accessorKey: "name", header: "Name", muiEditTextFieldProps: { required: true, error: !!validationErrors?.name, helperText: validationErrors?.name, onFocus: () => setValidationErrors({ ...validationErrors, name: undefined }), }, },
        { accessorKey: "status", header: "Status", editVariant: "select", editSelectOptions: ["Active", "Inactive"], muiEditTextFieldProps: { select: true, error: !!validationErrors?.status, helperText: validationErrors?.status, }, },
        { accessorKey: "dob", header: "Date of Birth" },
        { accessorKey: "sex", header: "Sex" },
        { accessorKey: "cnic", header: "CNIC" },
        { accessorKey: "fatherName", header: "Father's Name" },
        { accessorKey: "fatherCnic", header: "Father's CNIC" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "currentAddress", header: "Current Address" },
        { accessorKey: "permanentAddress", header: "Permanent Address" },
        { accessorKey: "familyIncome", header: "Family Income" },
        { accessorKey: "domicile", header: "Domicile" },
        { 
            accessorKey: "selfCnic", 
            header: "Self CNIC",
            Cell: ({ row }) => row.original.selfCnic ? (
                <img 
                    src={row.original.selfCnic} 
                    alt="Self CNIC" 
                    style={{ width: '50px', height: '50px', cursor: 'pointer', objectFit: 'cover' }} 
                    onClick={() => handleOpenZoom(row.original.selfCnic, "Self CNIC")}
                />
            ) : null
        },
        { 
            accessorKey: "latestFees", 
            header: "Latest Fees",
            Cell: ({ row }) => row.original.latestFees ? (
                <img 
                    src={row.original.latestFees} 
                    alt="Latest Fees" 
                    style={{ width: '50px', height: '50px', cursor: 'pointer', objectFit: 'cover' }} 
                    onClick={() => handleOpenZoom(row.original.latestFees, "Latest Fees Receipt")}
                />
            ) : null
        },
        { 
            accessorKey: "fatherCnicImage", 
            header: "Father's CNIC",
            Cell: ({ row }) => row.original.fatherCnicImage ? (
                <img 
                    src={row.original.fatherCnicImage} 
                    alt="Father's CNIC" 
                    style={{ width: '50px', height: '50px', cursor: 'pointer', objectFit: 'cover' }} 
                    onClick={() => handleOpenZoom(row.original.fatherCnicImage, "Father's CNIC")}
                />
            ) : null
        },
        { 
            accessorKey: "profileImage", 
            header: "Profile",
            Cell: ({ row }) => row.original.profileImage ? (
                <img 
                    src={row.original.profileImage} 
                    alt="Profile" 
                    style={{ width: '50px', height: '50px', cursor: 'pointer', objectFit: 'cover', borderRadius: '50%' }} 
                    onClick={() => handleOpenZoom(row.original.profileImage, "Profile Image")}
                />
            ) : null
        },
        { header: "Actions", enableEditing: false, size: 150, Cell: ({ row }) => <Button variant="contained" color="primary" onClick={() => handleOpenDialog(row.original)}>Open Form</Button>, },
    ], [validationErrors]);

    const table = useMaterialReactTable({
        columns,
        data: transformedData,
        getRowId: row => row._id,
        muiToolbarAlertBannerProps: isError ? { color: "error", children: "Error loading data", } : undefined,
        muiTableContainerProps: { sx: { minHeight: "500px", }, },
    });

    return (
        <>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Button onClick={() => setCreateFormOpen(true)}>Create User</Button>
                    <MaterialReactTable table={table} />
                </>
            )}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>User Details</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <div className="mt-5">
                            <TextField label="ID" name="_id" value={formState._id} fullWidth margin="dense" InputProps={{ readOnly: true, }} onChange={handleInputChange} />
                            <TextField label="Name" name="name" value={formState.name} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Date of Birth" name="dob" value={formState.dob} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Sex" name="sex" value={formState.sex} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="CNIC" name="cnic" value={formState.cnic} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Father's Name" name="fatherName" value={formState.fatherName} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Father's CNIC" name="fatherCnic" value={formState.fatherCnic} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Phone" name="phone" value={formState.phone} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Email" name="email" value={formState.email} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Current Address" name="currentAddress" value={formState.currentAddress} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Permanent Address" name="permanentAddress" value={formState.permanentAddress} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Family Income" name="familyIncome" value={formState.familyIncome} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Domicile" name="domicile" value={formState.domicile} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Self CNIC" name="selfCnic" value={formState.selfCnic} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Latest Fees" name="latestFees" value={formState.latestFees} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Father's CNIC Image" name="fatherCnicImage" value={formState.fatherCnicImage} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Profile Image" name="profileImage" value={formState.profileImage} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField
                                label="Status"
                                name="status"
                                value={formState.status}
                                select
                                fullWidth
                                margin="dense"
                                onChange={handleInputChange}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </TextField>
                            
                            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Document Images</Typography>
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ImageWithZoom 
                                        src={formState.profileImage} 
                                        alt="Profile" 
                                        title="Profile Image" 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ImageWithZoom 
                                        src={formState.fatherCnicImage} 
                                        alt="Father's CNIC" 
                                        title="Father's CNIC Image" 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ImageWithZoom 
                                        src={formState.latestFees} 
                                        alt="Latest Fees" 
                                        title="Latest Fees Receipt" 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ImageWithZoom 
                                        src={formState.selfCnic} 
                                        alt="Self CNIC" 
                                        title="Self CNIC/B-Form" 
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleReject} color="secondary">Reject</Button>
                    <Button onClick={handleAccept} color="primary">Accept</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={createFormOpen} onClose={() => setCreateFormOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create User</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleCreateUser}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Name" value={newUser.name || ""} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Status" value={newUser.status || ""} fullWidth margin="dense" onChange={(e) => setNewUser({ ...newUser, status: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="dobDay" value={newUser.dobDay || ""} onChange={(e) => setNewUser({ ...newUser, dobDay: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="dobMonth" value={newUser.dobMonth || ""} onChange={(e) => setNewUser({ ...newUser, dobMonth: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="dobYear" value={newUser.dobYear || ""} onChange={(e) => setNewUser({ ...newUser, dobYear: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Sex" value={newUser.sex || ""} onChange={(e) => setNewUser({ ...newUser, sex: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="CNIC" value={newUser.cnic || ""} onChange={(e) => setNewUser({ ...newUser, cnic: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Father's Name" value={newUser.fatherName || ""} onChange={(e) => setNewUser({ ...newUser, fatherName: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Father's CNIC" value={newUser.fatherCnic || ""} onChange={(e) => setNewUser({ ...newUser, fatherCnic: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Phone" value={newUser.phone || ""} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Email" value={newUser.email || ""} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Current Address" value={newUser.currentAddress || ""} onChange={(e) => setNewUser({ ...newUser, currentAddress: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Permanent Address" value={newUser.permanentAddress || ""} onChange={(e) => setNewUser({ ...newUser, permanentAddress: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Family Income" value={newUser.familyIncome || ""} onChange={(e) => setNewUser({ ...newUser, familyIncome: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Domicile" value={newUser.domicile || ""} onChange={(e) => setNewUser({ ...newUser, domicile: e.target.value })} required fullWidth margin="dense" />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Upload Documents</Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Self CNIC or B-form</Typography>
                                    <input type="file" accept="image/*" onChange={(e) => setSelfCnicImage(e.target.files[0])} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Latest Fee Receipt</Typography>
                                    <input type="file" accept="image/*" onChange={(e) => setLatestFeesImage(e.target.files[0])} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Father's CNIC Image</Typography>
                                    <input type="file" accept="image/*" onChange={(e) => setFatherCnicImage(e.target.files[0])} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Profile Image</Typography>
                                    <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateFormOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} variant="contained">Submit</Button>
                </DialogActions>
            </Dialog>
            
            {/* Image Zoom Modal */}
            <Modal
                open={zoomOpen}
                onClose={handleCloseZoom}
                aria-labelledby="zoom-image-title"
                aria-describedby="zoom-image-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: 800,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="zoom-image-title" variant="h6" component="h2" gutterBottom>
                        {zoomImage?.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                        <img 
                            src={zoomImage?.src} 
                            alt={zoomImage?.title} 
                            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
                        />
                    </Box>
                    <Button onClick={handleCloseZoom} variant="contained">Close</Button>
                </Box>
            </Modal>
            
            <ToastContainer />
        </>
    );
};

export default Example;
