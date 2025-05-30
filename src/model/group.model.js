const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // adjust if your config path differs

const Group = sequelize.define(
  "Group",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Match table name (or use User model directly if associated)
        key: "id",
      },
    },
  },
  {
    tableName: "groups",
    timestamps: true,
  }
);
// Group.sync({ alter: true });
module.exports = Group;
