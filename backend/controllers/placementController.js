const Placement = require("../models/Placement");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");

exports.list = async (req, res) => {
  let filter = {};
  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    filter.student = student._id;
  }
  if (req.user.role === "company") {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: "Company profile not found" });
    filter.company = company._id;
  }
  res.json(await Placement.find(filter)
    .populate({ path: "student", populate: "user" })
    .populate("company")
    .populate("job")
    .sort({ offerDate: -1 }));
};

exports.create = async (req, res) => {
  const { student, company, job, package: packageLPA, offerDate, status } = req.body;
  if (!student || !company || !job) return res.status(400).json({ message: "Student, company and job are required" });
  if (!await Student.findById(student) || !await Company.findById(company) || !await Job.findById(job)) {
    return res.status(404).json({ message: "One or more placement records do not exist" });
  }
  const placement = await Placement.create({
    student, company, job, package: packageLPA, offerDate, status
  });
  await Student.findByIdAndUpdate(student, { placementStatus: "Placed" });
  res.status(201).json(await placement.populate(["student", "company", "job"]));
};

exports.update = async (req, res) => {
  const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate(["student", "company", "job"]);
  if (!placement) return res.status(404).json({ message: "Placement not found" });
  res.json(placement);
};

exports.remove = async (req, res) => {
  const placement = await Placement.findById(req.params.id);
  if (!placement) return res.status(404).json({ message: "Placement not found" });
  await placement.deleteOne();
  res.json({ message: "Placement deleted" });
};
