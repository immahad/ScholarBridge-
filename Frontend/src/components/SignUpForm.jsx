// import axios from 'axios';
// import { React, useState } from 'react';
// import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
// import CssBaseline from '@mui/material/CssBaseline';
// import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
// import Grid from '@mui/material/Grid';
// import Box from '@mui/material/Box';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import Typography from '@mui/material/Typography';
// import Container from '@mui/material/Container';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import { createTheme, ThemeProvider } from '@mui/material/styles';

// // function Copyright(props) {
// //   return (
// //     <Typography variant="body2" color="text.secondary" align="center" {...props}>
// //       {'Copyright © '}
// //       <Link color="inherit" href="https://mui.com/">
// //         Your Website
// //       </Link>{' '}
// //       {new Date().getFullYear()}
// //       {'.'}
// //     </Typography>
// //   );
// // }

// // TODO remove, this demo shouldn't need to reset the theme.

// const defaultTheme = createTheme();

// export default function SignUp() {
//   const [data, setData] = useState(null);
//   const [role, setRole] = useState('student');

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const info = new FormData(event.currentTarget);
//     setRole(info.get('role'));
//     console.log(role);
//     const formData = {
//       full_name: info.get('firstName') + ' ' + info.get('lastName'),
//       email: info.get('email'),
//       password: info.get('password'),
//     };

//     if (info.get('role') === 'admin') {
//       formData.admin_role = info.get('role');
//     } else if (info.get('role') === 'donor') {
//       formData.father_name = info.get('lastName');
//       formData.phone_no = info.get('phone_no');
//       formData.cnic = info.get('cnic');
//       formData.profession = info.get('profession');
//     } else {
//       formData.father_name = info.get('lastName');
//       formData.phone_no = info.get('phone_no');
//       formData.cnic = info.get('cnic');
//       formData.institution = info.get('institution');
//       formData.class_level = info.get('class_level');
//     }
//     setData(formData);
//     console.log(formData);
//     try {
//       const url = `http://localhost:3333/ifl_system/auth/create-${info.get('role')}`;
//       const {data:res} = await axios.post(url, data);
//       console.log(res);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <ThemeProvider theme={defaultTheme}>
//       <Container component="main" maxWidth="xs">
//         <CssBaseline />
//         <Box
//           sx={{
//             marginTop: 1,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//           }}
//         >
//           <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
//             <LockOutlinedIcon />
//           </Avatar>
//           <Typography component="h1" variant="h5">
//             Sign up
//           </Typography>
//           <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   autoComplete="given-name"
//                   name="firstName"
//                   required
//                   fullWidth
//                   id="firstName"
//                   label="First Name"
//                   autoFocus
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   required
//                   fullWidth
//                   id="lastName"
//                   label="Last Name"
//                   name="lastName"
//                   autoComplete="family-name"
//                 />
//               </Grid>
//               {role === 'student' && (
//                 <>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="phone_no"
//                       label="Phone Number"
//                       id="phone_no"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="cnic"
//                       label="CNIC"
//                       id="cnic"
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="institution"
//                       label="Institution"
//                       id="institution"
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="class_level"
//                       label="Class Level"
//                       type="number"
//                       id="class_level"
//                     />
//                   </Grid>
//                 </>
//               )}
//               {role === 'donor' && (
//                 <>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="phone_no"
//                       label="Phone Number"
//                       id="phone_no"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="cnic"
//                       label="CNIC"
//                       id="cnic"
//                     />
//                   </Grid>
//                   <Grid item xs={12}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="profession"
//                       label="Profession"
//                       id="profession"
//                     />
//                   </Grid>
//                 </>
//               )}
//               {role === 'admin' && (
//                 <>
//                   <Grid item xs={12}>
//                     <TextField
//                       required
//                       fullWidth
//                       name="admin_role"
//                       label="Role"
//                       id="admin_role"
//                     />
//                   </Grid>
//                 </>
//               )}
//               <Grid item xs={12}>
//                 <TextField
//                   required
//                   fullWidth
//                   id="email"
//                   label="Email Address"
//                   name="email"
//                   autoComplete="email"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   required
//                   fullWidth
//                   name="password"
//                   label="Password"
//                   type="password"
//                   id="password"
//                   autoComplete="new-password"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <RadioGroup
//                   row
//                   aria-labelledby="demo-row-radio-buttons-group-label"
//                   style={{ display: 'flex', justifyContent: 'space-between' }}
//                   id="role"
//                   name="role"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                 >
//                   <FormControlLabel value="student" control={<Radio />} label="Student" />
//                   <FormControlLabel value="donor" control={<Radio />} label="Donor" />
//                   <FormControlLabel value="admin" control={<Radio />} label="Admin" />
//                 </RadioGroup>
//               </Grid>
//             </Grid>
//             <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
//               Sign Up
//             </Button>
//             <Grid container justifyContent="flex-end">
//               <Grid item>
//                 <Link href="/signin" variant="body2">
//                   Already have an account? Sign in
//                 </Link>
//               </Grid>
//             </Grid>
//           </Box>
//         </Box>
//       </Container>
//     </ThemeProvider>
//   );
// }
