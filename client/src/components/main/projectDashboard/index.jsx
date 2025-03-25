import React, { useState } from 'react';
import './index.css';
import { FiSearch, FiPlus, FiX, FiFile, FiStar } from 'react-icons/fi';
import { getUserByUsername } from '../../../services/userService';

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'doc',
    language: 'javascript',
    sharedUsers: [],
  });

  // searching for users
  const handleUserSearch = async () => {
    try {
      // getUserByUsername can search by partial username
      const user = await getUserByUsername(searchUsername);
      // Add user to search results
      setUserSearchResults([...userSearchResults, user]);
      setSearchUsername('');
    } catch (error) {
      console.error('Error searching for user:', error);
    }
  };
  // Function to add a shared user with permissions
  const addSharedUser = user => {
    // Check if user is already added
    const isUserAlreadyAdded = newProject.sharedUsers.some(sharedUser => sharedUser.id === user.id);
    if (!isUserAlreadyAdded) {
      setNewProject({
        ...newProject,
        sharedUsers: [...newProject.sharedUsers, { ...user, permissions: 'viewer' }],
      });
    }
  };

  // Function to update user permissions
  const updateUserPermissions = (userId, permissions) => {
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.map(user =>
        user.id === userId ? { ...user, permissions } : user,
      ),
    });
  };

  // Function to remove a shared user
  const removeSharedUser = userId => {
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.filter(user => user.id !== userId),
    });
  };
  const addProject = () => {
    if (newProject.name.trim()) {
      const project = {
        id: Date.now(),
        name: newProject.name,
        lastEdited: 'Just now',
        starred: false,
        type: 'doc',
        language: newProject.language,
        sharedUsers: newProject.sharedUsers,
      };
      setProjects([project, ...projects]);
      setNewProject({
        name: '',
        type: 'doc',
        language: 'javascript',
        sharedUsers: [],
      });
      setShowAddForm(false);
    }
  };

  const toggleStar = id => {
    setProjects(projects.map(p => (p.id === id ? { ...p, starred: !p.starred } : p)));
  };

  const removeProject = id => {
    setProjects(projects.filter(p => p.id !== id));
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
            <button
              className='add-button-icon'
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '9999px',
                cursor: 'pointer',
              }}>
              <FiPlus size={20} />
            </button>
          </div>
        </div>
      </header>
      {/* Project modal */}
      {showAddForm && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h3 className='modal-title'>Add New Project</h3>
              <button onClick={() => setShowAddForm(false)} className='modal-close'>
                <FiX size={20} />
              </button>
            </div>
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
            <div className='form-footer'>
              <button onClick={() => setShowAddForm(false)} className='btn btn-cancel'>
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
            Recently Opened
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
          <h2 className='section-title'>Quick Access</h2>
          {projects.filter(p => p.starred).length > 0 ? (
            <div className='project-grid'>
              {projects
                .filter(p => p.starred)
                .map(project => (
                  <div key={project.id} className='project-card'>
                    <div className='card-icon'>
                      <FiFile size={40} style={{ color: '#2563eb' }} />
                    </div>
                    <div className='card-content'>
                      <h3 className='card-title'>{project.name}</h3>
                      <p className='card-subtitle'>{project.lastEdited}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className='empty-state'>
              <div className='empty-text'>Star your important projects to see them here!</div>
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
                    if (activeTab === 'trash') return false; // No trash implementation yet
                    return true; // Recent tab shows all
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
                          onClick={() => removeProject(project.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: '#9ca3af',
                          }}>
                          <FiX size={20} />
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
              <p className='empty-text'>Add your first project to get started</p>
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
