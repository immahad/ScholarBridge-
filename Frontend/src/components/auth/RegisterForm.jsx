import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/auth.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState(1);

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
    dateOfBirth: Yup.date().when('role', {
      is: 'student',
      then: () => Yup.date().required('Date of birth is required'),
    }),
    gender: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').required('Gender is required'),
    }),
    cnic: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('CNIC/ID number is required'),
    }),
    institution: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('Institution is required'),
    }),
    program: Yup.string().when('role', {
      is: 'student',
      then: () => Yup.string().required('Program is required'),
    }),
    currentYear: Yup.number().when('role', {
      is: 'student',
      then: () => Yup.number().required('Current year is required'),
    }),
    expectedGraduationYear: Yup.number().when('role', {
      is: 'student',
      then: () => Yup.number().required('Expected graduation year is required'),
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
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setServerError('');
        await register(values);
        navigate('/login', { state: { message: 'Registration successful! Please check your email to verify your account.' } });
      } catch (error) {
        setServerError(error.response?.data?.message || 'Registration failed. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
  });

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
    
    // Check if passwords match
    if (formik.values.password !== formik.values.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }
    
    // Update formik errors
    formik.setErrors({...formik.errors, ...errors});
    
    // If no errors in these fields, go to next step
    if (Object.keys(errors).length === 0) {
      setStep(2);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-wrapper">
        <h2 className="auth-title">Create an Account</h2>
        
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
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="error-text">{formik.errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className="error-text">{formik.errors.confirmPassword}</div>
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
              <p>Please click Register to create your donor account. You'll be able to complete your profile after logging in.</p>
              
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
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 