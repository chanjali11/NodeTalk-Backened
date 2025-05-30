const Group = require("../model/group.model");
const GroupUser = require("../model/groupUser.model");
const User = require("../model/user.model");

exports.createGroup = async (req, res) => {
  try {
    const { group_name, user_emails } = req.body;

    // Validate input
    if (
      !group_name ||
      !Array.isArray(user_emails) ||
      user_emails.length === 0
    ) {
      return res.status(400).json({
        message: "Group name and at least one user email are required.",
      });
    }

    // Get logged-in user (group creator)
    const creator = req.user;
    if (!creator) return res.status(401).json({ message: "Unauthorized" });

    // Get users by email
    const users = await User.findAll({
      where: { email: user_emails },
    });

    // Check if all emails exist
    const foundEmails = users.map((u) => u.email);
    const notFound = user_emails.filter((e) => !foundEmails.includes(e));
    if (notFound.length > 0) {
      return res.status(404).json({
        message: "Some users not found",
        not_found_emails: notFound,
      });
    }

    // Collect user IDs
    const userIds = users.map((user) => user.id);

    // Ensure creator is also a member
    if (!userIds.includes(creator.id)) {
      userIds.push(creator.id);
    }

    // Create the group
    const group = await Group.create({
      name: group_name,
      created_by: creator.id,
    });

    // Add members to GroupUser join table
    const groupMembers = userIds.map((userId) => ({
      groupId: group.id,
      userId,
    }));

    await GroupUser.bulkCreate(groupMembers);

    //  Fetch the group with creator info
    const groupWithCreator = await Group.findOne({
      where: { id: group.id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    return res.status(201).json({
      message: "Group created successfully.",
      group: groupWithCreator,
    });
  } catch (error) {
    console.error("Group creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: User,
          as: "members", //  Matches association alias in Group.belongsToMany
          attributes: ["id", "first_name", "last_name", "email"],
          through: { attributes: [] }, // Don't include GroupUser join table fields
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Groups fetched successfully.",
      groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//add member to the group
exports.addMembersToGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { user_emails } = req.body;

    if (!Array.isArray(user_emails) || user_emails.length === 0) {
      return res.status(400).json({
        message: "At least one user email is required.",
      });
    }

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Fetch users
    const users = await User.findAll({ where: { email: user_emails } });
    const foundEmails = users.map((u) => u.email);
    const notFound = user_emails.filter((e) => !foundEmails.includes(e));
    if (notFound.length > 0) {
      return res.status(404).json({
        message: "Some users not found",
        not_found_emails: notFound,
      });
    }

    // Check existing members
    const existingMembers = await GroupUser.findAll({
      where: {
        groupId,
        userId: users.map((u) => u.id),
      },
    });

    const existingUserIds = existingMembers.map((m) => m.userId);
    const newUsers = users.filter((user) => !existingUserIds.includes(user.id));

    // Add new members
    const newMembers = newUsers.map((user) => ({
      groupId,
      userId: user.id,
    }));

    await GroupUser.bulkCreate(newMembers);

    res.status(200).json({
      message: "Members added successfully",
      added_users: newUsers.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
      })),
    });
  } catch (error) {
    console.error("Add Members Error:", error);
    res.status(500).json({ message: "Failed to add members to group" });
  }
};

// Remove member from group
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({ message: "User email is required." });
    }

    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if logged-in user is the group creator
    const creator = req.user;
    if (group.created_by !== creator.id) {
      return res
        .status(403)
        .json({ message: "Only group creator can remove members." });
    }

    const user = await User.findOne({ where: { email: user_email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.id === group.created_by) {
      return res.status(403).json({ message: "Cannot remove group creator." });
    }

    const removed = await GroupUser.destroy({
      where: {
        groupId,
        userId: user.id,
      },
    });

    if (removed === 0) {
      return res
        .status(400)
        .json({ message: "User is not a member of the group." });
    }

    return res
      .status(200)
      .json({ message: "User removed from group successfully." });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Failed to remove member from group." });
  }
};

// Allow a user to leave a group
exports.exitGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    // Check if user is in the group
    const membership = await GroupUser.findOne({
      where: { groupId, userId },
      order: [["createdAt", "ASC"]],
    });

    if (!membership) {
      return res
        .status(404)
        .json({ message: "You are not a member of this group." });
    }

    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const isCreator = group.created_by === userId;

    // Remove user from group
    await membership.destroy();

    // If user was the creator, reassign ownership
    if (isCreator) {
      // Get next member based on join order
      const nextMember = await GroupUser.findOne({
        where: { groupId },
        order: [["createdAt", "ASC"]],
      });

      if (nextMember) {
        // Assign new creator
        group.created_by = nextMember.userId;
        await group.save();
      } else {
        // No members left, delete group
        await group.destroy();
        return res
          .status(200)
          .json({ message: "Group deleted as no members are left." });
      }
    }

    return res
      .status(200)
      .json({ message: "You have exited the group successfully." });
  } catch (error) {
    console.error("Exit Group Error:", error);
    res.status(500).json({ message: "Failed to exit group." });
  }
};
