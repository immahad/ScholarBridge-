import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useMutation } from "react-query";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../../api/Systemapi";
import { Loader2, Upload } from "lucide-react";

// Updated schema with file validation
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  dobDay: yup
    .number()
    .required("Day is required")
    .min(1, "Day must be at least 1")
    .max(31, "Day cannot exceed 31"),
  dobMonth: yup
    .number()
    .required("Month is required")
    .min(1, "Month must be at least 1")
    .max(12, "Month cannot exceed 12"),
  dobYear: yup
    .number()
    .required("Year is required")
    .min(1900, "Year must be at least 1900")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  sex: yup.string().required("Sex is required"),
  cnic: yup.string().required("CNIC number is required"),
  fatherName: yup.string().required("Father's name is required"),
  fatherCnic: yup.string().required("Father's CNIC number is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  currentAddress: yup.string().required("Current address is required"),
  permanentAddress: yup.string().required("Permanent address is required"),
  familyIncome: yup
    .number()
    .required("Family income is required")
    .typeError("Family income must be a number"),
  domicile: yup.string().required("Domicile is required"),
  selfCnic: yup.mixed().required("Self CNIC/Form-B image is required"),
  latestFees: yup.mixed().required("Latest fees image is required"),
  fatherCnicImage: yup.mixed().required("Father CNIC image is required"),
  profileImage: yup.mixed().required("Profile image is required"),
});
const FileUpload = ({ id, name, label, register, setValue, accept = "*", errors }) => {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      // This is the key line - properly set the file in the form state
      setValue(id, files);
      console.log(`Setting ${id} with files:`, files);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <label
        htmlFor={id}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
      >
        <Upload className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium">{fileName || "Click to upload"}</span>
      </label>
      <input
        type="file"
        id={id}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id].message}</p>}
    </div>
  );
};


