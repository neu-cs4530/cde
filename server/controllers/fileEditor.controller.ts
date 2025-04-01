import express, { Response } from 'express';
import { FakeSOSocket, FileEditRequest, FileJoinRequest } from '../types/types';
import FileManager from '../services/project/fileManager';

/**
 * Controller for collaborative file editing.
 * Handles both HTTP and WebSocket logic for editing shared project files.
 */
const fileEditorController = (socket: FakeSOSocket) => {
  const router = express.Router();

  // HTTP endpoint to apply an edit (optionally, you may just rely on socket events)
  const editFile = async (req: FileEditRequest, res: Response) => {
    try {
      const { fileID, content } = req.body;

      if (!fileID || typeof content !== 'string') {
        return res.status(400).send('Invalid request');
      }

      const newContent = FileManager.applyEdit(fileID, content);
      socket.to(fileID).emit('fileUpdate', { fileID, newContent });

      return res.status(200).json({ fileID, content: newContent });
    } catch (err) {
      return res.status(500).send(`Failed to edit file: ${(err as Error).message}`);
    }
  };

  // Optional HTTP route to join file editing session
  const joinFile = async (req: FileJoinRequest, res: Response) => {
    const { fileID } = req.body;
    if (!fileID) return res.status(400).send('Invalid request');

    const content = FileManager.getFileContent(fileID);
    return res.status(200).json({ fileID, content });
  };

  // Register WebSocket handlers for live editing
  socket.on('connection', conn => {
    conn.on('joinFile', ({ fileID }) => {
      conn.join(fileID);
      const content = FileManager.getFileContent(fileID);
      conn.emit('fileUpdate', { fileID, newContent: content });
    });

    conn.on('leaveFile', ({ fileID }) => {
      conn.leave(fileID);
    });

    conn.on('editFile', ({ fileID, contentDelta }) => {
      const newContent = FileManager.applyEdit(fileID, contentDelta);
      socket.to(fileID).emit('fileUpdate', { fileID, newContent });
    });
  });

  // Register HTTP routes
  router.post('/edit', editFile);
  router.post('/join', joinFile);

  return router;
};

export default fileEditorController;
