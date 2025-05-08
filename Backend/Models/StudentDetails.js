const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-document schema for monthly fee details
const FeeDetailSchema = new Schema({
    sno: { type: String, default: "0" },
    uploadedDate: { type: String, default: "" },
    latestFee: { type: String, default: "" },
    latestFeeImage: { type: String, default: "" }, // Base64-encoded image
    lastDate: { type: String, default: "" },
    feeInvoiceNo: { type: String, default: "" },
    status: { type: String, default: "pending" },
});

// Main student schema
const StudentSchema = new Schema({
    name: String,
    dobDay: Number,
    dobMonth: Number,
    dobYear: Number,
    sex: String,
    cnic: String,
    fatherName: String,
    fatherCnic: String,
    phone: String,
    email: { type: String, unique: true, required: true },
    currentAddress: String,
    permanentAddress: String,
    familyIncome: Number,
    domicile: String,
    selfCnic: String,
    latestFees: String,
    fatherCnicImage: String,
    profileImage: String,
    status: { type: String, default: "pending" },
    feeDetails: [FeeDetailSchema], // Embedding FeeDetailSchema as an array
});

const StudentDetail = mongoose.model("StudentsDetails", StudentSchema);

module.exports = StudentDetail;
