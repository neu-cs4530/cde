import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { FiUser, FiTrash2, FiX } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';

const ProjectEditor = () => {
  const [theme, setTheme] = useState('vs-dark');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeFile, setActiveFile] = useState('main.py');
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

        {/* Add file button with language selection */}
        <button
          onClick={() => {
            // eslint-disable-next-line no-alert
            const newFileName = prompt('Enter new file name (without extension)');
            if (newFileName) {
              // eslint-disable-next-line no-alert
              const language = prompt(
                'Select language (javascript, java, or python)',
              ).toLowerCase();
              const validLanguage = ['javascript', 'java', 'python'].includes(language)
                ? language
                : 'javascript';
              const fileExtension = getFileExtensionForLanguage(validLanguage);
              const fullFileName = `${newFileName}${fileExtension}`;
              if (Object.keys(fileContents).includes(fullFileName)) {
                // eslint-disable-next-line no-alert
                alert('A file with this name already exists');
                return;
              }
              // new file with appropriate starter content
              const starterContent = getStarterContentForLanguage(validLanguage, newFileName);
              setFileContents(prev => ({
                ...prev,
                [fullFileName]: starterContent,
              }));
              setFileLanguages(prev => ({
                ...prev,
                [fullFileName]: validLanguage,
              }));
              setActiveFile(fullFileName);
            }
          }}
          className='btn btn-primary'
          style={{ marginTop: '1rem' }}>
          + Add File
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
          </div>
        </div>
        <Editor
          height='calc(100vh - 3rem)'
          language={fileLanguages[activeFile] || getDefaultLanguageFromFileName(activeFile)}
          value={fileContents[activeFile]}
          onChange={newValue => setFileContents(prev => ({ ...prev, [activeFile]: newValue }))}
          theme={theme}
        />
      </main>

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
                      className='form-input mr-2'>
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
