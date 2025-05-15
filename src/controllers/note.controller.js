import mongoose from "mongoose";
import Note from "../models/note.model.js";

export const createNote = async (req, res) => {
  try {
    const { title, description, tags, visibility, sharedWith } = req.body;

    const newNote = await Note.create({
      title,
      description,
      tags,
      visibility,
      owner: req.user._id,
      sharedWith: visibility === "custom" ? sharedWith : [],
    });

    // 🟢 Socket.IO se notification bhejo
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    if (visibility === "custom" && sharedWith?.length > 0) {
      sharedWith.forEach((userId) => {
        const socketId = onlineUsers.get(userId);
        if (socketId) {
          io.to(socketId).emit("note:shared", {
            message: `A note titled "${title}" was shared with you.`,
            title,
            description,
            sharedBy: req.user.username, // ya req.user.name
          });
        }
      });
    }

    res.status(201).json({
      message: "Note created successfully!",
      note: newNote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { visibility: "public" },
        { visibility: "custom", allowedUsers: req.user.id },
      ],
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to get notes" });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (
      note.visibility === "private" &&
      note.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (
      note.visibility === "custom" &&
      !note.allowedUsers.includes(req.user.id) &&
      note.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to get note" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, description, tags, visibility, allowedUsers } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (note.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    note.versions.push({
      title: note.title,
      description: note.description,
      updatedBy: req.user.id,
    });

    note.title = title ?? note.title;
    note.description = description ?? note.description;
    note.tags = tags ?? note.tags;
    note.visibility = visibility ?? note.visibility;
    note.allowedUsers = visibility === "custom" ? allowedUsers : [];

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Note.findByIdAndDelete(noteId);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete Note Error:", err.stack || err);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

export const getVersionHistory = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "versions.updatedBy",
      "name email"
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note.versions);
  } catch (err) {
    res.status(500).json({ error: "Failed to get versions" });
  }
};

export const rollbackNote = async (req, res) => {
  try {
    const { versionId } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const version = note.versions.id(versionId); // ✅ MongoDB subdoc lookup
    if (!version) return res.status(400).json({ error: "Invalid version ID" });

    note.versions.push({
      title: note.title,
      description: note.description,
      updatedBy: req.user.id,
    });

    note.title = version.title;
    note.description = version.description;
    await note.save();

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to rollback note" });
  }
};
