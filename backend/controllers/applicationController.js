const Application = require("../models/Application");
const Student = require("../models/Student");
const Job = require("../models/Job");
const Company = require("../models/Company");

exports.apply = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.status !== "Open") return res.status(400).json({ message: "This job is closed" });
  if (job.deadline && new Date(job.deadline) < new Date()) {
    return res.status(400).json({ message: "Application deadline has passed" });
  }
  if (student.cgpa < job.requiredCgpa) {
    return res.status(400).json({ message: `Minimum CGPA required is ${job.requiredCgpa}` });
  }
  try {
    const application = await Application.create({
      student: student._id,
      job: job._id,
      coverLetter: req.body.coverLetter
    });
    res.status(201).json(await application.populate(["student", "job"]));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already applied for this job" });
    throw error;
  }
};

exports.mine = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  res.json(await Application.find({ student: student._id })
    .populate({ path: "job", populate: "company" }).sort({ createdAt: -1 }));
};

exports.list = async (req, res) => {
  const { status, job } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (job) filter.job = job;
  let applications = await Application.find(filter)
    .populate({ path: "student", populate: "user" })
    .populate({ path: "job", populate: "company" })
    .sort({ createdAt: -1 });
  if (req.user.role === "company") {
    const company = await Company.findOne({ user: req.user._id });
    applications = applications.filter(app => app.job?.company?._id.toString() === company?._id.toString());
  }
  res.json(applications);
};

exports.updateStatus = async (req, res) => {
  const allowed = ["Applied", "Under Review", "Shortlisted", "Approved", "Rejected"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid application status" });
  const application = await Application.findById(req.params.id)
    .populate({ path: "job", populate: "company" });
  if (!application) return res.status(404).json({ message: "Application not found" });
  if (req.user.role === "company") {
    const company = await Company.findOne({ user: req.user._id });
    if (application.job.company._id.toString() !== company._id.toString()) {
      return res.status(403).json({ message: "This application does not belong to your company" });
    }
  }
  application.status = req.body.status;
  application.companyNotes = req.body.companyNotes || application.companyNotes;
  await application.save();
  res.json(application);
};
