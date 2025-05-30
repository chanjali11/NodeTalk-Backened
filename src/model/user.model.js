const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    otp: { type: DataTypes.STRING },
    otp_expires_at: { type: DataTypes.DATE },
    // Password reset OTP
    reset_otp: { type: DataTypes.STRING },
    reset_otp_expires_at: { type: DataTypes.DATE },
    reset_otp_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    profile_photo: { type: DataTypes.STRING }, // URL or filename
    role: { type: DataTypes.STRING },
    is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);
// User.sync({ alter: true });
User.sync({ alter: true });

module.exports = User;
