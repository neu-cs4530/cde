import React, { useState } from 'react';
import './index.css';

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', type: 'doc' });

  const addProject = () => {
    if (newProject.name.trim()) {
      const project = {
        id: Date.now(),
        name: newProject.name,
        lastEdited: 'Just now',
        starred: false,
        type: 'doc'
      };
      setProjects([project, ...projects]);
      setNewProject({ name: '', type: 'doc' });
      setShowAddForm(false);
    }
  };

  const toggleStar = (id) => {
    setProjects(projects.map(p => 
      p.id === id ? {...p, starred: !p.starred} : p
    ));
  };

  const removeProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="project-dashboard">
      {/* Header */}
      <header className="project-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="project-logo">P</div>
          <span style={{ fontSize: '1.25rem', color: '#1f2937' }}>Projects</span>
          
          {/* Search Bar */}
          <div className="project-search">
            <input 
              type="text" 
              placeholder="Search projects" 
              className="search-input"
            />
            <svg className="search-icon" style={{ position: 'absolute', left: '0.75rem', top: '0.625rem', width: '1.25rem', height: '1.25rem', color: '#6b7280' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div style={{ marginLeft: '1rem' }}>
            <button 
              className="add-button-icon"
              onClick={() => setShowAddForm(true)}
              style={{ background: 'none', border: 'none', padding: '0.5rem', borderRadius: '9999px', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
{/* project */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Project</h3>
              <button onClick={() => setShowAddForm(false)} className="modal-close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                className="form-input"
                placeholder="Enter project name"
              />
            </div>
            <div className="form-footer">
              <button 
                onClick={() => setShowAddForm(false)}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={addProject}
                className="btn btn-primary"
                disabled={!newProject.name.trim()}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* main */}
      <main className="project-content">
        {/* tabs */}
        <div className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recently Opened
          </button>
          <button 
            className={`tab-button ${activeTab === 'starred' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('starred')}
          >
            Starred
          </button>
          <button 
            className={`tab-button ${activeTab === 'trash' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('trash')}
          >
            Trash
          </button>
        </div>
        
        {/* Recents*/}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">Quick Access</h2>
          {projects.filter(p => p.starred).length > 0 ? (
            <div className="project-grid">
              {projects.filter(p => p.starred).map(project => (
                <div key={project.id} className="project-card">
                  <div className="card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{project.name}</h3>
                    <p className="card-subtitle">{project.lastEdited}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-text">Star your important projects to see them here!</div>
              <button 
                onClick={() => setShowAddForm(true)} 
                className="btn btn-primary"
              >
                Add Your Project Here
              </button>
            </div>
          )}
        </div>
        
        {/* Projects */}
        <div>
          <div className="section-header">
            <h2 className="section-title">
              {activeTab === 'recent' && 'Recent Projects'}
              {activeTab === 'starred' && 'Starred Projects'}
              {activeTab === 'trash' && 'Trash'}
            </h2>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Project
            </button>
          </div>
          
          {projects.length > 0 ? (
            <table className="projects-table">
              <thead className="table-header">
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem 0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', color: '#6b7280', width: '1.5rem' }}>
                    <span className="sr-only">Star</span>
                  </th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', color: '#6b7280' }}>
                    Name
                  </th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', color: '#6b7280' }}>
                    Last Modified
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem 0.75rem 0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', color: '#6b7280', width: '2.5rem' }}>
                    <span className="sr-only">Actions</span>
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
                  <tr key={project.id} className="table-row">
                    <td className="row-icon">
                      <button onClick={() => toggleStar(project.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={project.starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: project.starred ? '#f59e0b' : '#d1d5db' }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </button>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div className="row-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb', marginRight: '0.75rem' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>{project.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }} className="row-subtitle">
                      {project.lastEdited}
                    </td>
                    <td className="row-actions">
                      <button 
                        onClick={() => removeProject(project.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#9ca3af' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="empty-title">No projects yet</h3>
              <p className="empty-text">Add your first project to get started</p>
              <button 
                onClick={() => setShowAddForm(true)} 
                className="btn btn-primary"
              >
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