const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const messageRoutes = require("./src/route/message.routes");
const chatRoutes = require("./src/route/chat.routes");
const groupRoutes = require("./src/route/group.routes");

const app = express();
const authRoutes = require("./src/route/auth.routes");

require("./src/model/relation");

app.use(cors());

app.use(express.json());
// Serve static files from the 'upload-proposal-doc' folder
app.use(
  "/profile_uploads",
  express.static(path.join(__dirname, "profile_uploads"))
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);
app.use("/api/group", groupRoutes);

app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
