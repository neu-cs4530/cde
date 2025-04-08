import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { FiUser, FiTrash2, FiX, FiPlus, FiCopy } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';
import {
  getFiles,
  updateFileById,
  createFile,
  deleteFileById,
  runProjectFile,
} from '../../../services/projectService';
import UserContext from '../../../contexts/UserContext';

const ProjectEditor = () => {
  const [theme, setTheme] = useState('vs-dark');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [activeFile, setActiveFile] = useState('main.py');
  const [newFileName, setNewFileName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [fileLanguages, setFileLanguages] = useState({
    'main.py': 'python',
    'utils.py': 'python',
  });
  const [fileContents, setFileContents] = useState({
    'main.py': '# Start coding here...',
    'utils.py': '# Start coding here...',
  });

  const [sharedUsers, setSharedUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const consoleRef = useRef(null);
  const user = useContext(UserContext);
  const { projectId } = useParams();
  const [fileMap, setFileMap] = useState({});
  const [searchFile, setSearchFile] = useState('');

  const getDefaultLanguageFromFileName = fileName => {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.java')) return 'java';
    return 'plaintext';
  };

  const getFileExtensionForLanguage = language => {
    switch (language) {
      case 'python':
        return '.py';
      case 'javascript':
        return '.js';
      case 'java':
        return '.java';
      default:
        return '.txt';
    }
  };
  const getStarterContentForLanguage = (language, fileName) => {
    switch (language) {
      case 'python':
        return `# ${fileName} content\n# Start coding in Python...`;
      case 'javascript':
        return `// ${fileName} content\n// Start coding in JavaScript...`;
      case 'java':
        return `// ${fileName} content\n// Start coding in Java...`;
      default:
        return `// ${fileName} content`;
    }
  };
  const runPythonFile = async () => {
    try {
      setConsoleOutput(prev => `${prev}> Running ${activeFile}...\n`);
      // file ID from fileMap
      const fileId = fileMap[activeFile]?._id;
      if (!fileId) {
        setConsoleOutput(prev => `${prev}> Error: Could not find file ID for ${activeFile}\n`);
        return;
      }
      const result = await runProjectFile(projectId, fileId, activeFile, fileContents[activeFile]);
      if (result.error) {
        setConsoleOutput(prev => `${prev}${result.error}\n`);
      }
      if (result.output) {
        setConsoleOutput(prev => `${prev}${result.output}\n`);
      }
      setConsoleOutput(prev => `${prev}> Execution complete\n`);
    } catch (error) {
      setConsoleOutput(prev => `${prev}> Error running ${activeFile}: ${error.message}\n`);
    }
  };

  useEffect(() => {
    getUsers()
      .then(data => {
        setAllUsers(data);
        setFilteredUsers(data);
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error('Error loading users', err));
  }, []);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);
  useEffect(() => {
    const loadFiles = async () => {
      if (!projectId || !user?.user?.username) return;
      const files = await getFiles(projectId, user.user.username);
      const contents = {};
      const languages = {};
      const map = {};
      files.forEach(file => {
        contents[file.name] = file.contents;
        languages[file.name] = file.fileType.toLowerCase();
        map[file.name] = file;
      });
      setFileContents(contents);
      setFileLanguages(languages);
      setFileMap(map);
      setActiveFile(files[0]?.name || '');
    };
    loadFiles();
  }, [projectId, user.user.username]);
  useEffect(() => {
    if (!projectId) return undefined;

    user?.socket.emit('joinProject', projectId);

    return () => {
      user?.socket.emit('leaveProject', projectId);
    };
  }, [projectId, user?.socket]);
  useEffect(() => {
    if (!activeFile) return undefined;

    const handleRemoteEdit = ({ fileId, content }) => {
      const updatedFileName = Object.keys(fileMap).find(name => fileMap[name]?._id === fileId);
      if (!updatedFileName) return;

      setFileContents(prev => ({
        ...prev,
        [updatedFileName]: content,
      }));
    };

    user?.socket.on('remoteEdit', handleRemoteEdit);

    return () => {
      user?.socket.off('remoteEdit', handleRemoteEdit);
    };
  }, [activeFile, fileMap, user?.socket]);
  useEffect(() => {
    if (!projectId) return undefined;

    const handleFileCreated = ({ file }) => {
      const { name } = file;
      const language = file.fileType.toLowerCase();
      const starterContent = getStarterContentForLanguage(language, name);

      setFileContents(prev => ({ ...prev, [name]: starterContent }));
      setFileLanguages(prev => ({ ...prev, [name]: language }));
      setFileMap(prev => ({ ...prev, [name]: file }));
    };

    user?.socket.on('fileCreated', handleFileCreated);

    return () => {
      user?.socket.off('fileCreated', handleFileCreated);
    };
  }, [projectId, user?.socket]);
  useEffect(() => {
    const handleFileDeleted = ({ fileId }) => {
      const fileToDelete = Object.entries(fileMap).find(([name, file]) => file._id === fileId)?.[0];

      if (fileToDelete) {
        setFileContents(prev => {
          const updated = { ...prev };
          delete updated[fileToDelete];
          return updated;
        });

        setFileLanguages(prev => {
          const updated = { ...prev };
          delete updated[fileToDelete];
          return updated;
        });

        setFileMap(prev => {
          const updated = { ...prev };
          delete updated[fileToDelete];
          return updated;
        });

        if (activeFile === fileToDelete) {
          const nextFile = Object.keys(fileContents).find(f => f !== fileToDelete);
          setActiveFile(nextFile || '');
        }
      }
    };

    user?.socket.on('fileDeleted', handleFileDeleted);
    return () => {
      user?.socket.off('fileDeleted', handleFileDeleted);
    };
  }, [fileMap, fileContents, activeFile, user?.socket]);

  const handleUserSearch = e => {
    const input = e.target.value;
    setSearchUsername(input);
    const filtered = allUsers.filter(
      userC =>
        userC.username.toLowerCase().includes(input.toLowerCase()) &&
        !sharedUsers.some(u => u.id === userC.id),
    );
    setFilteredUsers(filtered);
  };
  const handleAddUser = userC => {
    setSharedUsers([...sharedUsers, { ...userC, permissions: 'viewer' }]);
    setFilteredUsers(prev => prev.filter(u => u.id !== userC.id));
    setSearchUsername('');
  };

  const handleRemoveUser = userId => {
    const removed = sharedUsers.find(u => u.id === userId);
    setSharedUsers(sharedUsers.filter(u => u.id !== userId));
    setFilteredUsers(prev => [...prev, removed]);
  };

  const handleUpdatePermission = (userId, permission) => {
    setSharedUsers(
      sharedUsers.map(userC =>
        userC.id === userId ? { ...userC, permissions: permission } : userC,
      ),
    );
  };

  const handleAddFile = async () => {
    if (!newFileName.trim()) {
      setConsoleOutput(prev => `${prev}Error: File name cannot be empty\n`);
      return;
    }

    const fileExtension = getFileExtensionForLanguage(selectedLanguage);
    const fullFileName = `${newFileName}${fileExtension}`;

    if (Object.keys(fileContents).includes(fullFileName)) {
      setConsoleOutput(prev => `${prev}Error: A file with this name already exists\n`);
      return;
    }

    const starterContent = getStarterContentForLanguage(selectedLanguage, newFileName);

    try {
      const fileTypeEnum = selectedLanguage.toUpperCase();
      const createdFile = await createFile(
        projectId,
        user.user.username,
        fullFileName,
        fileTypeEnum,
      );

      setFileContents(prev => ({
        ...prev,
        [fullFileName]: starterContent,
      }));
      setFileLanguages(prev => ({
        ...prev,
        [fullFileName]: selectedLanguage,
      }));
      setFileMap(prev => ({
        ...prev,
        [fullFileName]: createdFile,
      }));
      setActiveFile(fullFileName);
      setNewFileName('');
      setIsAddFileOpen(false);
    } catch (err) {
      setConsoleOutput(prev => `${prev}Error: Could not create file on server\n`);
    }
  };
  const handleDuplicateFile = fileName => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const extension = fileName.slice(fileName.lastIndexOf('.'));
    let duplicatedFileName = `${baseName}_copy${extension}`;
    let counter = 1;
    while (fileContents[duplicatedFileName]) {
      duplicatedFileName = `${baseName}_copy_${counter}${extension}`;
      counter++;
    }
    setFileContents(prev => ({
      ...prev,
      [duplicatedFileName]: prev[fileName],
    }));
    setFileLanguages(prev => ({
      ...prev,
      [duplicatedFileName]: prev[fileName],
    }));
    setActiveFile(duplicatedFileName);
  };
  const runJavaScript = () => {
    try {
      // capture console.log output
      // eslint-disable-next-line no-console
      const originalLog = console.log;
      let output = '';
      // eslint-disable-next-line no-console
      console.log = (...args) => {
        output += `${args.join(' ')}\n`;
        originalLog(...args);
      };
      // Execute
      // eslint-disable-next-line no-eval
      eval(fileContents[activeFile]);

      // restoring original console.log
      // eslint-disable-next-line no-console
      console.log = originalLog;
      // updating console output
      setConsoleOutput(prev => `${prev}> Running ${activeFile}...\n${output}\n`);
    } catch (e) {
      setConsoleOutput(prev => `${prev}> Error running ${activeFile}: ${e.message}\n`);
    }
  };

  const clearConsole = () => {
    setConsoleOutput('');
  };

  return (
    <div className='editor-container'>
      {/* Sidebar */}
      <aside className='file-tree'>
        <div className='file-tree-header'>Files</div>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search files...'
          className='file-search'
          value={searchFile}
          onChange={e => setSearchFile(e.target.value)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
          }}
        />
        <ul className='file-list'>
          {Object.keys(fileContents)
            .filter(fileName => fileName.toLowerCase().includes(searchFile.trim().toLowerCase()))
            .map(file => (
              <li
                key={file}
                className={`file-item ${file === activeFile ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}>
                <span
                  onClick={() => setActiveFile(file)}
                  title={file}
                  style={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}>
                  {file}
                </span>
                <button
                  onClick={() => handleDuplicateFile(file)}
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    marginLeft: '0.5rem',
                  }}
                  title='Duplicate file'>
                  <FiCopy size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (Object.keys(fileContents).length === 1) {
                      // eslint-disable-next-line no-alert
                      alert('You need at least one file in a project!!');
                      return;
                    }
                    // eslint-disable-next-line no-alert
                    const confirmed = window.confirm(`Are you sure you want to delete "${file}"?`);
                    if (!confirmed) return;
                    try {
                      const fileId = fileMap[file]?._id;
                      if (!fileId) throw new Error('Missing fileId');

                      await deleteFileById(projectId, fileId, user.user.username);

                      const updated = { ...fileContents };
                      delete updated[file];
                      setFileContents(updated);

                      const updatedLanguages = { ...fileLanguages };
                      delete updatedLanguages[file];
                      setFileLanguages(updatedLanguages);

                      const updatedMap = { ...fileMap };
                      delete updatedMap[file];
                      setFileMap(updatedMap);

                      if (file === activeFile) {
                        const nextFile = Object.keys(updated)[0];
                        setActiveFile(nextFile || '');
                      }
                    } catch (err) {
                      setConsoleOutput(prev => `${prev}Error: Could not delete file on server\n`);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    marginLeft: '0.5rem',
                  }}
                  title='Delete file'>
                  <FiTrash2 size={16} />
                </button>
              </li>
            ))}
        </ul>

        {/* Add file button */}
        <button
          onClick={() => setIsAddFileOpen(true)}
          className='btn btn-primary'
          style={{ marginTop: '1rem' }}>
          <FiPlus size={14} style={{ marginRight: '5px' }} /> Add File
        </button>
      </aside>
      {/* Main editor */}
      <main className='code-editor'>
        <div className='editor-header'>
          <span className='file-name'>{activeFile}</span>
          <div className='editor-actions'>
            <button
              className='btn'
              onClick={() => setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'))}>
              Switch Mode
            </button>
            <button className='btn' onClick={() => setIsShareOpen(true)}>
              Share
            </button>
            {/* Run button for JavaScript files */}
            {fileLanguages[activeFile] === 'javascript' && (
              <button className='btn' onClick={runJavaScript}>
                Run
              </button>
            )}
            {/* Run button for Python files */}
            {fileLanguages[activeFile] === 'python' && (
              <button className='btn' onClick={runPythonFile}>
                Run
              </button>
            )}
          </div>
        </div>
        <div className='editor-wrapper'>
          <Editor
            height='60%'
            language={fileLanguages[activeFile] || getDefaultLanguageFromFileName(activeFile)}
            value={fileContents[activeFile]}
            onChange={async newValue => {
              setFileContents(prev => ({ ...prev, [activeFile]: newValue }));
              const fileId = fileMap[activeFile]?._id;
              user?.socket.emit('editFile', {
                fileId,
                content: newValue,
              });
              try {
                if (!fileId) throw new Error('Missing fileId');
                await updateFileById(projectId, fileId, user.user.username, {
                  contents: newValue,
                });
              } catch (err) {
                throw new Error('Failed to save file');
              }
            }}
            theme={theme}
          />
          {/* Console output area */}
          <div className={`console-area ${theme === 'vs-dark' ? 'dark-console' : 'light-console'}`}>
            <div className='console-header'>
              <span>Console</span>
              <button onClick={clearConsole} className='console-clear'>
                Clear
              </button>
            </div>
            <div className='console-output' ref={consoleRef}>
              {consoleOutput || '> Console output will appear here...'}
            </div>
          </div>
        </div>
      </main>

      {/* Add File Modal */}
      {isAddFileOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h3 className='modal-title'>Add New File</h3>
              <button onClick={() => setIsAddFileOpen(false)} className='modal-close'>
                <FiX size={20} />
              </button>
            </div>
            <div className='form-group'>
              <label className='form-label'>File Name (without extension)</label>
              <input
                type='text'
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                className='form-input'
                placeholder='Enter file name'
              />
            </div>
            <div className='form-group'>
              <label className='form-label'>Language</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className='form-select'>
                <option value='javascript'>JavaScript</option>
                <option value='python'>Python</option>
                <option value='java'>Java</option>
              </select>
            </div>
            <div className='modal-footer'>
              <button onClick={() => setIsAddFileOpen(false)} className='btn'>
                Cancel
              </button>
              <button onClick={handleAddFile} className='btn btn-primary'>
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h3 className='modal-title'>Share Project</h3>
              <button onClick={() => setIsShareOpen(false)} className='modal-close'>
                <FiX size={20} />
              </button>
            </div>

            <div className='form-group'>
              <label className='form-label'>Shared With</label>
              {sharedUsers.map(userC => (
                <div key={userC.id} className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <FiUser className='mr-2' />
                    <span>{userC.username}</span>
                  </div>
                  <div className='flex items-center'>
                    <select
                      value={userC.permissions}
                      onChange={e => handleUpdatePermission(userC.id, e.target.value)}
                      className='form-select mr-2'>
                      <option value='viewer'>Viewer</option>
                      <option value='editor'>Editor</option>
                    </select>
                    <button onClick={() => handleRemoveUser(userC.id)} className='text-red-500'>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className='form-group'>
              <label className='form-label'>Add Users</label>
              <input
                type='text'
                value={searchUsername}
                onChange={handleUserSearch}
                className='form-input'
                placeholder='Search username to share'
              />
              {filteredUsers.map(userC => (
                <div key={userC.id} className='flex items-center justify-between mb-2'>
                  <span>{userC.username}</span>
                  <button onClick={() => handleAddUser(userC)} className='btn btn-primary'>
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEditor;
