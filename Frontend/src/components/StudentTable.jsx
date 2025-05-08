import React, { useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Grid } from "@mui/material";
const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [newUser, setNewUser] = useState({});
  const [users, setUsers] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [createFormOpen, setCreateFormOpen] = useState(false); // State to control form visibility

  useEffect(() => {
    fetchData();
  }, []); // Fetch data on component mount

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3333/ifl_system/adminCase/student_profile");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Roll Number",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "photo",
        header: "Photo",
        muiEditTextFieldProps: {
          type: "text",
          required: true,
          error: !!validationErrors?.photo,
          helperText: validationErrors?.photo,
        },
        renderCell: ({ value }) => (
          <img src={value} alt="User" width="50" height="50" />
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined }),
        },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        editVariant: "select",
        editSelectOptions: ["Male", "Female"],
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.state,
          helperText: validationErrors?.state,
        },
      },
      {
        accessorKey: "class",
        header: "Class",
        editVariant: "select",
        editSelectOptions: [1, 2, 3, 4, 5, 6, 7, 8],
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.state,
          helperText: validationErrors?.state,
        },
      },
      {
        accessorKey: "section",
        header: "Section",
        editVariant: "select",
        editSelectOptions: ["A", "B", "C"],
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.state,
          helperText: validationErrors?.state,
        },
      },
      {
        accessorKey: "guardianname",
        header: "Guardian Name",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.guardianname,
          helperText: validationErrors?.guardianname,
          onFocus: () => setValidationErrors({ ...validationErrors, guardianname: undefined }),
        },
      },
      {
        accessorKey: "address",
        header: "Address",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.address,
          helperText: validationErrors?.address,
          onFocus: () => setValidationErrors({ ...validationErrors, address: undefined }),
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        muiEditTextFieldProps: {
          required: true,
          type: "date",
          error: !!validationErrors?.dateOfBirth,
          helperText: validationErrors?.dateOfBirth,
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        muiEditTextFieldProps: {
          required: true,
          type: "number",
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        muiEditTextFieldProps: {
          type: "email",
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () => setValidationErrors({ ...validationErrors, email: undefined }),
        },
      },
    ],
    [validationErrors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3333/ifl_system/adminCase/student_profile", newUser);
      setNewUser({});
      fetchData(); // Fetch data again after adding a new user
      setCreateFormOpen(false); // Close the form after saving
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteRow = (row) => {
    setRowToDelete(row);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3333/ifl_system/adminCase/student_profile/${rowToDelete.original.id}`);
      setRowToDelete(null);
      setConfirmDeleteOpen(false);
      fetchData(); // Fetch data again after deleting a user
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setCreateFormOpen(true)}>Create User</Button> {/* Button to open the form */}
      <MaterialReactTable
        columns={columns}
        data={users}
        enableColumnOrdering
        renderRowActionMenuItems={({ row, closeMenu }) => [
          // Action menu items...
        ]}
      />
      {rowToDelete && (
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          {/* Confirm delete dialog */}
        </Dialog>
      )}
      <DialogContent>
        {/* Form */}
        <Dialog open={createFormOpen} onClose={() => setCreateFormOpen(false)}>
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
       
<form onSubmit={handleSubmit}>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Name"
        value={newUser.name || ""}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Gender"
        value={newUser.gender || ""}
        onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Class"
        value={newUser.class || ""}
        onChange={(e) => setNewUser({ ...newUser, class: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Section"
        value={newUser.section || ""}
        onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        label="Guardian Name"
        value={newUser.guardianname || ""}
        onChange={(e) => setNewUser({ ...newUser, guardianname: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        label="Address"
        value={newUser.address || ""}
        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Date of Birth"
        type="date"
        value={newUser.dateOfBirth || ""}
        onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Phone"
        type="number"
        value={newUser.phone || ""}
        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        label="Email"
        type="email"
        value={newUser.email || ""}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        required
        fullWidth
      />
    </Grid>
  
  </Grid>
</form>

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateFormOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSubmit} variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </>
  );
};

export default Example;
