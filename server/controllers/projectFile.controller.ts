import { FakeSOSocket } from '../types/types';
import { updateProjectFile } from '../services/project/projectFile.service'; // adjust path if needed

const projectFileController = (socket: FakeSOSocket) => {
  socket.on('connection', conn => {
    // console.log('File collaboration socket connected:', conn.id);

    conn.on('joinFile', (fileId: string) => {
      conn.join(fileId);
    });

    conn.on('leaveFile', (fileId: string) => {
      conn.leave(fileId);
    });

    conn.on('editFile', async ({ fileId, content }) => {
      try {
        const result = await updateProjectFile(fileId, { contents: content });

        if ('error' in result) {
          //   console.error('Failed to update project file:', result.error);
          throw new Error(result.error);
        } else {
          conn.to(fileId).emit('remoteEdit', { fileId, content: result.contents });
        }
      } catch (error) {
        // console.error('Unexpected error updating file:', error);
        throw new Error();
      }
    });

    conn.on('disconnect', () => {
      //   console.log('File collaboration socket disconnected:', conn.id);
    });
  });
};

export default projectFileController;
