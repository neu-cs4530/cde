import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DatabaseProject } from '../../../types/types';
import { getMetaData } from '../../../tool';
// import { createProjectBackup } from '../../../services/projectService';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * ProjectCard component displays a single project with all of its associated fields such as its name, creation data, current state, and all collaborators.
 *
 * @param project: The project object to display.
 */

const ProjectCard = ({ project }: { project: DatabaseProject }) => {
  const navigate = useNavigate();
  // const { pid } = useParams();
  // const [textErr, setTextErr] = useState<string>('');
  // const [projectID, setprojectID] = useState<string>('');

  // useEffect(() => {
  //   if (!pid) {
  //     setTextErr('project ID is missing.');
  //     navigate('/home');
  //     return;
  //   }

  //   setprojectID(pid);
  // }, [pid, navigate]);

  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  // eslint-disable-next-line arrow-body-style
  // useEffect(() => {
  //   return () => {
  //     if (project && project.creator) {
  //       createProjectBackup(project._id, project.creator)
  //         .then(() => console.log('Project saved successfully'))
  //         .catch(error => console.error('Failed to save project', error));
  //     }
  //   };
  // }, [project._id, project.creator]);

  return (
    <div className='card shadow-sm hover-card' onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className='card-body project'>
        <div className='project-header'>
          <div className='fw-bold mb-2 project-name'>{project.name}</div>
          {/* <div className='text-muted small mb-1 project-creation'>
            {{project.createdAt ? getMetaData(project.createdAt) : 'No date'}}
          </div> */}
          <div className='text-muted small mb-1 project-curr-state'>
            {' '}
            Added by: {project.creator}
          </div>
          {/* <div className='text-muted small project-collaborators'>
            Collaborators:{' '}
            {project.collaborators?.filter(c => c.userId !== project.creator).length
              ? project.collaborators
                  .filter(c => c.userId !== project.creator)
                  .map(c => c.userId) // Replace with `c.username` if available
                  .join(', ')
              : 'No collaborators'}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
