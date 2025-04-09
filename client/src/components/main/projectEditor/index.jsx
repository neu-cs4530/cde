import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { FiUser, FiTrash2, FiX, FiPlus, FiSave } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';
import {
  getFiles,
  updateFileById,
  createFile,
  deleteFileById,
  runProjectFile,
  createProjectBackup,
  getProjectById,
  restoreStateById,
} from '../../../services/projectService';
import UserContext from '../../../contexts/UserContext';
import useUserContext from '../../../hooks/useUserContext';

/**
 *
 * ProjectEditor component allows users to edit the respective project, the files associated, and compile code written.
 *
 *
 * @returns A rendered component of the ProjectEditor.
 */
const ProjectEditor = () => {
  const [theme, setTheme] = useState('vs-light');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [activeFile, setActiveFile] = useState('');
  const [fileLanguages, setFileLanguages] = useState({});
  const [fileContents, setFileContents] = useState({});

  const [sharedUsers, setSharedUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const consoleRef = useRef(null);
  const user = useContext(UserContext);
  const { user: userCon } = useUserContext();
  const { projectId } = useParams();
  const [fileMap, setFileMap] = useState({});
  const [searchFile, setSearchFile] = useState('');
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState({});

  const getDefaultLanguageFromFileName = fileName => {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.java')) return 'java';
    return 'plaintext';
  };
  const isOwner = () => {
    // If the logged-in user is the creator of the project, they're the owner
    if (user?.user?.username === project?.creator) {
      return true;
    }
    // Otherwise check the collaborators list
    if (project?.collaborators) {
      const userCollab = project.collaborators.find(
        c => c.userId?.toString() === user.user.username?.toString(),
      );
      return userCollab?.role === 'OWNER';
    }
    return false;
  };
  const isEditor = () => {
    // If user is the owner, they also have editor permissions
    if (isOwner()) {
      return true;
    }
    // Check if user has explicit EDITOR role
    if (project?.collaborators) {
      const userCollab = project.collaborators.find(
        c => c.userId?.toString() === user.user.username?.toString(),
      );
      return userCollab?.role === 'EDITOR';
    }
    return false;
  };

  const isViewer = () => {
    // If user's system role is 'viewer', they're always just a viewer
    if (user?.user?.role === 'VIEWER') {
      return true;
    }

    // If they're neither owner nor editor, they're a viewer by default
    return !isOwner() && !isEditor();
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
        return `// ${fileName} content\n// Start coding in Java...\n// Remember your class name should be the same as your file name in java (excluding extension)`;
      default:
        return `// ${fileName} content`;
    }
  };
  const runPythonFile = async () => {
    try {
      setConsoleOutput(prev => `${prev}> Running ${activeFile}...\n`);
      // getting file ID from fileMap
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
  const runJavaFile = async () => {
    try {
      setConsoleOutput(prev => `${prev}> Running ${activeFile}...\n`);
      // getting file ID from fileMap
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
    const fetchData = async () => {
      try {
        const result = await getProjectById(projectId, user.user.username);
        setProject(result);
      } catch (error) {
        setConsoleOutput(
          prev => `${prev}> Error fetching project (id: ${projectId}): ${error.message}\n)`,
        );
      }
    };
    fetchData();
  }, [projectId, user]);
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
  }, [projectId, user]);

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

  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const fetchedProject = await getProjectById(projectId, user.user.username);
        setProjectName(fetchedProject.name);
      } catch (error) {
        setProjectName('Unknown Project');
        throw new Error('Failed to load project name');
      }
    };

    fetchProjectName();
  }, [projectId, user]);

  // determines if the owner of the project is the current user logged in, if yes then the selecting backup stuff goes away.
  // const [projectOwner, setProjectOwner] = useState('');
  // if (projectOwner == user.user.username && {})
  // useEffect(() => {
  //   const fetchProjectOwner = async () => {
  //     try {
  //       const project = await getProjectById(projectId, user.user.username);
  //       setProjectOwner(project.creator);
  //     } catch (error) {
  //       setProjectOwner('Unknown user');
  //       throw new Error('Failed to load project user');
  //     }
  //   };

  //   fetchProjectOwner();
  // }, [projectId]);

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

  /**
   * This function handles the api call to create a new backup for a project when the save backup button is pressed.
   * @param {*} projectId - the id of the specific project that a backup will be created for.
   * @param {*} userCon - the current user that is creating the backup
   */
  const handleCreateBackup = async () => {
    try {
      await createProjectBackup(projectId, user.user.username);
      // eslint-disable-next-line no-alert
      alert('Backup created successfully');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Failed to create backup');
      throw new Error(`Failed to create backup ${err}`);
    }
  };

  // save state button that adds to the view backups
  // /**
  //  * useEffect for saving a project backup every minute
  //  */
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     createProjectBackup(projectId, user);
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, []);
  const handleBackupSelection = async e => {
    const selectedBackupId = e.target.value;
    if (!selectedBackupId) return;
    try {
      await restoreStateById(projectId, selectedBackupId, user.user.username);

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
      // eslint-disable-next-line no-alert
      alert('Project restored successfully');
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert('Failed to restore backup');
      throw new Error(`Failed to restore to backup ${error}`);
    }
  };

  const getFilesFromSavedStates = async () => {
    const proj = await getProjectById(projectId, userCon.username);
    const backup = [];

    for (const state of proj.savedStates) {
      backup.push(state);
    }
    return backup;
  };
  // when someone clicks on a new state current state should be updated to the one they clicked on -> restoreStateRoute
  // objectids -> s#_dateTime
  //
  // change the editor view
  const handleViewBackups = async () => {
    setLoading(true);
    try {
      const files = await getFilesFromSavedStates();
      setBackups(files);
    } catch (error) {
      throw new Error(`Failed to get backups ${error}`);
    } finally {
      setLoading(false);
    }
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
      setConsoleOutput(
        prev => `${prev}> Running ${activeFile}...\n${output}> Execution complete\n`,
      );
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
        <div className='file-tree-header'>{projectName}</div>
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
                {(isEditor() || isOwner()) && (
                  <button
                    onClick={async () => {
                      if (Object.keys(fileContents).length === 1) {
                        // eslint-disable-next-line no-alert
                        alert('You need at least one file in a project!!');
                        return;
                      }
                      // eslint-disable-next-line no-alert
                      const confirmed = window.confirm(
                        `Are you sure you want to delete "${file}"?`,
                      );
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
                )}
              </li>
            ))}
        </ul>

        {/* Add file button */}
        {(isEditor() || isOwner()) && (
          <button onClick={() => setIsAddFileOpen(true)} className='btn btn-primary'>
            <FiPlus size={14} style={{ marginRight: '5px' }} /> Add File
          </button>
        )}
      </aside>
      {/* Main editor */}
      <main className='code-editor'>
        <div className='editor-header'>
          <span className='file-name'>{activeFile}</span>
          <div className='editor-actions'>
            {isOwner() && (
              <>
                {/* beginning of selecting backups */}
                <label htmlFor='backup-select'>Select Backup:</label>
                {/* Dropdown */}
                <select
                  id='backup-select'
                  disabled={loading}
                  onChange={handleBackupSelection}
                  defaultValue=''>
                  <option value='' disabled>
                    Select Backup
                  </option>
                  {backups.length > 0 ? (
                    backups.map((file, index) => (
                      <option key={index} value={file}>
                        {`s_${index + 1}`}
                        {/* {file} */}
                      </option>
                    ))
                  ) : (
                    <option value='' disabled>
                      No backups found
                    </option>
                  )}
                </select>

                <button onClick={handleViewBackups} className='btn btn-primary'>
                  {loading ? 'Loading...' : 'Refresh Backups'}
                </button>
              </>
            )}
            {/* ending of selecting backups */}

            {(isOwner() || isEditor()) && (
              <button onClick={handleCreateBackup} className='btn btn-primary'>
                <FiSave /> Save Backup
              </button>
            )}
            <button
              className='btn'
              onClick={() => setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'))}>
              Switch Mode
            </button>
            {isOwner() && (
              <button className='btn' onClick={() => setIsShareOpen(true)}>
                Share
              </button>
            )}
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
            {/* Run button for Java files */}
            {fileLanguages[activeFile] === 'java' && (
              <button className='btn' onClick={runJavaFile}>
                Run
              </button>
            )}
          </div>
        </div>
        <div className='editor-wrapper'>
          {!activeFile && (
            <div className='no-file-message'>
              <p style={{ padding: '1rem', color: 'black' }}>
                No file selected. Please add a file to start coding.
              </p>
            </div>
          )}
          <Editor
            height='60%'
            language={fileLanguages[activeFile] || getDefaultLanguageFromFileName(activeFile)}
            value={fileContents[activeFile] || ''}
            onChange={async newValue => {
              if (!activeFile || isViewer()) return; // Prevent if no file is active or if viewer
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
            options={{
              readOnly: isViewer() || !activeFile, // option prop from monaco set to read only
            }}
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
      {(isEditor() || isOwner()) && isAddFileOpen && (
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
