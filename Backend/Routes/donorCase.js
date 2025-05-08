const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const fetchDonor = require("../Middleware/fetchDonor");
const Request = require("../Models/Request");
const Admin = require("../Models/Admin");
const Donor = require("../Models/Donor");
const ApprovedCase = require("../Models/ApprovedCase");
const WorksOn = require("../Models/WorksOn");
const Transaction = require("../Models/Transaction");

//show all verified cases to donor which are approved by admin whose date has been started but not ended

router.get(
  "/donor/all-approved-cases",
  fetchDonor,

  async (req, res) => {
    const currentDate = new Date();
    try {
      const approvedCases = await ApprovedCase.find({
        endDate: { $gt: currentDate },
        _id: { $nin: await WorksOn.distinct("approved_case") },
      }).populate("request");

      if (!approvedCases) {
        return res.json("No approved cases found");
      }
      res.json(approvedCases);
    } catch (error) {
      res.json("Error fetching approved cases");
    }
  }
);

//route to sponser case by donor

router.post(
  "/donor/sponser-case-by-donor/:id",
  fetchDonor,
  [body("commited_payments", "Enter the commited payments")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response = errors.array();
      console.log(response[0].msg);
      return res.status(400).json(response[0].msg);
    }
    try {
      const { commited_payments } = req.body;
      const req_case = await ApprovedCase.findById(req.params.id)
        .populate("request")
        .populate("student");
      let checkAlreadyCases = await WorksOn.findOne({
        approved_case: req.params.id,
      });
      if (checkAlreadyCases) {
        return res.json("This case has already been sponsored by someone");
      }
      if (
        req_case.payments_completed + commited_payments >
        req_case.total_payments
      ) {
        return res.json("You are trying to pay more than the total payments");
      }
      let sponsered_case = await WorksOn.create({
        donor: req.user.id,
        approved_case: req.params.id,
        commited_payments: commited_payments,
        completed_payments: 0,
      });
      let donor = await Donor.findById(req.user.id);
      await Notifications.create({
        user: req.user.id,
        type: "donor",
        message: "You Case has been sponsered successfully ",
      });
      await Notifications.create({
        user: req_case.request.student,
        type: "student",
        message: "Case has been sponsered successfully by " + donor.name,
      });
      await Notifications.create({
        user: req_case.admin,
        type: "admin",
        message: "Case has been sponsered successfully by " + donor.name,
      });
      return res.json("Case has been sponsered successfully");
    } catch {
      return res.json("Error sponsering case");
    }
  }
);

//route to show all cases sponsered by donor

router.get("/donor/sponsered-cases", fetchDonor, async (req, res) => {
  try {
    const sponseredCases = await WorksOn.find({ donor: req.user.id })
      .populate("approved_case")
      .populate("request");

    res.json(sponseredCases);
  } catch (error) {
    res.json("Error fetching sponsered cases");
  }
});

//route to show all cases completed by donor
router.get("/donor/completed-cases", fetchDonor, async (req, res) => {
  try {
    const completedCases = await WorksOn.find({
      donor: req.user.id,
      commited_payments: { $eq: "$completed_payments" },
    })
      .populate("approved_case")
      .populate("request");

    res.json(completedCases);
  } catch (error) {
    res.json("Error fetching completed cases");
    console.log(error);
  }
});

//route to show all cases in progress by donor

router.get("/donor/in-progress-cases", fetchDonor, async (req, res) => {
  try {
    const cases = await WorksOn.find({
      donor: req.user.id,
      committed_payments: { $lt: "$completed_payments" },
    });

    return res.json(cases);
  } catch (error) {
    console.log(error);
    return res.json("Error loading cases");
  }
});

// view case by donor the
router.get("/donor/view-case/:id", fetchDonor, async (req, res) => {
  try {
    const case_view = await ApprovedCase.findById(req.params.id);
    if (!case_view) {
      return res.json("No case to view");
    }
    return res.json(case_view);
  } catch (error) {
    console.log(error);
    return res.json("Error loading case");
  }
});

//view student profile  by clicking on case
router.get(
  "/donor/sponsered-student-profile/:id",
  fetchDonor,
  async (req, res) => {
    try {
      const workson = await WorksOn.find({
        approved_case: req.params.id,
        donor: req.user.id,
      });
      if (!workson) {
        return res.json("You have not sponsered this case");
      }
      const case_sponsered = await ApprovedCase.findById(req.params.id)
        .populate("request")
        .populate("student")
        .select("-password");

      return res.json(case_sponsered.request.student);
    } catch (error) {
      console.log(error);
      res.json("Error in viewing user profile");
    }
  }
);

//do a payment for case by donor here id is of specific case which donor has sponsered
router.post("/donor/pay_sponsered_case/:id", fetchDonor, async (req, res) => {
  try {
    const workson = await WorksOn.findOne({
      approved_case: req.params.id,
      donor: req.user.id,
    })
      .populate("approved_case")
      .populate("request");
    if (!workson) {
      return res.json("You have not sponsered this case");
    }
    if (workson.commited_payments === workson.completed_payments) {
      return res.json("You have already paid the total payments");
    }

    const transaction = await Transaction.create({
      donor: req.user.id,
      approved_case: req.params.id,
      payment_no: workson.completed_payments + 1,
      status: "completed",
    });
    workson.completed_payments = workson.completed_payments + 1;
    await workson.save();

    await Notifications.create({
      user: req.user.id,
      type: "donor",
      message: `Payment done successfully for case ${workson.approved_case.request.title}`,
    });
    await Notifications.create({
      user: workson.approved_case.request.student,
      type: "user",
      message: `Payment done successfully for your case ${workson.approved_case.request.title}`,
    });
    return res.json("Payment done successfully");
  } catch (error) {
    console.log(error);
    return res.json("Error in payment");
  }
});

router.post("/submit-proof", async (req, res) => {
  try {
    const { studentId, donorId, photo, title, description } = req.body;

    // Validate required fields
    if (!studentId || !donorId || !photo || !title || !description) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: {
          studentId: !studentId ? "studentId is required" : undefined,
          donorId: !donorId ? "donorId is required" : undefined,
          photo: !photo ? "photo is required" : undefined,
          title: !title ? "title is required" : undefined,
          description: !description ? "description is required" : undefined,
        },
      });
    }

    // Ensure correct data types
    if (typeof studentId !== "string" || typeof donorId !== "string" || typeof photo !== "string" || typeof title !== "string" || typeof description !== "string") {
      return res.status(400).json({
        message: "Invalid data types",
        expectedTypes: {
          studentId: "string",
          donorId: "string",
          photo: "string",
          title: "string",
          description: "string",
        },
      });
    }

    const newRequest = new Request({
      student: studentId,
      donor: donorId,
      photo,
      title,
      description,
      status: "Pending",
    });

    await newRequest.save();

    // Notify Admin (Here, you would integrate a notification system)
    console.log("Admin notified of new payment proof request");

    res.status(201).json({ message: "Payment proof submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
