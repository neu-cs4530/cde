import React, { useState, useEffect } from 'react';
import './index.css';
import { FiSearch, FiPlus, FiTrash2, FiFile, FiStar, FiUser, FiX } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';
import ProjectCard from '../projectCard';

// import useUserSearch from '../../../hooks/useUserSearch';

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [searchUsername, setSearchUsername] = useState('');

  const [newProject, setNewProject] = useState({
    name: '',
    type: 'doc',
    currentState: 'draft', // should all new projects have current/initial state being a draft?
    sharedUsers: [],
    starred: false,
    inTrash: false,
  });
  const closeAndResetForm = () => {
    setNewProject({
      name: '',
      type: 'doc',
      sharedUsers: [],
    });
    setSearchUsername('');
    setShowAddForm(false);
  };
  const handleInputChange = e => {
    const inputValue = e.target.value;
    setSearchUsername(inputValue);
    // Filter users based on the input
    const filtered = allUsers.filter(
      user =>
        user.username.toLowerCase().includes(inputValue.toLowerCase()) &&
        // Exclude already added users
        !newProject.sharedUsers.some(sharedUser => sharedUser.id === user.id),
    );
    setFilteredUsers(filtered);
  };
  useEffect(() => {
    if (showAddForm && allUsers.length === 0) {
      getUsers()
        .then(data => {
          setAllUsers(data);
          setFilteredUsers(data);
        })
        // eslint-disable-next-line no-console
        .catch(err => console.error('Failed to load users', err));
    }
  }, [showAddForm, allUsers.length]);

  // Filter users by username as input changes
  useEffect(() => {
    setFilteredUsers(
      allUsers.filter(user => user.username.toLowerCase().includes(searchUsername.toLowerCase())),
    );
  }, [searchUsername, allUsers]);

  const handleAddSharedUser = user => {
    setNewProject({
      ...newProject,
      sharedUsers: [...newProject.sharedUsers, { ...user, permissions: 'viewer' }],
    });
    // Update filtered users and search
    setFilteredUsers(prev => prev.filter(u => u.id !== user.id));
    setSearchUsername('');
  };

  // update user permissions
  const updateUserPermissions = (userId, permissions) => {
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.map(user =>
        user.id === userId ? { ...user, permissions } : user,
      ),
    });
  };

  // remove a shared user
  const removeSharedUser = userId => {
    const removedUser = newProject.sharedUsers.find(user => user.id === userId);
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.filter(user => user.id !== userId),
    });
    // Add the removed user back to filteredUsers
    setFilteredUsers(prev => [...prev, removedUser]);
  };
  const addProject = () => {
    if (newProject.name.trim()) {
      const project = {
        id: Date.now(),
        name: newProject.name,
        createdAt: new Date(),
        currentState: 'draft',
        collaborators: [],
        lastEdited: 'Just now',
        starred: false,
        inTrash: false,
        type: 'doc',
        sharedUsers: newProject.sharedUsers || [],
      };
      setProjects([project, ...projects]);
      setNewProject({
        id: Date.now(),
        name: '',
        type: 'doc',
        sharedUsers: [],
      });
      setShowAddForm(false);
    }
  };

  // star or unstar a project
  const toggleStar = id => {
    setProjects(projects.map(p => (p.id === id ? { ...p, starred: !p.starred } : p)));
  };

  // remove a project -> this needs to be changed to correctly move to trash. right now the projects who are removed do not go to garbage
  const trashProject = id => {
    setProjects(projects.map(p => (p.id === id ? { ...p, inTrash: true } : p)));
  };

  return (
    <div className='project-dashboard'>
      {/* Header */}
      <header className='project-header'>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className='project-logo'>FSO</div>
          <span style={{ fontSize: '1.25rem', color: '#1f2937' }}>Projects</span>
          {/* Search Bar */}
          <div className='project-search'>
            <input type='text' placeholder='Search projects' className='search-input' />
            <FiSearch
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '0.625rem',
                width: '1.25rem',
                height: '1.25rem',
                color: '#6b7280',
              }}
            />
          </div>
          <div style={{ marginLeft: '1rem' }}>
          </div>
        </div>
      </header>
      {/* Project modal */}
      {showAddForm && (
        <div className='modal-overlay'>
          <div
            className='modal-content'
            style={{
              maxWidth: '36rem',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              zIndex: 100,
            }}>
            <div className='modal-header'>
              <h3 className='modal-title'>Add New Project</h3>
              <button onClick={closeAndResetForm} className='modal-close'>
                <FiX size={20} />
              </button>
            </div>

            {/* Project Name Input */}
            <div className='form-group'>
              <label className='form-label'>Project Name</label>
              <input
                type='text'
                value={newProject.name}
                onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                className='form-input'
                placeholder='Enter project name'
              />
            </div>

            {/* User Search and Share */}
            <div className='form-group'>
              <label className='form-label'>Share Project</label>
              <input
                type='text'
                value={searchUsername}
                onChange={handleInputChange}
                className='form-input'
                placeholder='Search username to share'
              />
            </div>

            {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
              <div className='form-group'>
                <label className='form-label'>User Search Results</label>
                {filteredUsers.map(user => (
                  <div key={user.id} className='flex items-center justify-between mb-2'>
                    <div className='flex items-center'>
                      <FiUser className='mr-2' />
                      <span>{user.username}</span>
                    </div>
                    <button onClick={() => handleAddSharedUser(user)} className='btn btn-primary'>
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Shared Users List */}
            {newProject.sharedUsers.length > 0 && (
              <div className='form-group'>
                <label className='form-label'>Shared Users</label>
                {newProject.sharedUsers.map(user => (
                  <div key={user.id} className='flex items-center justify-between mb-2'>
                    <div className='flex items-center'>
                      <FiUser className='mr-2' />
                      <span>{user.username}</span>
                    </div>
                    <div className='flex items-center'>
                      <select
                        value={user.permissions}
                        onChange={e => updateUserPermissions(user.id, e.target.value)}
                        className='form-input mr-2'>
                        <option value='viewer'>Viewer</option>
                        <option value='editor'>Editor</option>
                      </select>
                      <button onClick={() => removeSharedUser(user.id)} className='text-red-500'>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className='form-footer'>
              <button onClick={closeAndResetForm} className='btn btn-cancel'>
                Cancel
              </button>
              <button
                onClick={addProject}
                className='btn btn-primary'
                disabled={!newProject.name.trim()}>
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
      {/* main */}
      <main className='project-content'>
        {/* tabs */}
        <div className='project-tabs'>
          <button
            className={`tab-button ${activeTab === 'recent' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('recent')}>
            All Projects
          </button>
          <button
            className={`tab-button ${activeTab === 'starred' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('starred')}>
            Starred
          </button>
          <button
            className={`tab-button ${activeTab === 'trash' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('trash')}>
            Trash
          </button>
        </div>
        {/* Recents */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className='section-title'>All Projects</h2>
          {projects.filter(p => !p.inTrash).length > 0 ? (
            <div className='project-grid'>
              {projects
                .filter(p => !p.inTrash && (activeTab !== 'starred' || p.starred))
                .map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          ) : (
            <div className='empty-state'>
              <div className='empty-text'> See your important projects here!</div>
              <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
                Add Your Project Here
              </button>
            </div>
          )}
        </div>
        {/* Projects */}
        <div>
          <div className='section-header'>
            <h2 className='section-title'>
              {activeTab === 'recent' && 'Recent Projects'}
              {activeTab === 'starred' && 'Starred Projects'}
              {activeTab === 'trash' && 'Trash'}
            </h2>
            <button onClick={() => setShowAddForm(true)} className='add-button'>
              <FiPlus className='add-button-icon' />
              New Project
            </button>
          </div>
          {projects.length > 0 ? (
            <table className='projects-table'>
              <thead className='table-header'>
                <tr>
                  <th
                    style={{
                      padding: '0.75rem 1.5rem 0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      color: '#6b7280',
                      width: '1.5rem',
                    }}>
                    <span className='sr-only'>Star</span>
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 0.75rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      color: '#6b7280',
                    }}>
                    Name
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 0.75rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      color: '#6b7280',
                    }}>
                    Last Modified
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1.5rem 0.75rem 0.75rem',
                      textAlign: 'right',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      color: '#6b7280',
                      width: '2.5rem',
                    }}>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(project => {
                    if (activeTab === 'starred') return project.starred;
                    if (activeTab === 'trash') return project.inTrash; // No trash implementation yet
                    return !project.inTrash; // Recent tab shows all
                  })
                  .map(project => (
                    <tr key={project.id} className='table-row'>
                      <td className='row-icon'>
                        <button
                          onClick={() => toggleStar(project.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                          }}>
                          <FiStar
                            size={20}
                            fill={project.starred ? 'currentColor' : 'none'}
                            style={{ color: project.starred ? '#f59e0b' : '#d1d5db' }}
                          />
                        </button>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div className='row-title'>
                          <FiFile size={20} style={{ color: '#2563eb', marginRight: '0.75rem' }} />
                          <span>{project.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }} className='row-subtitle'>
                        {project.lastEdited}
                      </td>
                      <td className='row-actions'>
                        <button
                          onClick={() => trashProject(project.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#9ca3af',
                          }}>
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className='empty-state'>
              <div className='empty-icon'>
                <FiFile size={32} style={{ color: '#2563eb' }} />
              </div>
              <h3 className='empty-title'>No projects yet</h3>
              <p className='empty-text'>Add your first project here!</p>
              <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
                Add Project
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;
