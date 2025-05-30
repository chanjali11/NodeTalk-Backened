// config/database.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error(" DB connection failed:", err));

module.exports = sequelize;
