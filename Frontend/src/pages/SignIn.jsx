import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import { ToastContainer, toast } from 'react-toastify';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { LoginSchema } from "../utils/Schemas";
import useUserAuthStore from "../store/userAuthStore/userAuthStore";
import { StudentContext } from "../api/studentContext";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function SignIn() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setRolevalue, setEmail, userEmailID } = useContext(StudentContext);
  const { setUserAuth } = useUserAuthStore();
  const [userValue, setUserValue] = useState(null);

  // Track email value changes in context and log it
  useEffect(() => {
    console.log("StudentContext email:", userEmailID);
    

  }, [userEmailID]);

  // Axios instance
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3333/ifl_system",
    withCredentials: true,
  });

  // Mutation for login
  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await axiosInstance.post(`/auth/login`, values);
      return data;
    },
    onError: () => toast.error('Invalid Credentials.', {}),
    onSuccess: (data, variables) => {
      if (data.success) {
        try {
          const { authToken, response } = data;
          // Use the email from Formik values (i.e. variables) to update context
          const userEmail = variables.email;

          // Save session details
          localStorage.setItem("authToken", authToken);
          localStorage.setItem("role", role);
          localStorage.setItem("confirmationDetails", response.user.id);
          localStorage.setItem("userEmail", userEmail);

          // Update context
          setRolevalue(role);
          setEmail(userEmail);

          // Log the email to the console
          // console.log("StudentContext email:", userEmail);

          toast.success('Login Successful', {});
          const IsStudentForm = localStorage.getItem("hasFilledApplication");

          // Navigate based on role
          const routes = {
            student:IsStudentForm? "/student/student_dashboard":"/student_application",
            donor: "/profile",
            admin: "/admin/admin_dashboard",
          };
          navigate(routes[role]);
        } catch (error) {
          console.error("Storage error:", error);
          toast.error("Error saving session data.");
        }
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    },
  });

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      const userEmail = user.email;

      // Extract and save user information
      const userInfo = {
        displayName: user.displayName,
        email: userEmail,
        photoURL: user.photoURL,
        uid: user.uid,
        token,
      };

      setUserValue(userInfo); // Set state for user info
      setUserAuth(userInfo); // Save user data globally

      // Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("displayName", user.displayName);
      localStorage.setItem("photoURL", user.photoURL);
      localStorage.setItem("role", "student");

      // Update context
      setEmail(userEmail);
      setRolevalue("student");

      toast.success("Google sign-in successful!",{});
      navigate("/profile"); // Redirect to profile page
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="mt-5">
      {userValue && (
        <div>
          <h1>{userValue.displayName}</h1>
          <h2>{userValue.email}</h2>
          <img src={userValue.photoURL} alt="User profile" />
        </div>
      )}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={(values) => {
          // Update context immediately with the email from the textbox
          setEmail(values.email);
          console.log("StudentContext email:", values.email);
          loginMutation.mutate({ ...values, role });
        }}
      >
        {({ errors, touched, values, handleChange, handleBlur }) => (
          <Form>
            <ThemeProvider theme={createTheme()}>
              <Container
                component="main"
                maxWidth="sm"
                sx={{
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
                  <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    Sign in
                  </Typography>
                  <Box noValidate sx={{ my: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      error={Boolean(errors.email && touched.email)}
                      helperText={errors.email && touched.email ? errors.email : ""}
                      autoComplete="email"
                      autoFocus
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.password}
                      error={Boolean(errors.password && touched.password)}
                      helperText={errors.password && touched.password ? errors.password : ""}
                    />
                    <Grid container justifyContent="center" spacing={3} my={1}>
                      {["student", "donor", "admin"].map((r) => (
                        <Grid item xs={12} sm={4} key={r}>
                          <Button
                            fullWidth
                            variant={role === r ? "contained" : "outlined"}
                            onClick={() => setRole(r)}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }}>
                      Sign In
                    </Button>
                    <Grid container>
                      <Grid item xs>
                        <Link href="#" variant="body2">
                          Forgot password?
                        </Link>
                      </Grid>
                      <Grid item>
                        <Link href="/signup" variant="body2">
                          {"Don't have an account? Sign Up"}
                        </Link>
                      </Grid>
                    </Grid>
                    <div className="flex justify-center items-center gap-8 mt-5">
                      <Button variant="contained" color="primary" onClick={handleGoogleSignIn}>
                        Sign in with Google
                      </Button>
                    </div>
                  </Box>
                </Box>
              </Container>
            </ThemeProvider>
          </Form>
        )}
      </Formik>

      <ToastContainer />
    </div>
  );
}

export default SignIn;
