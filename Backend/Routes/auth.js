const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../Models/Student");
const Donor = require("../Models/Donor");
const Admin = require("../Models/Admin");
const fetchStudent = require("../Middleware/fetchStudent");
const fetchDonor = require("../Middleware/fetchDonor");
const fetchAdmin = require("../Middleware/fetchAdmin");
const Feedback = require("../Models/Feedback");
router.use(require('cookie-parser')());
require("dotenv").config({ path: "./.env" });

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'strict' };

// Student Routes
router.post("/create-student", [
  check("first_name", "Please enter a valid name").not().isEmpty(),
  check("last_name", "Please enter a valid name").not().isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").not().isEmpty(),
  check("phone_no", "Please enter a valid phone number").not().isEmpty(),
  check("cnic", "Please enter a valid CNIC").not().isEmpty(),
  check("institution", "Please enter a valid institution").not().isEmpty(),
  check("class_level", "Please enter a valid class").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { first_name, last_name, email, password, phone_no, cnic, institution, class_level } = req.body;
  try {
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ error: "Student with this email already exists" });
    }
    student = await Student.findOne({ phone_no });
    if (student) {
      return res.status(400).json({ error: "Student with this phone number already exists" });
    }
    student = await Student.findOne({ cnic });
    if (student) {
      return res.status(400).json({ error: "Student with this CNIC already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    student = await Student.create({
      first_name,
      last_name,
      email,
      password: hashPassword,
      phone_no,
      cnic,
      institution,
      class_level,
    });
    const data = { user: { id: student.id } };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.cookie('token', authToken, COOKIE_OPTIONS).json({ authToken });
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});
router.post("/login-student", [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const data = {
      user: {
        id: student.id, email: student.email, first_name: student.first_name, last_name: student.last_name, phone_no: student.phone_no, cnic: student.cnic, institution: student.institution, class_level: student.class_level,
        hasFilledApplication: student.hasFilledApplication || false,
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);

    res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ response: data, authToken, success: true });
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});


// Student Profile
router.get('/student/get-profile', fetchStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error getting student profile');
  }
});

router.put("/student/update-profile", fetchStudent, [
  check("first_name", "Please enter a valid name").not().isEmpty(),
  check("last_name", "Please enter a valid name").not().isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("phone_no", "Please enter a valid phone number").not().isEmpty(),
  check("cnic", "Please enter a valid CNIC").isLength({ min: 13 }),
  check("institution", "Please enter a valid institution").not().isEmpty(),
  check("class_level", "Please enter a valid class").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { first_name, last_name, email, phone_no, cnic, institution, class_level } = req.body;
    let student = await Student.findById(req.user.id);
    student.first_name = first_name;
    student.last_name = last_name;
    student.email = email;
    student.phone_no = phone_no;
    student.cnic = cnic;
    student.institution = institution;
    student.class_level = class_level;
    await student.save();
    success = true;
    res.json("Your profile has been updated successfully");
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});

