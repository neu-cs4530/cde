import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Editor from '@monaco-editor/react';
import './index.css';
import { useParams } from 'react-router-dom';
import { FiUser, FiTrash2, FiX } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';

const ProjectEditor = () => {
  const [theme, setTheme] = useState('vs-dark');
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [sharedUsers, setSharedUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { projectId } = useParams();
  useEffect(() => {
    getUsers()
      .then(data => {
        setAllUsers(data);
        setFilteredUsers(data);
      })
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
          <li className='file-item active'>main.py</li>
          <li className='file-item'>utils.py</li>
        </ul>
      </aside>

      {/* Main editor */}
      <main className='code-editor'>
        <div className='editor-header'>
          <span className='file-name'>main.py</span>
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
          defaultLanguage='python'
          defaultValue={'# Start coding here...'}
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
