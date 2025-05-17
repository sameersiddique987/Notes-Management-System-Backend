import express from "express";
import bcrypt from "bcrypt";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

// Get Profile
router.get("/", verifyToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, profilePicture } = req.user;
    res.json({ name, email, phoneNumber, profilePicture });
  } catch (err) {
    console.error("Error getting profile:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
});

router.patch(
  "/",
  verifyToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("🔐 req.user from middleware:", req.user);

      // Fetch the full user from DB to get Mongoose document
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { name, phoneNumber } = req.body;

      if (name) user.name = name;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (req.file) {
        user.profilePicture = req.file.path.replace(/\\/g, "/");
      }

      await user.save();

      console.log("✅ Updated User:", user);

      res.json({
        message: "Profile updated",
        profilePicture: user.profilePicture,
      });
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

// Change Password
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;
