const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Placement = require("../models/Placement");

exports.stats = async (req, res) => {
  const [
    students,
    companies,
    jobs,
    placed,
    pending,
    recentApplications,
    placements
  ] = await Promise.all([
    Student.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments(),
    Student.countDocuments({ placementStatus: "Placed" }),
    Application.countDocuments({ status: { $in: ["Applied", "Under Review"] } }),
    Application.find()
      .populate({ path: "student", populate: "user" })
      .populate({ path: "job", populate: "company" })
      .sort({ createdAt: -1 })
      .limit(8),
    Placement.find().populate("company").sort({ offerDate: -1 }).limit(50)
  ]);

  res.json({
    cards: {
      students,
      companies,
      jobs,
      placed,
      pending
    },
    recentApplications,
    placements
  });
};
