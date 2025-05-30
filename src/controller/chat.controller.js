const User = require("../model/user.model");
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "first_name", "last_name", "email"], // only public info
      where: { is_verified: true },
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, role } = req.body;
    const profile_photo = req.file
      ? `/profile_uploads/${req.file.filename}`
      : undefined;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role) user.role = role;
    if (profile_photo) user.profile_photo = profile_photo;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_photo: user.profile_photo,
        is_online: user.is_online, // still included in response
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      where: { email },
      attributes: [
        "first_name",
        "last_name",
        "email",
        "role",
        "profile_photo",
        "is_online",
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
