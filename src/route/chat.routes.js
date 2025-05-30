const express = require("express");
const router = express.Router();
const chatController = require("../controller/chat.controller");
const upload = require("../middleware/profile_upload");

router.get("/users", chatController.getAllUsers);

router.get("/profile/:email", chatController.getProfile);

router.put(
  "/update_profile",
  upload.single("profile_photo"),
  chatController.updateProfile
);

module.exports = router;
