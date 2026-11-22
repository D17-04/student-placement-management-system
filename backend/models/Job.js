const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  jobType: { type: String, enum: ["Full-time", "Internship", "Contract"], default: "Full-time" },
  salary: String,
  requiredCgpa: { type: Number, min: 0, max: 10, default: 0 },
  requiredSkills: [String],
  vacancies: { type: Number, min: 1, default: 1 },
  deadline: Date,
  status: { type: String, enum: ["Open", "Closed"], default: "Open" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
