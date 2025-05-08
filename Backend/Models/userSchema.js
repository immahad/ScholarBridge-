// backend/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const userSchema = new mongoose.Schema({
    photo: String,
    name: { type: String, required: true },
    gender: { type: String, required: true },
    class: { type: Number, required: true },
    section: { type: String, required: true },
    guardianname: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);