const PersonalDataForm = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const userData = useSelector((state) => state.student.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      cnic: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (userData) {
      setValue("name", `${userData.first_name} ${userData.last_name}`);
      setValue("cnic", userData.cnic);
      setValue("phone", userData.phone_no);
      setValue("email", userData.email);
    }
  }, [userData, setValue]);

  const mutation = useMutation(async (data) => {
    try {
      setIsLoading(true);
  
      // Create a FormData object
      const formData = new FormData();
  
      // Add text fields to FormData
      formData.append("name", data.name);
      formData.append("dobDay", data.dobDay);
      formData.append("dobMonth", data.dobMonth);
      formData.append("dobYear", data.dobYear);
      formData.append("sex", data.sex);
      formData.append("cnic", data.cnic);
      formData.append("fatherName", data.fatherName);
      formData.append("fatherCnic", data.fatherCnic);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      formData.append("currentAddress", data.currentAddress);
      formData.append("permanentAddress", data.permanentAddress);
      formData.append("familyIncome", data.familyIncome);
      formData.append("domicile", data.domicile);
  
      // Function to convert file to base64
      const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };
      console.log("Data hamara ye hai 1:", data);
      // Add files to FormData as base64 strings
      if (data.profileImage && data.profileImage[0]) {
        const base64ProfileImage = await convertToBase64(data.profileImage[0]);
        formData.append("profileImage", base64ProfileImage);
      }
      if (data.selfCnic && data.selfCnic[0]) {
        const selfCnic = await convertToBase64(data.selfCnic[0]);
        formData.append("selfCnic", selfCnic);
        console.log("Self CNIC:", selfCnic);
      }
      if (data.latestFees && data.latestFees[0]) {
        const latestFees = await convertToBase64(data.latestFees[0]);
        formData.append("latestFees", latestFees);
        console.log("Latest Fees:", latestFees);
      }
      if (data.fatherCnicImage && data.fatherCnicImage[0]) {
        const fatherCnicImage = await convertToBase64(data.fatherCnicImage[0]);
        formData.append("fatherCnicImage", fatherCnicImage);
      }
  
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:3333/ifl_system/studentCase/upload-personal-data",
        formData,
        {
          headers: {
            "Content-Type": "application/json", // 👈 Must match request type
            authToken: authToken,
          },
        }
      );
  
      console.log("Form submission response:", response.data);
      localStorage.setItem("hasFilledApplication",response.data.hasFilledApplication);
      return response.data;
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  });
  
  // ...existing code...

  const onSubmit = (data) => {
    const confirmSubmission = window.confirm(
      "Are you sure? Once you submit the form you can't edit it."
    );
    if (confirmSubmission) {
      mutation.mutate(data, {
        onSuccess: (response) => {
          setShowSuccessMessage(true);
          alert(response);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        },
        onError: (error) => {
          alert("Failed to submit form: " + (error.response?.data || error.message));
        }
      });
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL);
    }
  };

  const watchedProfileImage = watch("profileImage");

  useEffect(() => {
    if (watchedProfileImage && watchedProfileImage[0]) {
      const file = watchedProfileImage[0];
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL);
      
      return () => URL.revokeObjectURL(imageURL);
    }
  }, [watchedProfileImage]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Submitting your form...
            </h2>
            <p className="text-gray-600 text-center">
              Please wait a moment while we process your information.
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">
              Success!
            </h2>
            <p className="text-gray-600 text-center">
              Your form has been submitted successfully.
            </p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Header Section */}
        <div className="font-bold text-lg rounded-md bg-gradient-to-r from-blue-700 to-blue-400 shadow-lg hover:shadow-xl transition-all rounded-t-2xl p-6">
          <h1 className="text-2xl font-bold text-white">
            Student Registration Form
          </h1>
          <p className="text-blue-100 mt-2">
            Please fill in all the required information
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {/* Top Section with Photo */}
          <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="text-center p-4">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-1">Upload Photo</p>
                </div>
              )}
            </div>
            <label
              htmlFor="profileImage"
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer inline-block"
            >
              Choose File
              <input
                type="file"
                id="profileImage"
                className="hidden"
                accept="image/*"
                {...register("profileImage")}
              />
            </label>
            {errors.profileImage && (
              <p className="mt-1 text-sm text-red-600">{errors.profileImage.message}</p>
            )}
          </div>

          {/* Personal Information Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  {...register("name")}
                  readOnly
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="DD"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("dobDay")}
                    />
                    {errors.dobDay && (
                      <p className="mt-1 text-sm text-red-600">{errors.dobDay.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="MM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("dobMonth")}
                    />
                    {errors.dobMonth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dobMonth.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="YYYY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      {...register("dobYear")}
                    />
                    {errors.dobYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.dobYear.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  id="sex"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("sex")}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && (
                  <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">
                  CNIC/Form-B No.
                </label>
                <input
                  id="cnic"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  {...register("cnic")}
                  readOnly
                />
                {errors.cnic && (
                  <p className="mt-1 text-sm text-red-600">{errors.cnic.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <input
                  id="fatherName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("fatherName")}
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fatherName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fatherCnic" className="block text-sm font-medium text-gray-700 mb-1">
                  Father's CNIC No.
                </label>
                <input
                  id="fatherCnic"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("fatherCnic")}
                />
                {errors.fatherCnic && (
                  <p className="mt-1 text-sm text-red-600">{errors.fatherCnic.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone No.
                </label>
                <input
                  id="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  {...register("phone")}
                  readOnly
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  {...register("email")}
                  readOnly
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address
                </label>
                <textarea
                  id="currentAddress"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  {...register("currentAddress")}
                ></textarea>
                {errors.currentAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address
                </label>
                <textarea
                  id="permanentAddress"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  {...register("permanentAddress")}
                ></textarea>
                {errors.permanentAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="familyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Family Income
                </label>
                <input
                  id="familyIncome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("familyIncome")}
                />
                {errors.familyIncome && (
                  <p className="mt-1 text-sm text-red-600">{errors.familyIncome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="domicile" className="block text-sm font-medium text-gray-700 mb-1">
                  Domicile
                </label>
                <input
                  id="domicile"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register("domicile")}
                />
                {errors.domicile && (
                  <p className="mt-1 text-sm text-red-600">{errors.domicile.message}</p>
                )}
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Required Documents
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                <FileUpload
                  id="selfCnic"
                  name="selfCnic"
                  label="CNIC/Form-B"
                  register={register}
                  setValue={setValue} 
                  accept="image/*,application/pdf"
                  errors={errors}
                />
                <FileUpload
                  id="latestFees"
                  name="latestFees"
                  label="Latest Fees Receipt"
                  register={register}
                  setValue={setValue} 
                  accept="image/*,application/pdf"
                  errors={errors}
                />
                <FileUpload
                  id="fatherCnicImage"
                  name="fatherCnicImage"
                  label="Father's CNIC"
                  register={register}
                  setValue={setValue} 
                  accept="image/*,application/pdf"
                  errors={errors}
                />

                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading || mutation.isLoading}
            >
              {isLoading || mutation.isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Submitting...
                </span>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDataForm;
