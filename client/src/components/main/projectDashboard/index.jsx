import React, { useState, useEffect, useContext } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiFile, FiStar, FiUser } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUsers } from '../../../services/userService';
import ProjectCard from '../projectCard';
import { createProject, getProjectsByUser } from '../../../services/projectService';
import useUserContext from '../../../hooks/useUserContext';
import UserContext from '../../../contexts/UserContext';

import 'bootstrap/dist/css/bootstrap.min.css';

// import useUserSearch from '../../../hooks/useUserSearch';

const ProjectDashboard = () => {
  const { userC, socket } = useUserContext();
  const context = useContext(UserContext);
  const location = useLocation();
  const username = context?.user?.username;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const { pid } = useParams();
  // const [textErr, setTextErr] = useState('');
  // const [projectID, setprojectID] = useState('');

  const [newProject, setNewProject] = useState({
    name: '',
    type: 'doc',
    currentState: 'draft', // should all new projects have current/initial state being a draft?
    sharedUsers: [],
    // starred: false,
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

  const handleClick = project => {
    navigate(`/projects/${project._id}`);
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

  useEffect(() => {
    if (showAddForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddForm]);

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter(user => user.username.toLowerCase().includes(searchUsername.toLowerCase())),
    );
  }, [searchUsername, allUsers]);

  // get all projects by user use effect
  useEffect(() => {
    if (!userC || !userC.username) return;
    const fetchData = async () => {
      const allProj = await getProjectsByUser(userC.username);
      console.log('Fetched Projects:', allProj);
      setProjects(allProj);
    };
    fetchData();
  }, [userC, location.pathname]);

  const handleAddSharedUser = user => {
    setNewProject({
      ...newProject,
      sharedUsers: [...newProject.sharedUsers, { ...user, permissions: 'viewer' }],
    });
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

  // useEffect(() => {
  //   if (!pid) {
  //     setTextErr('project ID is missing.');
  //     navigate('/home');
  //     return;
  //   }
  //   setprojectID(pid);
  // }, [pid, navigate]);

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
  const addProject = async () => {
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
        sharedUsers: newProject.sharedUsers.map(user => ({
          username: user.username,
          role: user.role || 'EDITOR', // or default role
        })),
      };
      try {
        const requestBody = {
          name: project.name,
          actor: username,
          collaborators: project.sharedUsers,
        };

        console.log('Creating project with request body:', requestBody);

        const addedProject = await createProject(
          requestBody.name,
          requestBody.actor,
          requestBody.collaborators,
        );

        console.log(addedProject);
        setProjects([addedProject, ...projects]);
        setNewProject({
          id: Date.now(),
          name: '',
          type: 'doc',
          sharedUsers: [],
        });
        closeAndResetForm();
      } catch (err) {
        throw new Error(`Error when adding project ${err}`);
      }
      // setShowAddForm(false);
    }
  };

  useEffect(() => {
    if (!userC || !userC.username) return;

    socket(userC);
  }, [userC, socket]);

  // star or unstar a project
  const toggleStar = id => {
    setProjects(projects.map(p => (p.id === id ? { ...p, starred: !p.starred } : p)));
  };

  // remove a project -> this needs to be changed to correctly move to trash. right now the projects who are removed do not go to garbage
  const trashProject = id => {
    setProjects(projects.map(p => (p.id === id ? { ...p, inTrash: true, starred: false } : p)));
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = e => {
    if (e.target.classList.contains('modal')) {
      closeAndResetForm();
    }
  };

  return (
    <div className='container-fluid py-4'>
      {/* Header */}
      <header className='mb-4 justify-content-between'>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-center'>
            <div className='bg-primary text-white p-2 rounded me-2 d-flex align-items-center'>
              FSO
            </div>
            <span className='fs-5 text-dark'>Projects</span>
          </div>
          {/* Search Bar */}
          <div className='d-flex justify-content-center align-items-center'>
            <div className='position-relative align-items-right'>
              <input
                type='text'
                placeholder='Search projects'
                className='form-control ps-5 align-items-right'
              />
              <FiSearch
                className='position-absolute'
                style={{
                  left: '0.75rem',
                  top: '0.625rem',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: '#6c757d',
                }}
              />
            </div>
          </div>
          <div className='ms-3'></div>
        </div>
      </header>

      {/* Project modal */}
      {showAddForm && (
        <div className='modal show d-block' tabIndex='-1' onClick={handleBackdropClick}>
          <div className='modal-dialog' onClick={e => e.stopPropagation()}>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Add New Project</h5>
                <button type='button' className='btn-close' onClick={closeAndResetForm}></button>
              </div>

              <div className='modal-body'>
                {/* Project Name Input */}
                <div className='mb-3'>
                  <label className='form-label'>Project Name</label>
                  <input
                    type='text'
                    value={newProject.name}
                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                    className='form-control'
                    placeholder='Enter project name'
                  />
                </div>

                {/* User Search and Share */}
                <div className='mb-3'>
                  <label className='form-label'>Share Project</label>
                  <input
                    type='text'
                    value={searchUsername}
                    onChange={handleInputChange}
                    className='form-control'
                    placeholder='Search username to share'
                  />
                </div>

                {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
                  <div className='mb-3'>
                    <label className='form-label'>User Search Results</label>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className='d-flex align-items-center justify-content-between mb-2'>
                        <div className='d-flex align-items-center'>
                          <FiUser className='me-2' />
                          <span>{user.username}</span>
                        </div>
                        <button
                          onClick={() => handleAddSharedUser(user)}
                          className='btn btn-sm btn-primary'>
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shared Users List */}
                {newProject.sharedUsers.length > 0 && (
                  <div className='mb-3'>
                    <label className='form-label'>Shared Users</label>
                    {newProject.sharedUsers.map(user => (
                      <div
                        key={user.id}
                        className='d-flex align-items-center justify-content-between mb-2'>
                        <div className='d-flex align-items-center'>
                          <FiUser className='me-2' />
                          <span>{user.username}</span>
                        </div>
                        <div className='d-flex align-items-center'>
                          <select
                            value={user.permissions}
                            onChange={e => updateUserPermissions(user.id, e.target.value)}
                            className='form-select form-select-sm me-2'
                            style={{ minWidth: '90px' }}>
                            <option value='viewer'>Viewer</option>
                            <option value='editor'>Editor</option>
                          </select>
                          <button
                            onClick={() => removeSharedUser(user.id)}
                            className='btn btn-sm text-danger'>
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='modal-footer'>
                <button onClick={closeAndResetForm} className='btn btn-secondary'>
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
        </div>
      )}

      {/* Modal backdrop */}
      {showAddForm && <div className='modal-backdrop fade show' onClick={closeAndResetForm}></div>}

      {/* Main content */}
      <main>
        {/* Tabs */}
        <ul className='nav nav-tabs mb-4'>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}>
              All Projects
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'starred' ? 'active' : ''}`}
              onClick={() => setActiveTab('starred')}>
              Starred
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'trash' ? 'active' : ''}`}
              onClick={() => setActiveTab('trash')}>
              Trash
            </button>
          </li>
        </ul>

        {/* All Projects */}
        <div className='mb-5'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h2 className='mb-0'>All Projects</h2>
            <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
              Add Project
            </button>
          </div>
          {projects.filter(p => !p.inTrash).length > 0 ? (
            <div className='row row-cols-1 row-cols-md-3 g-4'>
              {projects
                .filter(project => {
                  if (activeTab === 'starred') return project.starred;
                  if (activeTab === 'trash') return project.inTrash;
                  return !project.inTrash; // Recent tab shows all
                })
                .map(project => (
                  <div className='col' key={project.id}>
                    <ProjectCard project={project} />
                  </div>
                ))}
            </div>
          ) : (
            <div className='text-center py-5 bg-light rounded'>
              <div className='mb-3'>See your important projects here!</div>
              <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
                Add Your Project Here
              </button>
            </div>
          )}
        </div>

        {/* Projects Table */}
        <div>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h2>
              {activeTab === 'recent' && 'Recent Projects'}
              {activeTab === 'starred' && 'Starred Projects'}
              {activeTab === 'trash' && 'Trash'}
            </h2>
            <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
              <FiPlus className='me-1' />
              New Project
            </button>
          </div>

          {projects.length > 0 ? (
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <span className='visually-hidden'>Star</span>
                  </th>
                  <th>Name</th>
                  <th>Last Modified</th>
                  <th style={{ width: '80px' }}>
                    <span className='visually-hidden'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter(project => {
                    if (activeTab === 'starred') return project.starred;
                    if (activeTab === 'trash') return project.inTrash;
                    return !project.inTrash; // Recent tab shows all
                  })
                  .map(project => (
                    <tr
                      key={project.id}
                      onClick={() => handleClick(project)}
                      style={{ cursor: 'pointer' }}>
                      <td>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleStar(project.id);
                          }}
                          className='btn btn-link p-0'>
                          <FiStar
                            size={20}
                            fill={project.starred ? 'currentColor' : 'none'}
                            style={{ color: project.starred ? '#f59e0b' : '#d1d5db' }}
                          />
                        </button>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FiFile size={20} className='text-primary me-2' />
                          <span>{project.name}</span>
                        </div>
                      </td>
                      <td className='text-muted'>{project.lastEdited}</td>
                      <td>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            trashProject(project.id);
                          }}
                          className='btn btn-link text-secondary p-1'>
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-5 bg-light rounded'>
              <FiFile size={32} className='text-primary mb-3' />
              <h3>No projects yet</h3>
              <p className='text-muted'>Add your first project here!</p>
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
