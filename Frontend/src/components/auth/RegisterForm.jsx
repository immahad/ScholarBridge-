import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthUtils';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import '../../styles/auth.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Form validation schema
  const registerSchema = Yup.object().shape({
    // Common fields
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    role: Yup.string().oneOf(['student', 'donor', 'admin'], 'Invalid role').required('Role is required'),
    phoneNumber: Yup.string().required('Phone number is required'),

    // Student specific fields
   dateOfBirth: Yup.string().when('role', {
    is: 'student',
    then: schema =>
      schema
        .required('Date of birth is required')
        // Optionally: enforce YYYY-MM-DD format
        .matches(
          /^\d{4}-\d{2}-\d{2}$/,
          'Date of birth must be in YYYY-MM-DD format'
        ),
    otherwise: schema => schema.notRequired(),
  }),
    gender: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').required('Gender is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    cnic: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('CNIC/ID number is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    institution: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('Institution is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    program: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('Program is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    currentYear: Yup.number().when('role', {
      is: 'student',
      then: () => Yup.number().required('Current year is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    expectedGraduationYear: Yup.number().when('role', {
      is: 'student',
      then: () => Yup.number().required('Expected graduation year is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      cnic: '',
      institution: '',
      program: '',
      currentYear: '',
      expectedGraduationYear: '',
      donorType: 'individual',
      organizationName: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setServerError('');
        console.log('Submitting registration with values:', values);
        await register(values);
        navigate('/login', { state: { message: 'Registration successful! Please check your email to verify your account.' } });
      } catch (error) {
        console.error('Registration error:', error);
        setServerError(error.response?.data?.message || 'Registration failed. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Check if passwords match for visual feedback
  useEffect(() => {
    if (formik.values.password && formik.values.confirmPassword) {
      setPasswordsMatch(formik.values.password === formik.values.confirmPassword);
      // Remove confirmPassword error if they match
      if (
        formik.values.password === formik.values.confirmPassword &&
        formik.errors.confirmPassword === 'Passwords must match'
      ) {
        // Remove the error from Formik
        const newErrors = { ...formik.errors };
        delete newErrors.confirmPassword;
        formik.setErrors(newErrors);
      }
    } else {
      setPasswordsMatch(false);
    }
  }, [formik.values.password, formik.values.confirmPassword, formik]);

  // Show a summary of all errors at the top of the form
  const renderErrorSummary = () => {
    const allErrors = Object.values(formik.errors).filter(Boolean);
    if (allErrors.length === 0) return null;
    return (
      <div className="error-summary">
        <strong>Please fix the following errors:</strong>
        <ul>
          {allErrors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      </div>
    );
  };

  const nextStep = () => {
    // Validate first step fields
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role', 'phoneNumber'];
    const errors = {};
    fields.forEach(field => {
      try {
        registerSchema.fields[field].validateSync(formik.values[field]);
      } catch (error) {
        errors[field] = error.message;
      }
    });
    // Remove confirmPassword error if passwords match
    if (
      formik.values.password === formik.values.confirmPassword &&
      errors.confirmPassword === 'Passwords must match'
    ) {
      delete errors.confirmPassword;
    }
    // Update formik errors
    formik.setErrors({ ...formik.errors, ...errors });
    // If no errors in these fields, go to next step
    const hasStepErrors = fields.some(field => errors[field]);
    if (!hasStepErrors) {
      setStep(2);
    } else {
      // Show a toast/alert if there are errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert('Please fix the errors before proceeding.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission directly for donor role
  const handleDonorSubmit = () => {
    console.log('Submitting donor registration:', formik.values);
    formik.submitForm();
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">Create an Account</h2>
        {renderErrorSummary()}
        {serverError && <div className="error-message">{serverError}</div>}
        
        <form onSubmit={formik.handleSubmit} className="auth-form">
          {step === 1 && (
            <div className="auth-step">
              <div className="form-group">
                <label htmlFor="role">I am a:</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="student">Student</option>
                  <option value="donor">Donor</option>
                </select>
                {formik.touched.role && formik.errors.role && (
                  <div className="error-text">{formik.errors.role}</div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <div className="error-text">{formik.errors.firstName}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <div className="error-text">{formik.errors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="error-text">{formik.errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="form-control"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <div className="error-text">{formik.errors.phoneNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-control"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="error-text">{formik.errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className="error-text">{formik.errors.confirmPassword}</div>
                )}
                {formik.values.password && formik.values.confirmPassword && (
                  <div className={passwordsMatch ? "success-text" : "error-text"}>
                    {passwordsMatch ? (
                      <><FaCheck /> Passwords match</>
                    ) : (
                      'Passwords do not match'
                    )}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && formik.values.role === 'student' && (
            <div className="auth-step">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-control"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                  <div className="error-text">{formik.errors.dateOfBirth}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <div className="error-text">{formik.errors.gender}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cnic">CNIC/ID Number</label>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  className="form-control"
                  value={formik.values.cnic}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.cnic && formik.errors.cnic && (
                  <div className="error-text">{formik.errors.cnic}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="institution">Institution/University</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  className="form-control"
                  value={formik.values.institution}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.institution && formik.errors.institution && (
                  <div className="error-text">{formik.errors.institution}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="program">Program/Degree</label>
                <input
                  type="text"
                  id="program"
                  name="program"
                  className="form-control"
                  value={formik.values.program}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.program && formik.errors.program && (
                  <div className="error-text">{formik.errors.program}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentYear">Current Year of Study</label>
                  <input
                    type="number"
                    id="currentYear"
                    name="currentYear"
                    className="form-control"
                    value={formik.values.currentYear}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.currentYear && formik.errors.currentYear && (
                    <div className="error-text">{formik.errors.currentYear}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="expectedGraduationYear">Expected Graduation Year</label>
                  <input
                    type="number"
                    id="expectedGraduationYear"
                    name="expectedGraduationYear"
                    className="form-control"
                    value={formik.values.expectedGraduationYear}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.expectedGraduationYear && formik.errors.expectedGraduationYear && (
                    <div className="error-text">{formik.errors.expectedGraduationYear}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && formik.values.role === 'donor' && (
            <div className="auth-step">
              <div className="form-group">
                <label htmlFor="donorType">Donor Type</label>
                <select
                  id="donorType"
                  name="donorType"
                  className="form-control"
                  value={formik.values.donorType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              
              {formik.values.donorType === 'organization' && (
                <div className="form-group">
                  <label htmlFor="organizationName">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    className="form-control"
                    value={formik.values.organizationName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.organizationName && formik.errors.organizationName && (
                    <div className="error-text">{formik.errors.organizationName}</div>
                  )}
                </div>
              )}
              
              <p className="info-text">Please click Register to create your donor account. You'll be able to complete your profile after logging in.</p>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  onClick={handleDonorSubmit}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;