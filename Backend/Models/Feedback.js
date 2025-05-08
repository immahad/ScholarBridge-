const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  email: { type: String, required: true },
  subject: { type: String, required: true },
  purpose: { type: String, required: true },
  suggestions: { type: String, required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
