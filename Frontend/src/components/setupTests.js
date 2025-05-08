import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
// import'../styles/PersonalDataForm.css';
import { useMutation } from 'react-query';

const schema = yup.object().shape({
  serialNo: yup.number().required('Serial Number is required'),
  rollNo: yup.number().required('Roll No is required'),
  name: yup.string().required('Name is required'),
  dobDay: yup.number().required('Day is required').min(1).max(31),
  dobMonth: yup.number().required('Month is required').min(1).max(12),
  dobYear: yup.number().required('Year is required').min(1900).max(new Date().getFullYear()),
  sex: yup.string().required('Sex is required'),
  cnic: yup.string().required('CNIC number is required'),
  fatherName: yup.string().required("Father's name is required"),
  fatherCnic: yup.string().required("Father's CNIC number is required"),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  currentAddress: yup.string().required('Current address is required'),
  permanentAddress: yup.string().required('Permanent address is required'),
  selfCnic: yup.mixed().required('Self CNIC/Form-B image is required'),
  latestFees: yup.mixed().required('Latest fees image is required'),
  fatherCnicImage: yup.mixed().required('Father CNIC image is required'),
});

const transferSchema = yup.object().shape({
  nameTransfer: yup.string().required('Name is required'),
  cnicTransfer: yup.string().required('CNIC number is required'),
  emailTransfer: yup.string().email('Invalid email').required('Email is required'),
});

