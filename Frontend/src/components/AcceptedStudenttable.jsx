import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const AcceptedStudentTable = () => {
  const headingColor = "blue"; 

  const fakeData = [
    {
      id: "1",
      photo: "https://randomuser.me/api/portraits/men/1.jpg",
      name: "Muhammad Ali",
      gender: "Male",
      class: 10,
      section: "A",
      guardianname: "Fatima Ali",
      address: "123 Main Street, Lahore",
      dateOfBirth: "1995-05-15",
      phone: "+923001234567",
      email: "muhammad.ali@example.com",
      status: "approved",
    },
    {
      id: "2",
      photo: "https://randomuser.me/api/portraits/women/1.jpg",
      name: "Ayesha Khan",
      gender: "Female",
      class: 11,
      section: "B",
      guardianname: "Ahmed Khan",
      address: "456 Park Avenue, Karachi",
      dateOfBirth: "1996-07-20",
      phone: "+923331234567",
      email: "ayesha.khan@example.com",
      status: "approved",
    },
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle1" style={{ fontweight: "bold", color: headingColor }}>
                Roll Number
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Photo
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Gender
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Class
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Section
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Guardian Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Address
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Date of Birth
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Phone
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Email
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" style={{fontweight: "bold", color: headingColor }}>
                Status
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fakeData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>
                <img src={row.photo} alt="User" width="50" height="50" />
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.gender}</TableCell>
              <TableCell>{row.class}</TableCell>
              <TableCell>{row.section}</TableCell>
              <TableCell>{row.guardianname}</TableCell>
              <TableCell>{row.address}</TableCell>
              <TableCell>{row.dateOfBirth}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>
                <Typography variant="body1" style={{ color: "green" }}>
                  {row.status}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AcceptedStudentTable;
