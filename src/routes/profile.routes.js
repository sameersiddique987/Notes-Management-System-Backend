import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

router.patch("/", verifyToken, upload.single("profilePicture"), updateProfile);

router.patch("/change-password", verifyToken, changePassword);

export default router;
