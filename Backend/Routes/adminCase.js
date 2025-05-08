const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const fetchStudent = require("../Middleware/fetchStudent");
const fetchAdmin = require("../Middleware/fetchAdmin");
const Request = require("../Models/Request");
const Admin = require("../Models/Admin");
const ApprovedCase = require("../Models/ApprovedCase");
const {createNotification,Notifications} = require("../Models/Notifications");
const Student = require("../Models/Student");
const Donor = require("../Models/Donor");
const WorksOn = require("../Models/WorksOn");
const StudentDetail=require('../Models/StudentDetails')
const nodemailer = require("nodemailer");
const { getUsers, createUser, updateUser, deleteUser } = require("../Controllers/userControllers");
const multer = require("multer");
const path = require("path");

router.post("/mailing", async (req, res) => {
  const { email, subject, message } = req.body; // Extract email, subject, and message from request body

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject, // Set subject from request body
      html: `<h1>${message}</h1>` // Set message from request body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error", error);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        res.status(201).json({ status: 201, message: "Email sent successfully" });
      }
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//route to approve case by admin
router.put("/approve-proof/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminEmail, studentEmail, donorEmail, paymentProof, title } = req.body;

    // First, verify the original request exists
    const originalRequest = await Request.findById(requestId);
    if (!originalRequest) {
      return res.status(404).json({
        message: "Original request not found",
        requestId
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!adminEmail) missingFields.push('adminEmail');
    if (!studentEmail) missingFields.push('studentEmail');
    if (!donorEmail) missingFields.push('donorEmail');
    if (!paymentProof) missingFields.push('paymentProof');
    if (!title) missingFields.push('title');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields,
        received: req.body
      });
    }

    // Create and save new approved case
    const approvedCase = new ApprovedCase({
      studentEmail,
      donorEmail,
      adminEmail,
      paymentProof,
      description: title,
      approvedDate: new Date(),
      status: 'Approved'
    });

    // Save the case
    const savedCase = await approvedCase.save();
    
    if (!savedCase) {
      throw new Error('Failed to save approved case');
    }

    // Fetch the student details and update the status of the specific fee detail
    const student = await StudentDetail.findOne({ email: studentEmail });
    if (!student) {
      // Rollback if student not found
      await ApprovedCase.findByIdAndDelete(savedCase._id);
      await Request.create(originalRequest);
      throw new Error('Student not found');
    }

    const feeDetail = student.feeDetails.find(fee => fee.latestFee === title && fee.status === 'pending');
    if (!feeDetail) {
      // Rollback if fee detail not found or not pending
      await ApprovedCase.findByIdAndDelete(savedCase._id);
      await Request.create(originalRequest);
      throw new Error('Pending fee detail not found with the given title');
    }

    feeDetail.status = 'Approved';
    await student.save();

    await createNotification(adminEmail, "Case Approved", `The case with title "${title}" has been approved.`);
    await createNotification(studentEmail, "Case Approved", `Your case with title "${title}" has been approved.`);
    await createNotification(donorEmail, "Case Approved", `The case with title "${title}" has been approved.`);

    res.status(200).json({
      message: "Payment proof verified successfully",
      approvedCase: savedCase,
      student: student
    });
    console.log('Approved case saved:', savedCase);
    console.log('Student fee detail status updated:', feeDetail);
    // Delete original request only after successful save
    const deletedRequest = await Request.findByIdAndDelete(requestId);
    if (!deletedRequest) {
      // Rollback if delete fails
      await ApprovedCase.findByIdAndDelete(savedCase._id);
      throw new Error('Failed to delete original request');
    }

  } catch (error) {
    console.error('Error in approve-proof:', error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message
    });
  }
});
// route to get all the case requested by students to approve
router.get("/admin/get-all-requested-cases", fetchAdmin, async (req, res) => {
  try {
    let requests = await Request.find({ status: "pending" });
    res.json(requests);
  } catch (error) {
    console.log(error);
    res.json("Error fetching requests");
  }
});

//route to all cases approved by admin

router.get("/admin/get-all-approved-cases",  async (req, res) => {
  try {
    let approved_cases = await ApprovedCase.find();
    res.json(approved_cases);
    1;
  } catch (error) {
    res.json("Error fetching approved cases");
  }
});

// route to get all cases completed by donors
router.get("/admin/get-all-completed-cases", fetchAdmin, async (req, res) => {
  try {
    let completed_cases = await ApprovedCase.find({
      payments_completed: { $eq: "$total_payments" },
    });
    res.json(completed_cases);
  } catch (error) {
    res.json("Error fetching completed cases");
  }
});

// route to get all cases in progress
router.get("/admin/get-all-current-cases", fetchAdmin, async (req, res) => {
  const currentDate = new Date();
  try {
    let current_cases = await ApprovedCase.find({
      endDate: { $gt: currentDate },
    });
    res.json(current_cases);
  } catch (error) {
    res.json("Error fetching current cases");
  }
});

// route to get all past cases
router.get("/admin/get-all-past-cases", fetchAdmin, async (req, res) => {
  const currentDate = new Date();
  try {
    let past_cases = await ApprovedCase.find({
      endDate: { $lt: currentDate },
    });
    res.json(past_cases);
  } catch (error) {
    res.json("Error fetching past cases");
  }
});

// route to get all students
router.get("/admin/get-all-students", fetchAdmin, async (req, res) => {
  try {
    let students = await Student.find();
    res.json(students);
  } catch (error) {
    res.json("Error fetching students");
  }
});

// route to get all donors
//fetchAdmin
router.get("/admin/get-all-donors", async (req, res) => {
  try {
    let donors = await Donor.find();
    res.json(donors);
  } catch (error) {
    res.json("Error fetching donors");
  }
});



