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
import SupportPage from './pages/SupportPage';
import ContactPage from './pages/ContactPage';
import HowToApplyPage from './pages/HowToApplyPage';
import ApplicationTipsPage from './pages/ApplicationTipsPage';
import ResourcesPage from './pages/ResourcesPage';
import FAQsPage from './pages/FAQsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentApplications from './pages/student/Applications';

// Donor pages
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorScholarships from './pages/donor/Scholarships';
import BrowseStudents from './pages/donor/BrowseStudents';
import DonorReports from './pages/donor/Reports';
import CreateScholarship from './pages/donor/CreateScholarship';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminManageScholarships from './pages/admin/ManageScholarships';
import SimpleManageUsers from './pages/admin/SimpleManageUsers';

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
      { path: 'support', element: <SupportPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'how-to-apply', element: <HowToApplyPage /> },
      { path: 'tips', element: <ApplicationTipsPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'faqs', element: <FAQsPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsOfServicePage /> },
      
      // Auth routes
      { path: 'login', element: <LoginForm /> },
      { path: 'register', element: <RegisterForm /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      
      // Student routes
      { path: 'student/dashboard', element: <StudentDashboard /> },
      { path: 'student/profile', element: <StudentProfile /> },
      { path: 'student/applications', element: <StudentApplications /> },
      { path: 'student/applications/:id', element: <StudentApplications /> },
      
      // Donor routes
      { path: 'donor/dashboard', element: <DonorDashboard /> },
      { path: 'donor/profile', element: <DonorProfile /> },
      { path: 'donor/scholarships', element: <DonorScholarships /> },
      { path: 'donor/scholarships/create', element: <CreateScholarship /> },
      { path: 'donor/students', element: <BrowseStudents /> },
      { path: 'donor/reports', element: <DonorReports /> },
      
      // Admin routes
      { path: 'admin/dashboard', element: <AdminDashboard /> },
      { path: 'admin/profile', element: <AdminProfile /> },
      { path: 'admin/scholarships', element: <AdminManageScholarships /> },
      // User management routes (with both URL options)
      { path: 'admin/users', element: <SimpleManageUsers /> },
      { path: 'admin/manage-users', element: <SimpleManageUsers /> },
      
      // Catch-all route for admin section
      { path: 'admin/*', element: <AdminDashboard /> },
    ],
  },
]);

export default router;
