import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Auth pages
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Home/public pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';

// Donor pages
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorScholarships from './pages/donor/Scholarships';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminManageScholarships from './pages/admin/ManageScholarships';
import AdminManageUsers from './pages/admin/ManageUsers';

// Error pages
import NotFound from './pages/NotFound';

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'scholarships', element: <ScholarshipsPage /> },
      { path: 'scholarships/:id', element: <ScholarshipDetailPage /> },
      
      // Auth routes
      { path: 'login', element: <LoginForm /> },
      { path: 'register', element: <RegisterForm /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      
      // Student routes
      { path: 'student/dashboard', element: <StudentDashboard /> },
      { path: 'student/profile', element: <StudentProfile /> },
      { path: 'student/applications', element: <StudentApplications /> },
      
      // Donor routes
      { path: 'donor/dashboard', element: <DonorDashboard /> },
      { path: 'donor/profile', element: <DonorProfile /> },
      { path: 'donor/scholarships', element: <DonorScholarships /> },
      
      // Admin routes
      { path: 'admin/dashboard', element: <AdminDashboard /> },
      { path: 'admin/profile', element: <AdminProfile /> },
      { path: 'admin/scholarships', element: <AdminManageScholarships /> },
      { path: 'admin/users', element: <AdminManageUsers /> },
    ],
  },
]);

export default router;
