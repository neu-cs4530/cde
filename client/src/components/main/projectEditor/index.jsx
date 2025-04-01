import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { FiUser, FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';

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

  const handleUserSearch = e => {
    const input = e.target.value;
    setSearchUsername(input);
    const filtered = allUsers.filter(
      user =>
        user.username.toLowerCase().includes(input.toLowerCase()) &&
        !sharedUsers.some(u => u.id === user.id),
    );
    setFilteredUsers(filtered);
  };
  const handleAddUser = user => {
    setSharedUsers([...sharedUsers, { ...user, permissions: 'viewer' }]);
    setFilteredUsers(prev => prev.filter(u => u.id !== user.id));
    setSearchUsername('');
  };

  const handleRemoveUser = userId => {
    const removed = sharedUsers.find(u => u.id === userId);
    setSharedUsers(sharedUsers.filter(u => u.id !== userId));
    setFilteredUsers(prev => [...prev, removed]);
  };

  const handleUpdatePermission = (userId, permission) => {
    setSharedUsers(
      sharedUsers.map(user => (user.id === userId ? { ...user, permissions: permission } : user)),
    );
  };

  const handleAddFile = () => {
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
    // making new file with appropriate starter content
    const starterContent = getStarterContentForLanguage(selectedLanguage, newFileName);
    setFileContents(prev => ({
      ...prev,
      [fullFileName]: starterContent,
    }));
    setFileLanguages(prev => ({
      ...prev,
      [fullFileName]: selectedLanguage,
    }));
    setActiveFile(fullFileName);
    // Reset form and close modal
    setNewFileName('');
    setIsAddFileOpen(false);
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
        <ul className='file-list'>
          {Object.keys(fileContents).map(file => (
            <li
              key={file}
              className={`file-item ${file === activeFile ? 'active' : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span onClick={() => setActiveFile(file)} style={{ flexGrow: 1 }}>
                {file}
              </span>
              <button
                onClick={() => {
                  if (Object.keys(fileContents).length === 1) {
                    // eslint-disable-next-line no-alert
                    alert('You need at least one file in a project!!');
                    return;
                  }
                  // eslint-disable-next-line no-alert
                  const confirmed = window.confirm(`Are you sure you want to delete "${file}"?`);
                  if (!confirmed) return;
                  const updated = { ...fileContents };
                  delete updated[file];
                  const updatedLanguages = { ...fileLanguages };
                  delete updatedLanguages[file];
                  setFileLanguages(updatedLanguages);
                  setFileContents(updated);
                  if (file === activeFile) {
                    const nextFile = Object.keys(updated)[0];
                    setActiveFile(nextFile || '');
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
            {/* Run button only for JavaScript files */}
            {fileLanguages[activeFile] === 'javascript' && (
              <button className='btn' onClick={runJavaScript}>
                Run
              </button>
            )}
          </div>
        </div>
        <div className='editor-wrapper'>
          <Editor
            height='calc(100vh - 150px - 3rem)'
            language={fileLanguages[activeFile] || getDefaultLanguageFromFileName(activeFile)}
            value={fileContents[activeFile]}
            onChange={newValue => setFileContents(prev => ({ ...prev, [activeFile]: newValue }))}
            theme={theme}
          />
          {/* Console output area */}
          <div className='console-area'>
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
              {sharedUsers.map(user => (
                <div key={user.id} className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <FiUser className='mr-2' />
                    <span>{user.username}</span>
                  </div>
                  <div className='flex items-center'>
                    <select
                      value={user.permissions}
                      onChange={e => handleUpdatePermission(user.id, e.target.value)}
                      className='form-select mr-2'>
                      <option value='viewer'>Viewer</option>
                      <option value='editor'>Editor</option>
                    </select>
                    <button onClick={() => handleRemoveUser(user.id)} className='text-red-500'>
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
              {filteredUsers.map(user => (
                <div key={user.id} className='flex items-center justify-between mb-2'>
                  <span>{user.username}</span>
                  <button onClick={() => handleAddUser(user)} className='btn btn-primary'>
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
