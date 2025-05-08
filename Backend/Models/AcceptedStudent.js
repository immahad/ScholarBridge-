const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new Schema({
    name: String,
    dobDay: Number,
    dobMonth: Number,
    dobYear: Number,
    sex: String,
    cnic: String,
    fatherName: String,
    fatherCnic: String,
    phone: String,
    email: {
        type: String,
        unique: true, // Ensuring email is unique
    },
    currentAddress: String,
    permanentAddress: String,
    familyIncome: Number,
    domicile: String,
    selfCnic: String,
    latestFees: String,
    fatherCnicImage: String,
    profileImage: String,
    status: {
        type: String,
        default: "Pending", // Assuming new students start with a "Pending" status
    },
});
const StudentDetailAccepted = mongoose.model("StudentsDetailsAccepted", studentSchema);


module.exports = StudentDetailAccepted;
