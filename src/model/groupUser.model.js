const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GroupUser = sequelize.define(
  "GroupUser",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "group_users",
    timestamps: true,
  }
);

module.exports = GroupUser;
