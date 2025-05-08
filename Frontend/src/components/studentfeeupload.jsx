import { useMemo, useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Typography } from "@mui/material";
import { StudentContext } from "../api/studentContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentFeeDetails = () => {
    const [email, setEmail] = useState(null);

    // Ensure context values are not undefined
    const { useAddFeeDetail, useUpdateFees, useFeeDetails } = useContext(StudentContext);
    const { data: feeDetails, isLoading, isError } = useFeeDetails(email);
    const updateFees = useUpdateFees();
    const addFeeDetail = useAddFeeDetail();
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState({});
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [newUser, setNewUser] = useState({});
    const [latestFeesImage, setLatestFeesImage] = useState(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

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
        setNewUser((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleAccept = async () => {
        try {
            await updateFees.mutate({ ...formState }, email);
            toast.success("User data accepted successfully");
            handleCloseDialog();
        } catch (error) {
            console.error("Error accepting user data:", error);
            toast.error("Error accepting user data");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
    
        if (!latestFeesImage) {
            toast.error("Please upload an image.");
            return;
        }
    
        setIsSubmitting(true); // Disable button on form submission
    
        const reader = new FileReader();
        reader.readAsDataURL(latestFeesImage);
        reader.onloadend = async () => {
            const base64Image = reader.result;
    
            const feeDetails = {
                ...newUser,
                status: 'pending',
                latestFees: base64Image,
            };
    
            try {
                const userEmail = localStorage.getItem('userEmail');
                await addFeeDetail.mutate(
                    { newFeeDetail: feeDetails, email: userEmail },
                    {
                        onSuccess: () => {
                            setCreateFormOpen(false);
                            setNewUser({});
                            setLatestFeesImage(null);
                            toast.success("Fee created successfully");
                        },
                        onError: (error) => {
                            console.error("Error creating fee:", error);
                            toast.error("Error creating fee");
                        },
                        onSettled: () => {
                            setIsSubmitting(false); // Re-enable the button after the request completes
                        }
                    }
                );
            } catch (error) {
                console.error("Error creating fee:", error);
                toast.error("Error creating fee");
                setIsSubmitting(false); // Re-enable the button on error
            }
        };
    
        reader.onerror = () => {
            toast.error("Error reading the file.");
            setIsSubmitting(false); // Re-enable the button on error
        };
    };
    const transformedData = useMemo(() => {
        return feeDetails?.map((item, index) => ({
            ...item,
            sno: index + 1,
        })) || [];
    }, [feeDetails]);

    const columns = useMemo(() => [
        { accessorKey: "sno", header: "ID", enableEditing: false, size: 80 },
        {
            accessorKey: "uploadedDate", header: "Fee month", muiEditTextFieldProps: {
                required: true,
                error: !!validationErrors?.uploadedDate,
                helperText: validationErrors?.uploadedDate,
                onFocus: () => setValidationErrors({ ...validationErrors, uploadedDate: undefined }),
            },
        },
        {
            accessorKey: "status", header: "Status", editVariant: "select", editSelectOptions: ["Active", "Inactive"], muiEditTextFieldProps: {
                select: true,
                error: !!validationErrors?.status,
                helperText: validationErrors?.status,
            },
        },
        { accessorKey: "feeInvoiceNo", header: "Fee Invoice No" },
        { accessorKey: "lastDate", header: "Last Date" },
        { accessorKey: "latestFee", header: "Latest Fee" },
        {
            header: "Actions", enableEditing: false, size: 150, Cell: ({ row }) => (
                <Button variant="contained" color="primary" onClick={() => handleOpenDialog(row.original)}>Open Form</Button>
            ),
        },
    ], [validationErrors]);

    const table = useMaterialReactTable({
        columns,
        data: transformedData,
        getRowId: row => row._id,
        muiToolbarAlertBannerProps: isError ? { color: "error", children: "Error loading data", } : undefined,
        muiTableContainerProps: { sx: { minHeight: "500px", }, },
    });

    useEffect(() => {
        console.log("Email loaded:", email);
    }, [email]);
    if (!email) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                <div className="flex justify-between">
                    <Typography variant="h6">Fee Details</Typography>
                <Button onClick={() => setCreateFormOpen(true)}
                  variant="contained"
                  size="small"
                  
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
                 Create Fee
                </Button>
                </div>
                
                    <MaterialReactTable table={table} />
                </>
            )}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>User Details</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <div className="mt-5">
                            <TextField label="s.no" name="sno" value={formState.sno} fullWidth margin="dense" InputProps={{ readOnly: true, }} onChange={handleInputChange} />
                            <TextField label="uploadedDate" name="uploadedDate" value={formState.uploadedDate} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="lastDate" name="lastDate" value={formState.lastDate} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="feeInvoiceNo" name="feeInvoiceNo" value={formState.feeInvoiceNo} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="latestFee" name="latestFee" value={formState.latestFee} fullWidth margin="dense" onChange={handleInputChange} />
                            <TextField label="Status" name="status" value={formState.status} fullWidth margin="dense" onChange={handleInputChange} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleAccept} color="primary">Accept</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={createFormOpen} onClose={() => setCreateFormOpen(false)}>
                <DialogTitle>Uploaded Fee</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleCreateUser}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Status" value="pending" InputProps={{ readOnly: true }} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Uploaded Date" name="uploadedDate" value={newUser.uploadedDate } onChange={(e) => setNewUser({ ...newUser, uploadedDate: e.target.value })} required fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Last date of submission" name="lastDate" value={newUser.lastDate} onChange={(e) => setNewUser({ ...newUser, lastDate: e.target.value })} required fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Fee Invoice no" name="feeInvoiceNo" value={newUser.feeInvoiceNo} onChange={(e) => setNewUser({ ...newUser, feeInvoiceNo: e.target.value })} required fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Upload latest fees" name="latestFee" value={newUser.latestFee} onChange={(e) => setNewUser({ ...newUser, latestFee: e.target.value })} required fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <label>Latest Fee</label>
                                <input type="file" accept="image/*" onChange={(e) => setLatestFeesImage(e.target.files[0])} required />
                            </Grid>
                        </Grid>
                        <DialogActions>
                            <Button onClick={() => setCreateFormOpen(false)}>Cancel</Button>
                            <Button  sx={{
                                    height: 36,
                                    borderRadius: 2,
                                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                                    textTransform: "none",
                                    fontSize: "1.1rem",
                                }} type="submit" variant="contained"  disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
            <ToastContainer />
        </>
    );
};

export default StudentFeeDetails;