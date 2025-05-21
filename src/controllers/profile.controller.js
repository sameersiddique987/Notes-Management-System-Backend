import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import uploadImageToCloudinary from "../utils/uploadImageToCloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, phoneNumber } = req.body;

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    if (req.file) {
      const cloudinaryUrl = await uploadImageToCloudinary(req.file.path);
      user.profilePicture = cloudinaryUrl;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};
