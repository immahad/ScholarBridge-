

import React from "react";
import { Link } from "react-router-dom";
import { Typography, Grid, Box } from "@mui/material";

import DonorCounting from "../components/DonorCounting";
import CompletedCases from "../components/CompletedCases";
import Counting from "../components/Counting";
import MainContainer from ".././components/MainContainer";

import StudentDetailsCounting from "../components/studentDetailsCounting";


export default function Dashboard() {
  return (
    <Box className="relative w-full md:p-8 p-5">
      <Typography variant="h4">Admin Dashboard</Typography>
      <Box my={2}>
        <Link to="#">Admin</Link>
        <span className="text-amber-600 hover:f">
          <span className="mx-3">/</span>
          <Link to="/admin-dashboard">Dashboard</Link>
        </span>
      </Box>
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
          <DonorCounting />
        </Grid>
        <Grid item md={4} xs={12}>
          <Counting />
        </Grid>
        <Grid item md={4} xs={12}>
          <CompletedCases />
        </Grid>
      </Grid>
      <Grid item md ={12} xs={12} style={{marginTop: "3rem"}} >
        <MainContainer/>
      </Grid>
    </Box>
  );
}