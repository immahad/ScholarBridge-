

import React from "react";
import { Container, Breadcrumbs, Link, Typography, Paper } from "@mui/material";
import AcceptedStudenttable from "../../components/AcceptedStudenttable";
export default function AcceptedStudentDetails() {
  return (
    <Container maxWidth="lg" sx={{ mx: 'auto', py: 5 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Approved Student List</Typography>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <Typography color="textPrimary">Accepted Student List</Typography>
      </Breadcrumbs>
      <Paper sx={{ mt: 3 }}>
        <AcceptedStudenttable/>
      </Paper>
    </Container>
  );
}