// Donor Routes
router.post("/create-donor", [
  check("first_name", "Please enter a name").not().isEmpty(),
  check("last_name", "Please enter a name").not().isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").not().isEmpty(),
  check("phone_no", "Please enter a valid phone number").not().isEmpty(),
  check("cnic", "Please enter a valid CNIC").not().isEmpty(),
  check("profession", "Please enter a profession").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { first_name, last_name, email, password, phone_no, cnic, profession } = req.body;
  try {
    let donor = await Donor.findOne({ email });
    if (donor) {
      return res.status(400).json({ error: "Donor with this email already exists" });
    }
    donor = await Donor.findOne({ phone_no });
    if (donor) {
      return res.status(400).json({ error: "Donor with this phone number already exists" });
    }
    donor = await Donor.findOne({ cnic });
    if (donor) {
      return res.status(400).json({ error: "Donor with this CNIC already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    donor = await Donor.create({
      first_name,
      last_name,
      email,
      password: hashPassword,
      phone_no,
      cnic,
      profession,
    });
    const data = { user: { id: donor.id } };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.cookie('token', authToken, COOKIE_OPTIONS).json({ authToken });
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});

router.post("/login", [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  console.log(req.body); // It gives correct data
  try {
    const { email, password, role } = req.body; // Extracting email, password, and role from the request body

    // Find the user based on the email
    let user = await Donor.findOne({ email }) || await Student.findOne({ email }) || await Admin.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the role from frontend matches the role of the found user
    if (user instanceof Student && role !== "student") {
      return res.status(400).json({ error: "Role does not match" });
    }
    else if (user instanceof Donor && role !== "donor") {
      return res.status(400).json({ error: "Role does not match" });
    }
    else if (user instanceof Admin && role !== "admin") {
      return res.status(400).json({ error: "Role does not match" });
    }

    // Now check the password based on the matched user
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Prepare the user data to send in the response
    let data = {};
    if (user instanceof Student) {
      data = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_no: user.phone_no,
          cnic: user.cnic,
          institution: user.institution,
          class_level: user.class_level,
          hasFilledApplication: user.hasFilledApplication || false
        }
      };
    }
    else if (user instanceof Donor) {
      data = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_no: user.phone_no,
          cnic: user.cnic,
          profession: user.profession
        }
      };
    }
    else if (user instanceof Admin) {
      data = {
        user: {
          id: user.id
        }
      };
    }

    // Generate the JWT token
    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: '1h' });

    // Set the authToken in cookies
    res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'strict' });

    // Send the response with user data and authToken
    res.json({ response: data, authToken, success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

});
// Donor Profile
router.get("/donor/get-profile", async (req, res) => {
  try {
    // const donor = await Donor.findById(req.user.id).select("-password");
    const donor = await Donor.find();
    if (!donor) {
      return res.json("Donor not found");
    }
    res.json(donor);
  } catch (error) {
    res.status(500).send("Error getting donor profile");
  }
});

router.put("/donor/update-profile", fetchDonor, [
  check("first_name", "Please enter a name").not().isEmpty(),
  check("last_name", "Please enter a name").not().isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("phone_no", "Please enter a valid phone number").isLength({ min: 11 }),
  check("cnic", "Please enter a valid CNIC").isLength({ min: 13 }),
  check("profession", "Please enter a profession").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { first_name, last_name, email, phone_no, cnic, profession } = req.body;
    let donor = await Donor.findById(req.user.id);
    donor.first_name = first_name;
    donor.last_name = last_name;
    donor.email = email;
    donor.phone_no = phone_no;
    donor.cnic = cnic;
    donor.profession = profession;
    await donor.save();
    success = true;
    res.json("Your profile has been updated successfully");
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});

// Admin Routes
router.post("/create-admin", [
  check("first_name", "Please enter a name").not().isEmpty(),
  check("last_name", "Please enter a name").not().isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({ min: 6 }),
  check("admin_role", "Please enter an admin role").not().isEmpty(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { first_name, last_name, email, password, admin_role } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const full_name = `${first_name} ${last_name}`;
    admin = await Admin.create({
      full_name,
      email,
      password: hashPassword,
      admin_role,
    });
    const data = { user: { id: admin.id } };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.cookie('token', authToken, COOKIE_OPTIONS).json({ authToken });
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});

router.post("/login-admin", [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({ min: 6 }),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const data = { user: { id: admin.id } };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    console.log(success)
    res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ response: data, authToken, success: true });
  } catch (error) {
    res.status(500).send("Some error occurred");
  }
});

// Admin Profile
router.get("/admin/get-profile", fetchAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.json("Admin not found");
    }
    res.json(admin);
  } catch (error) {
    res.status(500).send("Error getting admin profile");
  }
});
router.post('/api/feedback', async (req, res) => { // Ensure this route matches your frontend URL
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).send('Feedback submitted successfully');
  } catch (error) {
    res.status(400).send('Error submitting feedback');
  }
});
router.get('/api/feedback', async (req, res) => { // Ensure this route matches your frontend URL
  try {
    const data = await Feedback.find();
    res.json(data);
  } catch (error) {
    res.status(400).send('Error not found feedback');
  }
});
// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
