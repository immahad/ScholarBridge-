const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        });
        console.log("OTP sent successfully.");
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};

module.exports = sendOTP;