const PersonalDataForm = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [openBox, setOpenBox] = useState(false);
  const [studentCase, setStudentCase] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    formState: { errors: transferErrors },
  } = useForm({
    resolver: yupResolver(transferSchema),
  });
  const onSubmit = async (data) => {
    const PersonalDataForm = () => {
      const [profileImage, setProfileImage] = useState(null);
      const [openBox, setOpenBox] = useState(false);
      const [studentCase, setStudentCase] = useState(null);

      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm({
        resolver: yupResolver(schema),
      });

      const {
        register: registerTransfer,
        handleSubmit: handleSubmitTransfer,
        formState: { errors: transferErrors },
      } = useForm({
        resolver: yupResolver(transferSchema),
      });

      const mutation = useMutation(async (data) => {
        try {
          const formData = new FormData();

          if (data.profileImage[0]) {
            formData.append('profileImage', data.profileImage[0]);
          }
          if (data.selfCnic[0]) {
            formData.append('selfCnic', data.selfCnic[0]);
          }
          if (data.latestFees[0]) {
            formData.append('latestFees', data.latestFees[0]);
          }
          if (data.fatherCnicImage[0]) {
            formData.append('fatherCnicImage', data.fatherCnicImage[0]);
          }

          // Append other form fields
          formData.append('name', data.name);
          formData.append('dobDay', data.dobDay);
          formData.append('dobMonth', data.dobMonth);
          formData.append('dobYear', data.dobYear);
          formData.append('sex', data.sex);
          formData.append('cnic', data.cnic);
          formData.append('fatherName', data.fatherName);
          formData.append('fatherCnic', data.fatherCnic);
          formData.append('phone', data.phone);
          formData.append('email', data.email);
          formData.append('currentAddress', data.currentAddress);
          formData.append('permanentAddress', data.permanentAddress);
          formData.append('familyIncome', data.familyIncome);
          formData.append('domicile', data.domicile);

          const response = await axios.post('http://localhost:4000/upload-personal-data', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log(response.data);
          alert(response.data);
        } catch (error) {
          alert('Failed to submit the form. Please try again later.');
          console.error('Error submitting form:', error);
        }
      });

      const onSubmit = async (data) => {
        mutation.mutate(data);
      };

      const transferData = async (data) => {
        try {
          const response = await axios.get(`http://localhost:4000/get-student?email=${data.emailTransfer}`);
          const studentCase = response.data;
        }
        catch(error){
          console.error('Error transferring data:', error);}
      };

      const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(URL.createObjectURL(file));
        console.log('Profile Image Updated:', URL.createObjectURL(file));
      };

      return (
        <>
          <form className="personal-data-form" onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="serial-number" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="serialNo">Serial No:</label>
            <input type="text" id="serialNo" placeholder="Enter Serial Number" {...register('serialNo')} />
          </div>
          <div className="roll-number" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="rollNo">Roll No:</label>
            <input type="text" id="rollNo" placeholder="Enter Roll Number" {...register('rollNo')} />
          </div>
        </div>
        <div className="profile-picture-upload">
          <label htmlFor="profileImage">Paste your current coloured photograph</label>
          <input type="file" id="profileImage" onChange={handleProfileImageChange} {...register('profileImage')} />
          {profileImage && <img src={profileImage} alt="Profile" className="profile-image" />}
        </div>
        <div className="form-group">
          <label htmlFor="name">1. Name</label>
          <input id="name" {...register('name')} />
          <p className="error-message">{errors.name?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="dob">2. Date of Birth</label>
          <div className="dob-fields">
            <input id="dobDay" {...register('dobDay')} placeholder="Day" />
            <input id="dobMonth" {...register('dobMonth')} placeholder="Month" />
            <input id="dobYear" {...register('dobYear')} placeholder="Year" />
          </div>
          <p className="error-message">{errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message}</p>
        </div>
        <div className="form-group">
          <label>3. Sex</label>
          <div className="radio-group">
            <label>
              <input type="radio" value="Male" {...register('sex')} /> Male
            </label>
            <label>
              <input type="radio" value="Female" {...register('sex')} /> Female
            </label>
            <label>
              <input type="radio" value="Notperfer" {...register('sex')} /> Not Preferable
            </label>
          </div>
          <p className="error-message">{errors.sex?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="cnic">4. National ID Card No</label>
          <input id="cnic" {...register('cnic')} />
          <p className="error-message">{errors.cnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherName">5. Father Name</label>
          <input id="fatherName" {...register('fatherName')} />
          <p className="error-message">{errors.fatherName?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherCnic">Father's CNIC No</label>
          <input id="fatherCnic" {...register('fatherCnic')} />
          <p className="error-message">{errors.fatherCnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="familyIncome">6. Family Income</label>
          <input id="familyIncome" {...register('familyIncome')} />
        </div>
        <div className="form-group">
          <label htmlFor="domicile">7. Domicile</label>
          <input id="domicile" {...register('domicile')} />
        </div>
        <div className="form-group">
          <label htmlFor="phone">8. Phone Number</label>
          <input id="phone" {...register('phone')} />
          <p className="error-message">{errors.phone?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="email">9. Email</label>
          <input id="email" {...register('email')} />
          <p className="error-message">{errors.email?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="currentAddress">10. Current Address</label>
          <input id="currentAddress" {...register('currentAddress')} />
          <p className="error-message">{errors.currentAddress?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="permanentAddress">11. Permanent Address</label>
          <input id="permanentAddress" {...register('permanentAddress')} />
          <p className="error-message">{errors.permanentAddress?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="selfCnic">Self CNIC/Form-B</label>
          <input type="file" id="selfCnic" {...register('selfCnic')} />
          <p className="error-message">{errors.selfCnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="latestFees">Submit Latest Fees</label>
          <input type="file" id="latestFees" {...register('latestFees')} />
          <p className="error-message">{errors.latestFees?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherCnicImage">Father CNIC</label>
          <input type="file" id="fatherCnicImage" {...register('fatherCnicImage')} />
          <p className="error-message">{errors.fatherCnicImage?.message}</p>
        </div>
        <button type="submit">Submit</button>
          </form>

          <button onClick={() => setOpenBox(!openBox)}>Data transfer</button>
          {openBox && (
            <div>
              <form onSubmit={handleSubmitTransfer(transferData)}>
              <div className="form-group">
              <label htmlFor="nameTransfer">Name</label>
              <input id="nameTransfer" {...registerTransfer('nameTransfer')} />
              <p className="error-message">{transferErrors.nameTransfer?.message}</p>
            </div>
            <div className="form-group">
              <label htmlFor="cnicTransfer">National ID Card No</label>
              <input id="cnicTransfer" {...registerTransfer('cnicTransfer')} />
              <p className="error-message">{transferErrors.cnicTransfer?.message}</p>
            </div>
            <div className="form-group">
              <label htmlFor="emailTransfer">Email</label>
              <input id="emailTransfer" {...registerTransfer('emailTransfer')} />
              <p className="error-message">{transferErrors.emailTransfer?.message}</p>
            </div>
            <button type="submit">Submit</button>
              </form>
            </div>
          )}
        </>
      );
    };
  };

  const transferData = async (data) => {
    try {
      const response = await axios.get(`http://localhost:4000/get-student?email=${data.emailTransfer}`);
      const studentCase = response.data;

      const jsonData = {
        profileImage: studentCase.profileImage,
        selfCnic: studentCase.selfCnic,
        latestFees: studentCase.latestFees,
        fatherCnicImage: studentCase.fatherCnicImage,
        name: studentCase.name,
        dobDay: studentCase.dobDay,
        dobMonth: studentCase.dobMonth,
        dobYear: studentCase.dobYear,
        sex: studentCase.sex,
        cnic: studentCase.cnic,
        fatherName: studentCase.fatherName,
        fatherCnic: studentCase.fatherCnic,
        phone: studentCase.phone,
        email: studentCase.email,
        currentAddress: studentCase.currentAddress,
        permanentAddress: studentCase.permanentAddress,
        familyIncome: studentCase.familyIncome,
        domicile: studentCase.domicile,
      };

      const transferResponse = await axios.post('http://localhost:4000/transfer-personal-data', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(transferResponse.data);
      alert(transferResponse.data.message);
    } catch (error) {
      console.error('Error transferring data:', error);
    }
  };
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(URL.createObjectURL(file));
    console.log('Profile Image Updated:', URL.createObjectURL(file));
  };

  return (
    <>
      <form className="personal-data-form" onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="serial-number" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="serialNo">Serial No:</label>
            <input type="text" id="serialNo" placeholder="Enter Serial Number" {...register('serialNo')} />
          </div>
          <div className="roll-number" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="rollNo">Roll No:</label>
            <input type="text" id="rollNo" placeholder="Enter Roll Number" {...register('rollNo')} />
          </div>
        </div>
        <div className="profile-picture-upload">
          <label htmlFor="profileImage">Paste your current coloured photograph</label>
          <input type="file" id="profileImage" onChange={handleProfileImageChange} {...register('profileImage')} />
          {profileImage && <img src={profileImage} alt="Profile" className="profile-image" />}
        </div>
        <div className="form-group">
          <label htmlFor="name">1. Name</label>
          <input id="name" {...register('name')} />
          <p className="error-message">{errors.name?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="dob">2. Date of Birth</label>
          <div className="dob-fields">
            <input id="dobDay" {...register('dobDay')} placeholder="Day" />
            <input id="dobMonth" {...register('dobMonth')} placeholder="Month" />
            <input id="dobYear" {...register('dobYear')} placeholder="Year" />
          </div>
          <p className="error-message">{errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message}</p>
        </div>
        <div className="form-group">
          <label>3. Sex</label>
          <div className="radio-group">
            <label>
              <input type="radio" value="Male" {...register('sex')} /> Male
            </label>
            <label>
              <input type="radio" value="Female" {...register('sex')} /> Female
            </label>
            <label>
              <input type="radio" value="Notperfer" {...register('sex')} /> Not Preferable
            </label>
          </div>
          <p className="error-message">{errors.sex?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="cnic">4. National ID Card No</label>
          <input id="cnic" {...register('cnic')} />
          <p className="error-message">{errors.cnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherName">5. Father Name</label>
          <input id="fatherName" {...register('fatherName')} />
          <p className="error-message">{errors.fatherName?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherCnic">Father's CNIC No</label>
          <input id="fatherCnic" {...register('fatherCnic')} />
          <p className="error-message">{errors.fatherCnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="familyIncome">6. Family Income</label>
          <input id="familyIncome" {...register('familyIncome')} />
        </div>
        <div className="form-group">
          <label htmlFor="domicile">7. Domicile</label>
          <input id="domicile" {...register('domicile')} />
        </div>
        <div className="form-group">
          <label htmlFor="phone">8. Phone Number</label>
          <input id="phone" {...register('phone')} />
          <p className="error-message">{errors.phone?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="email">9. Email</label>
          <input id="email" {...register('email')} />
          <p className="error-message">{errors.email?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="currentAddress">10. Current Address</label>
          <input id="currentAddress" {...register('currentAddress')} />
          <p className="error-message">{errors.currentAddress?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="permanentAddress">11. Permanent Address</label>
          <input id="permanentAddress" {...register('permanentAddress')} />
          <p className="error-message">{errors.permanentAddress?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="selfCnic">Self CNIC/Form-B</label>
          <input type="file" id="selfCnic" {...register('selfCnic')} />
          <p className="error-message">{errors.selfCnic?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="latestFees">Submit Latest Fees</label>
          <input type="file" id="latestFees" {...register('latestFees')} />
          <p className="error-message">{errors.latestFees?.message}</p>
        </div>
        <div className="form-group">
          <label htmlFor="fatherCnicImage">Father CNIC</label>
          <input type="file" id="fatherCnicImage" {...register('fatherCnicImage')} />
          <p className="error-message">{errors.fatherCnicImage?.message}</p>
        </div>
        <button type="submit">Submit</button>
      </form>

      
      <button onClick={() => setOpenBox(!openBox)}>Data transfer</button>
      {openBox && (
        <div>
          <form onSubmit={handleSubmitTransfer(transferData)}>
            <div className="form-group">
              <label htmlFor="nameTransfer">Name</label>
              <input id="nameTransfer" {...registerTransfer('nameTransfer')} />
              <p className="error-message">{transferErrors.nameTransfer?.message}</p>
            </div>
            <div className="form-group">
              <label htmlFor="cnicTransfer">National ID Card No</label>
              <input id="cnicTransfer" {...registerTransfer('cnicTransfer')} />
              <p className="error-message">{transferErrors.cnicTransfer?.message}</p>
            </div>
            <div className="form-group">
              <label htmlFor="emailTransfer">Email</label>
              <input id="emailTransfer" {...registerTransfer('emailTransfer')} />
              <p className="error-message">{transferErrors.emailTransfer?.message}</p>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </>
  );
};

export default PersonalDataForm;
