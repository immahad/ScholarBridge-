const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudentDetailSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "StudentDetail" },
  studentEmail: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now }
});

const DonorSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  gender: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String, default: "" },
  religion: { type: String, default: "" },
  phone_no: { type: String, required: true },
  cnic: { type: String, required: true },
  profession: { type: String, required: true },
  office: { type: String, default: "" },
  address: { type: String, default: "" },
  profileimage: { type: String, default: "" },
  additional_info: { type: Schema.Types.Mixed, default: {} },
  students: [StudentDetailSchema] // Array of student details
});

const Donor = mongoose.model("Donor", DonorSchema);
module.exports = Donor;
