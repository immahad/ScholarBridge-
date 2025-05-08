import { useMemo, useContext, useState, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Dialog, DialogTitle, DialogContent, DialogActions, Container, Breadcrumbs, Link, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { StudentContext } from "../api/studentContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Example = () => {
    const { useGetUsers, useUpdateUser, useUpdateDonor, useDonorDetails, useGetStudent } = useContext(StudentContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState({});
    const [selectedStudentId, setSelectedStudentId] = useState(""); // State to store the selected student ID

    const { isLoading, isError, data } = useDonorDetails();
    const { mutate: updateDonor } = useUpdateDonor();
    const { data: students, isLoading: isStudentsLoading, isError: isStudentsError } = useGetStudent();

    const handleOpenDialog = (user) => {
        setSelectedUser(user);
        setFormState(user);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
        setFormState({});
        setSelectedStudentId(""); // Reset selected student ID
        setDialogOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };

    const handleStudentChange = (e) => {
        setSelectedStudentId(e.target.value); // Update selected student ID
    };

    const handleAccept = async () => {
        try {
            if (!selectedStudentId) {
                toast.warning("Please select a student to assign");
                return;
            }

            const studentEmail = students.find((student) => student._id === selectedStudentId)?.email;

            // Log the request payload
            console.log("Request payload:", {
                donorId: selectedUser._id,
                studentEmail: studentEmail,
            });

            // Update the donor with the selected student
            await updateDonor({
                donorId: selectedUser._id,
                studentEmail: studentEmail,
            });

            handleCloseDialog();
            toast.success("Student assigned to donor successfully");
        } catch (error) {
            console.error("Error assigning student to donor:", error);
            toast.error("Error assigning student to donor");
        }
    };

    const transformedData = useMemo(() => {
        return data?.map(item => ({
            _id: item._id,
            first_name: item.first_name,
            last_name: item.last_name,
            cnic: item.cnic,
            phone: item.phone_no,
            email: item.email,
            profession: item.profession,
            students: item.students?.map((student) => student.studentEmail).join(", ") || "No students assigned",
        })) || [];
    }, [data]);

    const columns = useMemo(() => [
        {
            accessorKey: "_id",
            header: "ID",
            enableEditing: false,
            size: 80,
        },
        {
            accessorKey: "first_name",
            header: "First Name",
            muiEditTextFieldProps: {
                required: true,
                error: !!validationErrors?.name,
                helperText: validationErrors?.name,
                onFocus: () => setValidationErrors({
                    ...validationErrors,
                    name: undefined,
                }),
            },
        },
        {
            accessorKey: "last_name",
            header: "Last Name",
        },
        {
            accessorKey: "cnic",
            header: "CNIC",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "profession",
            header: "Profession",
        },
        {
            accessorKey: "students",
            header: "Assigned Students",
        },
        {
            header: "Actions",
            enableEditing: false,
            size: 150,
            Cell: ({ row }) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(row.original)}
                >
                    Open Form
                </Button>
            ),
        },
    ], [validationErrors]);

    const table = useMaterialReactTable({
        columns,
        data: transformedData,
        getRowId: row => row._id,
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: "Error loading data",
            }
            : undefined,
        muiTableContainerProps: {
            sx: {
                minHeight: "500px",
            },
        },
    });

    return (
        <>
            <Container maxWidth="lg" sx={{ mx: 'auto', py: 5 }}>
            <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem" }, textAlign: "center" // Center text on small screens
}}
>
  Donor Current Cases
</Typography>

                <Breadcrumbs aria-label="breadcrumb">
                    <Link href="/">Home</Link>
                    <Typography color="textPrimary">Donor Details</Typography>
                </Breadcrumbs>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <MaterialReactTable table={table} />
                )}
                <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                    <DialogTitle>Donor Details</DialogTitle>
                    <DialogContent>
                        {selectedUser && (
                            <>
                                <TextField
                                    label="ID"
                                    name="_id"
                                    value={formState._id}
                                    fullWidth
                                    margin="dense"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    label="First Name"
                                    name="firstname"
                                    value={formState.first_name}
                                    fullWidth
                                    margin="dense"
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    label="Last Name"
                                    name="lastname"
                                    value={formState.last_name}
                                    fullWidth
                                    margin="dense"
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    label="CNIC"
                                    name="cnic"
                                    value={formState.cnic}
                                    fullWidth
                                    margin="dense"
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    label="Phone"
                                    name="phone"
                                    value={formState.phone}
                                    fullWidth
                                    margin="dense"
                                    onChange={handleInputChange}
                                />
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={formState.email}
                                    fullWidth
                                    margin="dense"
                                    onChange={handleInputChange}
                                />
                                <Typography variant="h6" sx={{ mt: 3 }}>Assign Student</Typography>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel>Select Student</InputLabel>
                                    <Select
                                        value={selectedStudentId}
                                        onChange={handleStudentChange}
                                        label="Select Student"
                                    >
                                        {students?.map((student) => (
                                            <MenuItem key={student._id} value={student._id}>
                                                {student.email} 
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleAccept} color="primary">Assign Student</Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <ToastContainer />
        </>
    );
};

export default Example;
