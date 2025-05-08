import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect, useContext } from "react";
import Cookies from "js-cookie";
import {
  AdminRoute,
  DonorRoute,
  StudentRoute
} from "./routes/RouteCegories";
import AdminNavbar from "./pages/Admin/adminNavbar";

import Navbarhome from "./pages/home/Navbarhome";
import Navbarstudent from "./pages/Student/studentNavbar";

import Navbardonor from "./pages/Donor/donorNavbar"
import Dashboard from "./pages/home/DashBoard";
import Contactus from "./pages/home/contact";
import AboutUs from "./pages/home/about";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

import ViewDonor from "./pages/Admin/ViewDonor";
import StudentCurrentCases from "./pages/Student/StudentCurrentCases";
import Messaging from "./pages/Messaging";
import DonorDonationCase from "./pages/Donor/DonorDonationCase";


import StudentDashboard from "./pages/Student/StudentProfile";
import PersonalDataForm from "./pages/Student/StudentApplicationForm";
import Feedbacklist from "./pages/Admin/Feedbacklist";
import PaymentForm from "./pages/Donor/DonorDashboard";
import Profile from "./pages/Profile";
import { StudentContext } from "./api/studentContext";
import DonorSponsoredDetails from "./pages/Donor/donorSponsoreddetails";
import FeedbackForm from "./components/feedback";
import AdminDashboard from "./pages/Admin/AdminDashboard";


function App() {
  const queryClient = new QueryClient();


  const { roleValue, setRolevalue, userEmailID } = useContext(StudentContext);
  console.log(roleValue);

  useEffect(() => {
    const storedRole = Cookies.get("role");
    setRolevalue(storedRole || "guest");
    console.log(roleValue);
    setRolevalue(localStorage.getItem("role"));
    
  }, [roleValue]);





  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>

        {roleValue ? (
          roleValue === "admin" ? <AdminNavbar userEmail={userEmailID}/> :
            roleValue === "student" ? <Navbarstudent userEmail={userEmailID}/> :
              roleValue === "donor" ? <Navbardonor userEmail={userEmailID}/> :
                <Navbarhome />
        ) : (
          <Navbarhome />
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/contactus" element={<Contactus />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Routes */}
          <Route path="/admin/admin_dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/student_current_cases" element={<AdminRoute><StudentCurrentCases /></AdminRoute>} />
          <Route path="/messaging" element={<AdminRoute><Messaging /></AdminRoute>} />
          <Route path="/donor_requested_case_view" element={<AdminRoute><DonorDonationCase /></AdminRoute>} />
          <Route path="/feebackresponses" element={<AdminRoute><Feedbacklist /></AdminRoute>} />



          {/* Student Routes */}
          <Route path="/student/student_dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/student_application" element={<StudentRoute><PersonalDataForm /></StudentRoute>} />
          <Route path="/student/feedback" element={<StudentRoute><FeedbackForm /></StudentRoute>} />

          {/* Donor Routes */}
          {/* <Route path="/donor/donor_dashboard" element={<DonorRoute><PaymentForm /></DonorRoute>} /> */}
          <Route path="/profile" element={<DonorRoute><Profile /></DonorRoute>} />
          <Route path="/donor/feedback" element={<DonorRoute><FeedbackForm /></DonorRoute>} />
          <Route path="/donor/sponsored-student-details/" element={<DonorRoute><DonorSponsoredDetails /></DonorRoute>} />
          <Route path="/*" element={<><h1>Page not found</h1></>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
