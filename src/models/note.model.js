import mongoose from "mongoose";

// Version schema
const versionSchema = new mongoose.Schema({
  title: String,
  description: String,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Note schema
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "custom"],
      default: "private",
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
    archived: { type: Boolean, default: false },
    versions: [versionSchema],
  },
  { timestamps: true }
);

// Export Note model
export default mongoose.model("Note", noteSchema);
