import express from 'express';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getVersionHistory,
  rollbackNote,
} from '../controllers/note.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', verifyToken, createNote);               
router.get('/get', verifyToken, getNotes);                 
router.get('/:id', verifyToken, getNoteById);          
router.put('/:id', verifyToken, updateNote);            
router.delete('/:id', verifyToken, deleteNote);          
router.get('/:id/versions', verifyToken, getVersionHistory);
router.post('/:id/rollback', verifyToken, rollbackNote);     

export default router;
