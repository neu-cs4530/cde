import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseProject } from '../../../types/types';
import { getMetaData } from '../../../tool';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserContext from '../../../contexts/UserContext';
import { useContext } from 'react';

/**
 * ProjectCard component displays a single project with all of its associated fields such as its name, creation data, current state, and all collaborators.
 *
 * @param project: The project object to display.
 */

const ProjectCard = ({ project }: { project: DatabaseProject }) => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <div className='card shadow-sm hover-card' onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className='card-body project'>
        <div className='project-header'>
          <div className='fw-bold mb-2 project-name'>{project.name}</div>
          <div className='text-muted small mb-1 project-creation'>
            {getMetaData(project.createdAt)}
          </div>
          <div className='text-muted small mb-1 project-curr-state'>
            {project.currentState ? project.currentState.toString() : 'draft'}
          </div>
          <div className='text-muted small project-collaborators'>
            Collaborators:{' '}
            {project.collaborators?.length
              ? project.collaborators?.map(id => id.toString()).join(', ')
              : 'No collaborators'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
