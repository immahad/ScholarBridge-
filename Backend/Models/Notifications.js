const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  email: {
    // may be admin or student or donor
    type: String,
    required: true,
  },
  subject: {
    type: String, // here type will tell notification to admin user or student to tell which is the person
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
});

const Notifications = mongoose.model("Notifications", NotificationSchema);

const createNotification = async (email, subject, message) => {
  try {
    const notification = new Notifications({
      email,
      subject,
      message,
    });
    await notification.save();
    console.log("Notification saved:", notification);
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};

module.exports = { Notifications, createNotification };