import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    setProjects(projects.map(p => p.id === id ? {...p, starred: !p.starred} : p));
  };

  const removeProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="container mt-4">
      <header className="d-flex justify-content-between align-items-center mb-3">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>New Project</button>
      </header>
      
      {showAddForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Project</h5>
                <button className="btn-close" onClick={() => setShowAddForm(false)}></button>
              </div>
              <div className="modal-body">
                <input type="text" className="form-control" placeholder="Enter project name" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addProject} disabled={!newProject.name.trim()}>Add Project</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ul className="nav nav-tabs">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>Recent</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'starred' ? 'active' : ''}`} onClick={() => setActiveTab('starred')}>Starred</button></li>
      </ul>
      
      <div className="mt-3">
        {projects.length > 0 ? (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Star</th>
                <th>Name</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>
                    <button className="btn btn-sm" onClick={() => toggleStar(project.id)}>
                      {project.starred ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>{project.name}</td>
                  <td>{project.lastEdited}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeProject(project.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">No projects yet. Start by adding a new project.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
