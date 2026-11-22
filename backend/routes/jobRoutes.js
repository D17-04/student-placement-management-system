const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/jobController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", authenticate, asyncHandler(controller.list));
router.get("/mine", authenticate, authorize("company"), asyncHandler(controller.mine));
router.post("/", authenticate, authorize("admin", "company"), asyncHandler(controller.create));
router.put("/:id", authenticate, authorize("admin", "company"), asyncHandler(controller.update));
router.delete("/:id", authenticate, authorize("admin", "company"), asyncHandler(controller.remove));

module.exports = router;
