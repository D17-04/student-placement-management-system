const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true, trim: true },
  course: { type: String, default: "MCA" },
  semester: { type: Number, default: 3, min: 1 },
  phone: { type: String, trim: true },
  dateOfBirth: Date,
  address: String,
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  skills: [String],
  resume: String,
  placementStatus: { type: String, enum: ["Not Placed", "Placed"], default: "Not Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
