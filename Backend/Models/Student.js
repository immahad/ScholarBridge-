const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_no: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  class_level: {
    type: String,
    required: true,
  },
  hasFilledApplication : {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "pending",
  },
  
});

const Student = mongoose.model("students", StudentSchema);

module.exports = Student;
