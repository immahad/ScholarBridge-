const mongoose = require("mongoose");
const { Schema } = mongoose;
const AdminSchema = new Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin_role: {
        type: String,
        required: true
    }
});

const Admin = mongoose.model("admins", AdminSchema);
module.exports = Admin;
