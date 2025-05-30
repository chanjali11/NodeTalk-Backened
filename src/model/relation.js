// // module.exports = defineAssociations;
// const User = require("./user.model");
// const Group = require("./group.model");
// const GroupUser = require("./groupUser.model");
// const Message = require("./message.model");

// function defineAssociations() {
//   // User <-> Group many-to-many
//   User.belongsToMany(Group, { through: GroupUser, foreignKey: "userId" });
//   Group.belongsToMany(User, { through: GroupUser, foreignKey: "groupId" });

//   // User -> Message (as Sender)
//   User.hasMany(Message, { foreignKey: "senderId", as: "SentMessages" });
//   Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });

//   // Group -> Message
//   Group.hasMany(Message, { foreignKey: "groupId" });
//   Message.belongsTo(Group, { foreignKey: "groupId" });

//   // This is the key part you're using in your query
//   User.hasMany(Group, { foreignKey: "created_by", as: "createdGroups" });
//   Group.belongsTo(User, { foreignKey: "created_by", as: "creator" });
// }

// // CALL the function immediately to apply associations
// defineAssociations();
const User = require("./user.model");
const Group = require("./group.model");
const GroupUser = require("./groupUser.model");
const Message = require("./message.model");

function defineAssociations() {
  // Many-to-Many between User and Group
  User.belongsToMany(Group, { through: GroupUser, foreignKey: "userId" });
  Group.belongsToMany(User, {
    through: GroupUser,
    foreignKey: "groupId",
    as: "members",
  });

  // Group creator (One-to-Many)
  User.hasMany(Group, { foreignKey: "created_by", as: "createdGroups" });
  Group.belongsTo(User, { foreignKey: "created_by", as: "creator" });

  User.hasMany(Message, { foreignKey: "senderId", as: "SentMessages" });
  Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
  Group.hasMany(Message, { foreignKey: "groupId" });
  Message.belongsTo(Group, { foreignKey: "groupId" });
}

defineAssociations();
