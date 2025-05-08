const mongoose = require("mongoose");

const { Schema } = mongoose;
const RequestSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Assuming donors are stored in the 'users' collection
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    photo: {
      type: String, // Store image URL or base64 string
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Assuming admins are stored in 'users' collection
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("requests", RequestSchema);
module.exports = Request;
