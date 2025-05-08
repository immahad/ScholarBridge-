const mongoose = require("mongoose");
const { Schema } = mongoose;
const WorksOnSchema = new Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "donors",
    required: true,
  },
  approved_case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "approved_case",
    required: true,
  },
  committed_payments: {
    type: Number,
    required: true,
  },
  completed_payments: {
    type: Number,
    required: true,
  },
});

const WorksOn = mongoose.model("workson", WorksOnSchema);
module.exports = WorksOn;
