const Job = require("../models/Job");
const Company = require("../models/Company");

exports.list = async (req, res) => {
  const { search, location, status, company } = req.query;
  const filter = {};
  if (search) filter.title = new RegExp(search, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (status) filter.status = status;
  if (company) filter.company = company;
  const jobs = await Job.find(filter).populate("company").sort({ createdAt: -1 });
  res.json(jobs);
};

exports.mine = async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) return res.status(404).json({ message: "Company profile not found" });
  res.json(await Job.find({ company: company._id }).populate("company").sort({ createdAt: -1 }));
};

exports.create = async (req, res) => {
  let company = await Company.findOne({ user: req.user._id });
  if (req.user.role === "admin" && req.body.company) {
    company = await Company.findById(req.body.company);
  }
  if (!company) return res.status(400).json({ message: "A valid company is required" });
  const required = ["title", "description", "location"];
  if (required.some(key => !req.body[key])) {
    return res.status(400).json({ message: "Title, description and location are required" });
  }
  const job = await Job.create({
    ...req.body,
    company: company._id,
    postedBy: req.user._id,
    requiredSkills: typeof req.body.requiredSkills === "string"
      ? req.body.requiredSkills.split(",").map(s => s.trim()).filter(Boolean)
      : req.body.requiredSkills || []
  });
  res.status(201).json(await job.populate("company"));
};

exports.update = async (req, res) => {
  let filter = { _id: req.params.id };
  if (req.user.role === "company") {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: "Company profile not found" });
    filter.company = company._id;
  }
  if (typeof req.body.requiredSkills === "string") {
    req.body.requiredSkills = req.body.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
  }
  const job = await Job.findOneAndUpdate(filter, req.body, { new: true, runValidators: true }).populate("company");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};

exports.remove = async (req, res) => {
  let filter = { _id: req.params.id };
  if (req.user.role === "company") {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: "Company profile not found" });
    filter.company = company._id;
  }
  const job = await Job.findOneAndDelete(filter);
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ message: "Job deleted" });
};
