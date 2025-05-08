import axios from "axios";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { toast } from "react-toastify";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import {
  StudentSignupSchema,
  DonorSignupSchema,
  AdminSignupSchema,
} from "../utils/Schemas";
import userAuthStore from "../store/userAuthStore/userAuthStore";

const theme = createTheme();

export default function SignUp() {
  const logout = userAuthStore((state) => state.logout);
 
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState("Student");
  const updateUser = userAuthStore((state) => state.setUser);

  const changeForm = (value) => {
    setActiveForm(value);
  };

  const signUpMutation = useMutation({
    mutationFn: (values) => {
      let apiUrl;
      switch (activeForm) {
        case "Student":
          apiUrl = `http://localhost:3333/ifl_system/auth/create-student`;
          break;
        case "Donor":
          apiUrl = `http://localhost:3333/ifl_system/auth/create-donor`;
          break;
        case "Admin":
          apiUrl = `http://localhost:3333/ifl_system/auth/create-admin`;
          break;
        default:
          break;
      }
      return axios.post(apiUrl, values);
    },
    onError: (error) => {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        console.error('Response Error Data:', error.response.data);
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Error: ${errorMessages}`);
      } else {
        toast.error("Error creating user...");
      }
    },
    onSuccess: (data) => {
      if (data.data.error) {
        toast.error(data.data.error, {});
        return;
      }
      localStorage.setItem("access", data.data.access);
      setTimeout(() => {
        toast.success("Successfully registered");
        navigate("/signin");
      }, 2000);
    },
  });
  

  const validationSchema = {
    Student: StudentSignupSchema,
    Donor: DonorSignupSchema,
    Admin: AdminSignupSchema,
  }[activeForm];

  const initialFormValues = {
    Student: {
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      phone_no: "",
      cnic: "",
      institution: "",
      class_level: "",
    },
    Donor: {
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      phone_no: "",
      cnic: "",
      profession: "",
    },
    Admin: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      admin_role: "",
    },
  }[activeForm];

  return (
    <div>
      <Formik
         initialValues={initialFormValues}
         validationSchema={validationSchema}
         onSubmit={(values) => {
           console.log("Form Values:", values);
           signUpMutation.mutate(values);
         }}
       >
         {({
           errors,
           touched,
           values,
           handleChange,
           handleBlur,
           handleSubmit,
         }) => (
          <Form onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}>
              <Container
                component="main"
                maxWidth="sm"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CssBaseline />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: 3,
                    padding: "6%",
                    margin: "6%",
                    borderRadius: 2,
                  }}
                >
                  <Typography component="h6" variant="h6">
                    Create {activeForm} Account
                  </Typography>
                  <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        size="large"
                        variant={
                          activeForm === "Student" ? "contained" : "outlined"
                        }
                        onClick={() => changeForm("Student")}
                      >
                        Student
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        size="large"
                        variant={
                          activeForm === "Donor" ? "contained" : "outlined"
                        }
                        onClick={() => changeForm("Donor")}
                      >
                        Donor
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        size="large"
                        variant={
                          activeForm === "Admin" ? "contained" : "outlined"
                        }
                        onClick={() => changeForm("Admin")}
                      >
                        Admin
                      </Button>
                    </Grid>
                  </Grid>
                  <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5" marginBottom={3}>
                    Sign up
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="first_name"
                        required
                        fullWidth
                        id="first_name"
                        label="First Name"
                        autoFocus
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.first_name}
                        error={errors.first_name && touched.first_name}
                        helperText={
                          errors.first_name &&
                          touched.first_name &&
                          errors.first_name
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="last_name"
                        label="Last Name"
                        name="last_name"
                        autoComplete="family-name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.last_name}
                        error={errors.last_name && touched.last_name}
                        helperText={
                          errors.last_name &&
                          touched.last_name &&
                          errors.last_name
                        }
                      />
                    </Grid>
                    {activeForm === "Student" && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="phone_no"
                            label="Phone Number"
                            id="phone_no"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.phone_no}
                            error={errors.phone_no && touched.phone_no}
                            helperText={
                              errors.phone_no &&
                              touched.phone_no &&
                              errors.phone_no
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="cnic"
                            label="CNIC"
                            id="cnic"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.cnic}
                            error={errors.cnic && touched.cnic}
                            helperText={
                              errors.cnic && touched.cnic && errors.cnic
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            name="institution"
                            label="Institution"
                            id="institution"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.institution}
                            error={errors.institution && touched.institution}
                            helperText={
                              errors.institution &&
                              touched.institution &&
                              errors.institution
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            required
                            fullWidth
                            name="class_level"
                            label="Class Level"
                            type="number"
                            id="class_level"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.class_level}
                            error={errors.class_level && touched.class_level}
                            helperText={
                              errors.class_level &&
                              touched.class_level &&
                              errors.class_level
                            }
                          />
                        </Grid>
                      </>
                    )}
                    {activeForm === "Donor" && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="phone_no"
                            label="Phone Number"
                            id="phone_no"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.phone_no}
                            error={errors.phone_no && touched.phone_no}
                            helperText={
                              errors.phone_no &&
                              touched.phone_no &&
                              errors.phone_no
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="cnic"
                            label="CNIC"
                            id="cnic"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.cnic}
                            error={errors.cnic && touched.cnic}
                            helperText={
                              errors.cnic && touched.cnic && errors.cnic
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="profession"
                            label="Profession"
                            id="profession"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.profession}
                            error={errors.profession && touched.profession}
                            helperText={
                              errors.profession &&
                              touched.profession &&
                              errors.profession
                            }
                          />
                        </Grid>
                      </>
                    )}
                    {activeForm === "Admin" && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            name="admin_role"
                            label="Admin Role"
                            id="admin_role"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.admin_role}
                            error={errors.admin_role && touched.admin_role}
                            helperText={
                              errors.admin_role &&
                              touched.admin_role &&
                              errors.admin_role
                            }
                          />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                        error={errors.email && touched.email}
                        helperText={
                          errors.email && touched.email && errors.email
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        error={errors.password && touched.password}
                        helperText={
                          errors.password && touched.password && errors.password
                        }
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: theme.spacing(3), mb: theme.spacing(2) }}
                  >
                    Sign Up
                  </Button>
                  <Grid container justifyContent="center">
                    <Grid item>
                      <Link href="/signin" variant="body2">
                        Already have an account? Sign in
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </Container>
            </ThemeProvider>
          </Form>
        )}
      </Formik>
    </div>
  );
}
