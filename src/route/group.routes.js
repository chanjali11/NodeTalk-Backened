const express = require("express");
const router = express.Router();
const groupController = require("../controller/group.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/groups", authMiddleware, groupController.createGroup);

// GET all groups
router.get("/get-groups", groupController.getAllGroups);

router.post("/:groupId/add-members", groupController.addMembersToGroup);

// Only group creator can remove a member
router.delete(
  "/:groupId/remove-member",
  authMiddleware,
  groupController.removeMemberFromGroup
);

// Member exits group
router.delete("/:groupId/leave", authMiddleware, groupController.exitGroup);

module.exports = router;
