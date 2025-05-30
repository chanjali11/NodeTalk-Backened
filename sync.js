const sequelize = require("./config/database");
const User = require("./src/model/user.model");
const Group = require("./src/model/group.model");
const GroupUser = require("./src/model/groupUser.model");
const Message = require("./src/model/message.model");
const defineAssociations = require("./src/model/relation");

defineAssociations();

async function syncAll() {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");

    await User.sync({ alter: true });
    await Group.sync({ alter: true });
    await GroupUser.sync({ alter: true });
    await Message.sync({ alter: true });

    console.log("All tables synced successfully!");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

syncAll();
