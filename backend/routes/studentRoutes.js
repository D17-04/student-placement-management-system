const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const controller = require("../controllers/studentController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/me", authenticate, authorize("student"), asyncHandler(controller.getMine));
router.put("/me", authenticate, authorize("student"), asyncHandler(controller.updateMine));
router.post("/resume", authenticate, authorize("student"), upload.single("resume"), asyncHandler(controller.uploadResume));
router.get("/", authenticate, authorize("admin"), asyncHandler(controller.list));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(controller.remove));

module.exports = router;
