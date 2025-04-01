import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import { FileUpdatePayload } from '../types/types';

const useFileEditorPage = () => {
  const { socket } = useUserContext();
  const { fileID } = useParams();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !fileID) {
      return;
    }

    socket.emit('joinFile', { fileID });

    socket.on('fileUpdate', ({ fileID: id, newContent }: FileUpdatePayload) => {
      if (id === fileID) setContent(newContent);
    });

    socket.on('fileError', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.emit('leaveFile', { fileID });
      socket.off('fileUpdate');
      socket.off('fileError');
    };
  }, [socket, fileID]);

  // Send content changes to backend
  const sendEdit = (newContent: string) => {
    if (!socket || !fileID) return;
    socket.emit('editFile', { fileID, contentDelta: newContent });
  };

  return {
    content,
    setContent: sendEdit,
    error,
  };
};

export default useFileEditorPage;
