import React from 'react'
import { Container, Breadcrumbs, Link, Typography, Paper } from "@mui/material";
import StudentCurrentCasesTable from "../../components/StudentCurrentCasesTable";

export default function StudentCurrentCases() {
  return (
    <div>
      <Container maxWidth="lg" sx={{ mx: 'auto', py: 5 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Student Current Cases</Typography>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <Typography color="textPrimary">Student Current Cases</Typography>
      </Breadcrumbs>
      <Paper sx={{ mt: 3 }}>
        <StudentCurrentCasesTable />
      </Paper>
    </Container>
    </div>
  )
}
