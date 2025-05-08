import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiTrash2, FiUser, FiMail } from 'react-icons/fi';
import { getUsers } from '../../../services/userService';
import ProjectCard from '../projectCard';
import {
  createProject,
  getProjectsByUser,
  deleteProjectById,
  getNotifsByUser,
  sendNotificationToUser,
  respondToInvite,
  deleteNotification,
} from '../../../services/projectService';
import useUserContext from '../../../hooks/useUserContext';
import UserContext from '../../../contexts/UserContext';

import 'bootstrap/dist/css/bootstrap.min.css';

/**
 *
 * ProjectDashboard component allows users to view their existing projects, create new projects, and add collaborators.
 *
 *
 * @returns A rendered component of the ProjectDashboard.
 */
const ProjectDashboard = () => {
  const { user: userC } = useUserContext();
  const context = useContext(UserContext);
  const username = context?.user?.username;
  const [activeTab, setActiveTab] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [newProject, setNewProject] = useState({
    name: '',
    type: 'doc',
    currentState: 'draft',
    sharedUsers: [],
    starred: false,
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

  // search users through the list of users, exlcuding the already added users.
  const handleInputChange = e => {
    const inputValue = e.target.value;
    setSearchUsername(inputValue);
    // Filter users based on the input
    const filtered = allUsers.filter(
      user =>
        user.username.toLowerCase().includes(inputValue.toLowerCase()) &&
        // exclude self from search results
        user.username.toLowerCase() !== username.toLowerCase() &&
        // Exclude already added users
        !newProject.sharedUsers.some(sharedUser => sharedUser._id === user._id),
    );
    setFilteredUsers(filtered);
  };

  // handle choice on invite notification
  const handleNotificationAction = async (notifId, action) => {
    try {
      await respondToInvite(username, notifId, action);

      // Remove notification from local state
      setNotifications(prev => prev.filter(n => n.id !== notifId));

      // Refetch projects if accepted
      if (action === 'accept') {
        const updatedProjects = await getProjectsByUser(username);
        setProjects(updatedProjects);
      }
    } catch (err) {
      throw new Error(err.error);
    }
  };

  // fetch project data
  const fetchData = useCallback(async () => {
    const allProj = await getProjectsByUser(userC.username);
    setProjects(allProj);
  }, [userC?.username]);

  useEffect(() => {
    if (showAddForm && allUsers.length === 0) {
      getUsers()
        .then(data => {
          const filtered = data.filter(
            user => user.username.toLowerCase() !== username.toLowerCase(),
          );
          setAllUsers(filtered);
          setFilteredUsers(filtered);
        })
        .catch(err => {
          throw new Error(err.error);
        });
    }
  }, [showAddForm, allUsers.length, username]);

  // use effect for showing the add project form
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
    fetchData();
  }, [userC, fetchData]);

  const handleAddSharedUser = user => {
    setNewProject({
      ...newProject,
      sharedUsers: [...newProject.sharedUsers, { ...user, permissions: 'viewer' }],
    });
    setFilteredUsers(prev => prev.filter(u => u._id !== user._id));
    setSearchUsername('');
  };

  // update user permissions
  const updateUserPermissions = (userId, permissions) => {
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.map(user =>
        user._id === userId ? { ...user, permissions } : user,
      ),
    });
  };

  // fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifsByUser(username);

      const mapped = await Promise.all(
        res.map(async notif => ({
          id: notif._id,
          type: notif.notifType,
          message:
            notif.notifType === 'INVITE'
              ? `You were invited to '${notif.projectName}' as a ${notif.role?.toLowerCase() || 'collaborator'}`
              : `The project '${notif.projectName}' was deleted`,
          projectId: notif.projectId,
          role: notif.role,
          actions: notif.notifType === 'INVITE' ? ['Accept', 'Decline'] : [],
        })),
      );

      setNotifications(mapped);
    } catch (err) {
      throw new Error(err.error);
    }
  }, [username]);

  // delete a notification
  const handleDeleteNotification = async notifId => {
    try {
      await deleteNotification(username, notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      throw new Error('Failed', err.error);
    }
  };
  // get user notifications
  useEffect(() => {
    if (!username) return;

    fetchNotifications();
  }, [username, fetchNotifications]);

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
    const removedUser = newProject.sharedUsers.find(user => user._id === userId);
    setNewProject({
      ...newProject,
      sharedUsers: newProject.sharedUsers.filter(user => user._id !== userId),
    });
    // Add the removed user back to filteredUsers
    setFilteredUsers(prev => [...prev, removedUser]);
  };

  // adding a new project to the users dashboard
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
        type: 'doc',
        sharedUsers: newProject.sharedUsers.map(user => ({
          username: user.username,
          role: user.permissions?.toUpperCase() || 'EDITOR',
        })),
      };
      try {
        const requestBody = {
          name: project.name,
          actor: username,
          collaborators: project.sharedUsers,
        };

        const addedProject = await createProject(requestBody.name, requestBody.actor, []);

        setProjects([addedProject, ...projects]);
        setNewProject({
          id: Date.now(),
          name: '',
          type: 'doc',
          sharedUsers: [],
        });
        await Promise.all(
          requestBody.collaborators.map(sharedUser =>
            sendNotificationToUser(sharedUser.username, {
              projectId: addedProject._id,
              notifType: 'INVITE',
              role: sharedUser.role || 'EDITOR',
              projectName: addedProject.name,
            }),
          ),
        );
        closeAndResetForm();
      } catch (err) {
        throw new Error(`Error when adding project ${err}`);
      }
    }
  };

  // remove a project -> this needs to be changed to correctly move to trash. right now the projects who are removed do not go to garbage
  const deleteProject = async id => {
    try {
      // eslint-disable-next-line no-alert
      // const confirmed = window.confirm('Are you sure you want to permanently delete this project?');
      // if (!confirmed) return;
      await deleteProjectById(id, userC.username);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      throw new Error(err);
    }
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
              CDE
            </div>
            <span className='fs-5 text-dark'>Projects</span>
          </div>
          {/* Search Bar */}
          <div className='d-flex justify-content-center align-items-center'>
            <div className='position-relative align-items-right'></div>
          </div>
          <div className='ms-3'></div>
          <div className='position-relative ms-3'>
            <button
              className='btn btn-primary d-flex align-items-center justify-content-center p-2'
              style={{
                borderRadius: '0.375rem', // Rounded like Bootstrap buttons, but square-ish
                width: '40px',
                height: '40px',
              }}
              onClick={async () => {
                setShowNotifications(prev => {
                  const next = !prev;
                  if (next) {
                    fetchNotifications();
                  }
                  return next;
                });
                if (userC) fetchData();
              }}>
              <FiMail size={18} />
            </button>

            {showNotifications && (
              <div
                className='position-absolute bg-white shadow rounded p-3'
                style={{
                  top: '2.75rem',
                  right: 0,
                  width: '300px',
                  zIndex: 10,
                }}>
                <h6 className='mb-2'>Notifications</h6>
                {notifications.length === 0 ? (
                  <p className='text-muted'>No new notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className='border-bottom pb-2 mb-2 position-relative'>
                      {/* 'X' button for DELETE notifications only */}
                      {n.type === 'DELETE' && (
                        <button
                          className='btn btn-sm btn-light position-absolute top-0 end-0'
                          style={{ border: 'none', fontSize: '1rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleDeleteNotification(n.id)}>
                          ×
                        </button>
                      )}

                      <p className='mb-1 pe-3'>{n.message}</p>

                      <div className='d-flex gap-2'>
                        {n.actions.includes('Accept') && (
                          <button
                            className='btn btn-sm btn-success'
                            onClick={() => handleNotificationAction(n.id, 'accept')}>
                            Accept
                          </button>
                        )}
                        {n.actions.includes('Decline') && (
                          <button
                            className='btn btn-sm btn-danger'
                            onClick={() => handleNotificationAction(n.id, 'decline')}>
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
                {searchUsername.trim() !== '' && filteredUsers.length > 0 && (
                  <div className='mb-3'>
                    {filteredUsers.map(user => (
                      <div
                        key={user._id}
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
                    <label className='form-label'>Invite Users</label>
                    {newProject.sharedUsers.map(user => (
                      <div
                        key={user._id}
                        className='d-flex align-items-center justify-content-between mb-2'>
                        <div className='d-flex align-items-center'>
                          <FiUser className='me-2' />
                          <span>{user.username}</span>
                        </div>
                        <div className='d-flex align-items-center'>
                          <select
                            value={user.permissions}
                            onChange={e => updateUserPermissions(user._id, e.target.value)}
                            className='form-select form-select-sm me-2'
                            style={{ minWidth: '90px' }}>
                            <option value='viewer'>Viewer</option>
                            <option value='editor'>Editor</option>
                          </select>
                          <button
                            onClick={() => removeSharedUser(user._id)}
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
          <li className='nav-item'></li>
        </ul>

        {/* All Projects */}
        <div className='mb-5'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h2 className='mb-0'></h2>
            <button onClick={() => setShowAddForm(true)} className='btn btn-primary'>
              Add Project
            </button>
          </div>
          {projects.filter(project => activeTab !== 'starred' || project.starred).length > 0 ? (
            <div className='row row-cols-1 row-cols-md-3 g-4'>
              {projects
                .filter(project => activeTab !== 'starred' || project.starred)
                .map(project => (
                  <div className='col' key={project._id}>
                    <ProjectCard project={project} onDelete={() => deleteProject(project._id)} />
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
      </main>
    </div>
  );
};

export default ProjectDashboard;
