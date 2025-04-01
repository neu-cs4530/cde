import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import { FileUpdatePayload } from '../types/types'; // from shared/types
import axios from 'axios';

const useFileEditorPage = () => {
  const { socket } = useUserContext();
  const { fileID } = useParams(); // assumes fileID is in the route
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !fileID) return;

    // Join file room on mount
    socket.emit('joinFile', { fileID });

    // Handle server push
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
    setContent: sendEdit, // external components call this to edit
    error,
  };
};

export default useFileEditorPage;
