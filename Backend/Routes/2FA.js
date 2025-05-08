// Routes/2FA.js
const express = require("express");
const sendOTP = require("../utils/mailer");  // Ensure the path is correct, based on where your sendOTP.js is located
const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const otp = generateOTP();
    try {
        await sendOTP(email, otp);  // Send OTP email
        res.status(200).json({ message: "OTP sent successfully", otp });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

module.exports = router;
