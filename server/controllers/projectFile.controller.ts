import { FakeSOSocket } from '../types/types';
import { updateProjectFile } from '../services/project/projectFile.service';
import express, { Router } from 'express';

const projectFileController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();
  socket.on('connection', conn => {

    conn.on('joinProject', (projectId: string) => {
      conn.join(projectId);
    });

    conn.on('leaveProject', (projectId: string) => {
      conn.leave(projectId);
    });

    conn.on('editFile', async ({ fileName, content }) => {
      try {
        const result = await updateProjectFile(fileName, { contents: content });

        if ('error' in result) {
          throw new Error(result.error);
        } else {
          conn.to(fileName).emit('remoteEdit', { fileName, content: result.contents });
        }
      } catch (error) {
        throw new Error();
      }
    });

    conn.on('disconnect', () => {
        // save file in database
    });
  });

  return router
};

export default projectFileController;
