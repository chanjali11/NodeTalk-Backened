// src/route/message.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../controller/message.controller");

router.post("/send", upload.single("file"), controller.sendMessage);
router.get("/private/:user1/:user2", controller.getPrivateMessages);
router.get("/group/:groupId", controller.getGroupMessages);

module.exports = router;
