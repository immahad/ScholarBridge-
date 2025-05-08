const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const fetchStudent = require("../Middleware/fetchStudent");
const multer = require("multer");
const Request = require("../Models/Request");
const Student = require("../Models/Student");
const Notifications = require("../Models/Notifications");
const ApprovedCase = require("../Models/ApprovedCase"); 
const StudentDetail = require("../Models/StudentDetails");
const AcceptedStudetDetail = require('../Models/AcceptedStudent');


const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `./upload/${req.body.name}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
//fetchstudent
router.post('/upload-personal-data', fetchStudent, async (req, res) => {
  try {
    const { body } = req;
    console.log('Body:', body);

    // Validate required fields
    if (!body.profileImage || !body.selfCnic || !body.latestFees || !body.fatherCnicImage) {
      return res.status(400).json({ error: 'All image uploads are required' });
    }

    const newPersonalData = new StudentDetail({
      name: body.name,
      dobDay: body.dobDay,
      dobMonth: body.dobMonth,
      dobYear: body.dobYear,
      sex: body.sex,
      cnic: body.cnic,
      fatherName: body.fatherName,
      fatherCnic: body.fatherCnic,
      phone: body.phone,
      email: body.email,
      currentAddress: body.currentAddress,
      permanentAddress: body.permanentAddress,
      familyIncome: body.familyIncome,
      domicile: body.domicile,
      selfCnic: body.selfCnic, // Now Base64
      latestFees: body.latestFees, // Now Base64
      fatherCnicImage: body.fatherCnicImage, // Now Base64
      profileImage: body.profileImage, // Now Base64
    });

    try {
      const studentId = req.user.id;
      let student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      const studentData = {
        selfCnic: req.body.selfCnic?.toString() || "",
        latestFees: req.body.latestFees?.toString() || "",
        fatherCnicImage: req.body.fatherCnicImage?.toString() || "",
        profileImage: req.body.profileImage?.toString() || "",
      };
      
      console.log("Formatted Data Before Saving:", studentData);
      
      student.hasFilledApplication = true;
      await student.save();
      await newPersonalData.save();

      res.json({ status: 'ok', message: 'Form data saved successfully',hasFilledApplication: student.hasFilledApplication  });
    } catch (saveError) {
      console.error('Error updating student or saving form data:', saveError);
      res.status(500).json({ error: 'An error occurred while saving' });
    }
  } catch (err) {
    console.error('Error saving personal data', err);
    res.status(500).json({ error: 'Error saving personal data' });
  }
});


router.put('/upload-personal-data/:id', upload.fields([
  { name: 'profileImage', maxCount: 1 },
]), async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // If an image is uploaded, set the profileimage field
  if (req.file) {
    updatedData.profileimage = path.join('upload', req.body.name, req.file.filename);
  }

  try {
    const student = await StudentDetail.findByIdAndUpdate(id, updatedData, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
});
router.post('/accepted-student-list', async (req, res) => {
  try {
    const { body } = req;

    console.log('accepted body list:', body);

    const newPersonalData = new AcceptedStudetDetail({
      name: body.name,
      dobDay: body.dobDay,
      dobMonth: body.dobMonth,
      dobYear: body.dobYear,
      sex: body.sex,
      cnic: body.cnic,
      fatherName: body.fatherName,
      fatherCnic: body.fatherCnic,
      phone: body.phone,
      email: body.email,
      currentAddress: body.currentAddress,
      permanentAddress: body.permanentAddress,
      familyIncome: body.familyIncome,
      domicile: body.domicile,
      selfCnic: body.selfCnic,
      latestFees: body.latestFees,
      fatherCnicImage: body.fatherCnicImage,
      profileImage: body.profileImage,
      status: "Accepted"
    });


    try {

      await newPersonalData.save();

      res.json({ status: 'ok', message: 'Form data saved successfully' });
    } catch (saveError) {
      console.error('Error updating student or saving form data:', saveError);
      res.status(500).json({ error: 'An error occurred while saving' });
    }
  } catch (err) {
    console.error('Error saving personal data', err);
    res.status(500).json({ error: 'Error saving personal data' });
  }
});
//multer to upload images

router.post(
  "/student/request_by_student",
  fetchStudent,
  // [body("description", "Enter descriptionm of your case")],
  // upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = errors.array();
      console.log(response[0].msg);
      return res.status(400).json(response[0].msg);
    }
    try {
      // const imageName = req.file.filename;
      const { title, description } = req.body;
      let request_by_student = await Request.create({
        student: req.user.id,
        status: "pending",
        // photo: imageName,
        title: title,
        description: description,
      });
      console.log(request_by_student);
      if (!request_by_student) {
        return res.json("Error sending request");
      }
      await Notifications.create({
        user: req.user.id,
        type: "student",
        message: "Case Request has been sent successfully",
      });
      res.json("Case Request has been sent successfully");
    } catch (error) {
      res.json("Error sending request");
    }
  }
);

// get all request of student
router.get(
  "/student/get_all_requests_by_student",
  // fetchStudent,
  async (req, res) => {
    try {
      const requests = await StudentDetail.find();
      res.json(requests);
    } catch (error) {
      console.log(error);
      return res.json("Error fetching requests");
    }
  }
);
router.put('/student/get_all_requests_by_student/:id', async (req, res) => {
  const { id } = req.params;
  let updatedData = req.body;

  // Remove the _id field from the updated data to avoid trying to modify it
  delete updatedData._id;

  try {
    // Step 1: Find the student by ID to get the email
    const student = await StudentDetail.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Step 2: Find the StudentDetail by email
    const studentDetail = await StudentDetail.findOne({ email: student.email });
    if (!studentDetail) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    // Step 3: Update the StudentDetail record with the new data
    const updatedStudentDetail = await StudentDetail.findByIdAndUpdate(studentDetail._id, updatedData, { new: true });
    if (!updatedStudentDetail) {
      return res.status(404).json({ message: 'Error updating student details' });
    }

    // Step 4: Return the updated student details
    res.json(updatedStudentDetail);
  } catch (error) {
    console.error('Error updating student details:', error);
    res.status(500).json({ message: 'Error updating student details' });
  }
});



// get all current approved cases of student
router.get("/student/approved-cases", fetchStudent, async (req, res) => {
  const currentDate = new Date();
  try {
    const approved_cases = await ApprovedCase.find({
      student: req.user.id,
      endDate: { $gt: currentDate },
    }).populate("request");
    if (!approved_cases) {
      return res.json("No approved cases found");
    }
    res.json(approved_cases);
  } catch (error) {
    res.json("Error fetching approved cases");
  }
});

// route to get complted approbved cses by student
router.get("/student/completed-cases", fetchStudent, async (req, res) => {
  const currentDate = new Date();
  try {
    const approved_cases = await ApprovedCase.find({
      student: req.user.id,
      endDate: { $lt: currentDate },
    }).populate("request");
    if (!approved_cases) {
      return res.json("No approved cases found");
    }
    res.json(approved_cases);
  } catch (error) {
    res.json("Error fetching approved cases");
  }
});

// route to get all notifications of student
router.get("/student/notifications", fetchStudent, async (req, res) => {
  try {
    const notifications = await Notifications.find({ user: req.user.id });
    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.json("Error fetching notifications");
  }
});

router.get("/student/view-application/:id", fetchStudent, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.json("No application found");
    }
    res.json(request);
  } catch (error) {
    console.log(error);
    res.json("Error fetching application");
  }
});

router.get("/student/view-case/:id", async (req, res) => {
  try {
    let approvedCase = await ApprovedCase.findById(req.params.id).populate(
      "request"
    );
    res.json(approvedCase);
  } catch (error) {
    console.log(error);
    return res.json("Error fetching requests");
  }
});


const getStudentByEmail = async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send("Email query parameter is required.");
  }
  try {
    const student = await StudentDetail.findOne({ email });
    if (!student) {
      return res.status(404).send("Student not found.");
    }
    req.student = student;
    next();
  } catch (error) {
    res.status(500).send("Server error.");
  }
};

// Get fee details for a student by email
router.get("/feeDetails", getStudentByEmail, (req, res) => {
  res.json(req.student.feeDetails);
});

// Update fee details for a student by email
router.put("/feeDetails", getStudentByEmail, async (req, res) => {
  const updatedFeeDetails = req.body.feeDetails;
  if (!Array.isArray(updatedFeeDetails)) {
    return res.status(400).send("feeDetails should be an array.");
  }

  try {
    req.student.feeDetails = updatedFeeDetails;
    await req.student.save();
    res.json(req.student.feeDetails);
  } catch (error) {
    res.status(500).send("Server error.");
  }
});

// Endpoint to add a new fee detail
router.post('/uploadedFees', getStudentByEmail, upload.fields([
  { name: 'latestFees', maxCount: 1 },
]), async (req, res) => {
  const newFeeDetail = req.body;
  console.log('New fee detail:', newFeeDetail);
  console.log('Student:', req.student);
  console.log('Student fee details:', req.student.feeDetails);
  try {
    if (!req.student.feeDetails) {
      req.student.feeDetails = [];
    }
    req.student.feeDetails.push(newFeeDetail);
    await req.student.save(); // Ensure the document is saved
    res.status(201).json(req.student.feeDetails);
  } catch (error) {
    console.error('Error saving new fee detail:', error);
    res.status(500).json({ message: 'Error saving new fee detail.', error });
  }
});

module.exports = router;
