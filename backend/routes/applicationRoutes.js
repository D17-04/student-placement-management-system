const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/applicationController");
const asyncHandler = require("../middleware/asyncHandler");

router.post("/jobs/:jobId", authenticate, authorize("student"), asyncHandler(controller.apply));
router.get("/mine", authenticate, authorize("student"), asyncHandler(controller.mine));
router.get("/", authenticate, authorize("admin", "company"), asyncHandler(controller.list));
router.put("/:id/status", authenticate, authorize("admin", "company"), asyncHandler(controller.updateStatus));

module.exports = router;