;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use donor name (or default) to build a folder path
    const donorName = req.body.name || 'default';
    const uploadDir = path.join(__dirname, '..', 'upload', donorName);
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

router.put('/admin/get-all-donors/:id', upload.single('profileimage'), async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // If an image is uploaded, set the profileimage field
  if (req.file) {
    updatedData.profileimage = path.join('upload', req.body.name, req.file.filename);
  }

  try {
    const donor = await Donor.findByIdAndUpdate(id, updatedData, { new: true });
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    await createNotification(donor.email, "Profile Updated", "Your profile has been successfully updated.");
    res.json(donor);
  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({ message: 'Error updating donor' });
  }
});



// route to view details of requested case by student
router.get(
  "/admin/requested-case-details/:id",
  fetchAdmin,
  async (req, res) => {
    try {
      const request = await Request.findById(req.params.id);
      if (!request) {
        return res.json("No case found");
      }
      return res.json(request);
    } catch (error) {
      res.json("Error viewing case");
    }
  }
);

// route to view student profile by clicking on requested case
router.get(
  "/admin/requested-case-student-profile/:id",
  fetchAdmin,
  async (req, res) => {
    try {
      const request = await Request.findById(req.params.id).populate("student");
      if (!request) {
        return res.json("No student profile found");
      }
      return res.json(request.student);
    } catch (error) {
      res.json("Error viewing student profile");
    }
  }
);

// route to view donor profile by clicking on approved case
router.get("/admin/approved-case-donor-profile", fetchAdmin, async (req, res) => {
  try {
    const approvedCase = await WorksOn.findById(req.params.id);
    const donor = await Donor.find({ donor: approvedCase.donor });
    const request = await Request.find
  } catch (error) {
    res.json("Error viewing donor profile");
  }
});

// route to view student profile by clicking on approved case
router.get("/admin/approved-case-student-profile/:id", fetchAdmin, async (req, res) => {
  try {
    const approvedCase = await ApprovedCase.findById(req.params.id);
    if (!approvedCase) {
      return res.json("No approved case found");
    }
    const request = await Request.find({ request: approvedCase.request });
    if (!request) {
      return res.json("No student profile found");
    }
    const student = await Student.findOne({ student: request.student });
    if (!student) {
      return res.json("No student profile found");
    }
    return res.json(student);
  } catch (error) {
    res.json("Error viewing student profile");
  }
});


router.post(
  "/admin/assign-student/:donorId",
  [body("studentEmail", "Enter a valid student email").isEmail()], // Validate email
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = errors.array();
      console.log(response[0].msg);
      return res.status(400).json(response[0].msg);
    }

    try {
      const { studentEmail } = req.body; // Get student email from request body
      const { donorId } = req.params;

      // Check if the donor exists
      const donor = await Donor.findById(donorId);
      if (!donor) {
        return res.status(404).json("Donor not found");
      }

      // Fetch the student using the provided email
      const student = await Student.findOne({ email: studentEmail });
      if (!student) {
        return res.status(404).json("Student not found with the provided email");
      }

      // Check if the student is already assigned to the donor
      const isStudentAssigned = donor.students.some(
        (studentDetail) => studentDetail.studentId.toString() === student._id.toString()
      );

      if (isStudentAssigned) {
        return res.status(400).json("Student is already assigned to this donor");
      }

      // Assign the student to the donor
      donor.students.push({
        studentId: student._id,
        studentEmail: student.email,
      });
      await donor.save();

      // Send notifications
      await createNotification(donor.email, "Student Assigned", `A new student with email ${student.email} has been assigned to you.`);
      await createNotification(student.email, "Assigned to Donor", `You have been assigned to a donor with email ${donor.email}.`);

      return res.json("Student assigned to donor successfully");
    } catch (error) {
      console.log(error);
      return res.status(500).json("Error assigning student to donor");
    }
  }
);

router.get("/admin/all-requests", async (req, res) => {
  try {
    const requests = await Request.find();

   
    if (!requests.length) {
      return res.status(200).json({ message: "No requests found", data: [] });
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get-all-notifications",  async (req, res) => {
  try {
    const notifications = await Notifications.find();
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/mark-notification-viewed/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notifications.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.viewed = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as viewed" });
  } catch (error) {
    console.error("Error marking notification as viewed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/admin/total-information",  async (req, res) => {
  try {
    // Fetch approved cases
    const approvedCases = await ApprovedCase.find();

    // Fetch requests
    const requests = await Request.find();

    // Fetch donors
    const donors = await Donor.find();

    // Fetch students
    const students = await Student.find();
    console.log('Total Approved Cases:', approvedCases.length);
    console.log('Total Requests:', requests.length);
    console.log('Total Donors:', donors.length);
    console.log('Total Students:', students
    .length);
    // Calculate total payments from approved cases
    const totalPayments = approvedCases.reduce((total, approvedCase) => {
      const payment = parseFloat(approvedCase.description.match(/\d+/g)?.join('') || 0);
      return total + payment;
    }, 0);
    console.log('Total Payments:', totalPayments);
    // Aggregate the data
    const totalInformation = {
      totalApprovedCases: approvedCases.length,
      totalRequests: requests.length,
      totalDonors: donors.length,
      totalStudents: students.length,
      totalPayments: totalPayments
    };

    res.status(200).json(totalInformation);
  } catch (error) {
    console.error("Error fetching total information:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get('student_profile/', getUsers);
router.post('student_profile/', createUser);
router.put('student_profile/:id', updateUser);
router.delete('student_profile/:id', deleteUser);

module.exports = router;