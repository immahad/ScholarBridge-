import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Auth pages
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import ResendVerification from './components/auth/ResendVerification';
import VerificationStatusPage from './pages/VerificationStatusPage';

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
import ApplicationDetails from './pages/student/ApplicationDetails';

// Donor pages
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorScholarships from './pages/donor/Scholarships';
import BrowseStudents from './pages/donor/BrowseStudents';
import DonorReports from './pages/donor/Reports';
import CreateScholarship from './pages/donor/CreateScholarship';
import DonorScholarshipView from './pages/donor/ScholarshipView';
import StudentDetail from './pages/donor/StudentDetail';
import PaymentForm from './pages/donor/PaymentForm';
import GeneralDonationForm from './pages/donor/GeneralDonationForm';
import DonationSuccess from './pages/donor/DonationSuccess';
import DonationCancel from './pages/donor/DonationCancel';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminManageScholarships from './pages/admin/ManageScholarships';
import SimpleManageUsers from './pages/admin/SimpleManageUsers';
import AdminBrowseStudents from './pages/admin/BrowseStudents';
import AdminCreateScholarship from './pages/admin/CreateScholarship';
import AdminReports from './pages/admin/Reports';
import AdminDonorScholarships from './pages/admin/PendingScholarships';
import AdminApplications from './pages/admin/Applications';
import AdminScholarshipView from './pages/admin/ScholarshipView';

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
      { path: 'verify-email/:role/:token', element: <VerifyEmail /> },
      { path: 'verification-success', element: <VerificationStatusPage status="success" /> },
      { path: 'verification-failed', element: <VerificationStatusPage status="failed" /> },
      { path: 'resend-verification', element: <ResendVerification /> },
      
      // Student routes
      { path: 'student/dashboard', element: <StudentDashboard /> },
      { path: 'student/profile', element: <StudentProfile /> },
      { path: 'student/applications', element: <StudentApplications /> },
      { path: 'student/applications/:id', element: <ApplicationDetails /> },
      
      // Donor routes
      { path: 'donor/dashboard', element: <DonorDashboard /> },
      { path: 'donor/profile', element: <DonorProfile /> },
      { path: 'donor/scholarships', element: <DonorScholarships /> },
      { path: 'donor/scholarships/create', element: <CreateScholarship /> },
      { path: 'donor/scholarships/:id', element: <DonorScholarshipView /> },
      { path: 'donor/students', element: <BrowseStudents /> },
      { path: 'donor/students/:studentId', element: <StudentDetail /> },
      { path: 'donor/fund-scholarship/:scholarshipId/:studentId', element: <PaymentForm /> },
      { path: 'donor/payment', element: <GeneralDonationForm /> },
      { path: 'donor/donation/success', element: <DonationSuccess /> },
      { path: 'donor/donation/cancel', element: <DonationCancel /> },
      { path: 'donor/reports', element: <DonorReports /> },
      
      // Admin routes
      { path: 'admin/dashboard', element: <AdminDashboard /> },
      { path: 'admin/profile', element: <AdminProfile /> },
      { path: 'admin/scholarships', element: <AdminManageScholarships /> },
      { path: 'admin/scholarships/create', element: <AdminCreateScholarship /> },
      { path: 'admin/scholarships/edit/:id', element: <AdminCreateScholarship /> },
      { path: 'admin/scholarships/view/:id', element: <AdminScholarshipView /> },
      { path: 'admin/donor-scholarships', element: <AdminDonorScholarships /> },
      { path: 'admin/users', element: <SimpleManageUsers /> },
      { path: 'admin/manage-users', element: <SimpleManageUsers /> },
      { path: 'admin/students', element: <AdminBrowseStudents /> },
      { path: 'admin/students/:studentId', element: <StudentDetail /> },
      { path: 'admin/reports', element: <AdminReports /> },
      { path: 'admin/applications', element: <AdminApplications /> },
      { path: 'admin/applications/:id', element: <AdminApplications /> },
      
      // Catch-all route for admin section
      { path: 'admin/*', element: <AdminDashboard /> },
    ],
  },
]);

export default router;
