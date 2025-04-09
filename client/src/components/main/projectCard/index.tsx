import { useNavigate } from 'react-router-dom';
import { DatabaseProject } from '../../../types/types';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * ProjectCard component displays a single project with all of its associated fields such as its name, creation data, current state, and all collaborators.
 *
 * @param project: The project object to display of type Database Project.
 */

const ProjectCard = ({ project }: { project: DatabaseProject }) => {
  const navigate = useNavigate();

  /**
   * Function to handle the navigation of a project.
   */
  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <div className='card shadow-sm hover-card' onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className='card-body project'>
        <div className='project-header'>
          <div className='fw-bold mb-2 project-name'>{project.name}</div>
          <div className='text-muted small mb-1 project-curr-state'>
            {' '}
            Added by: {project.creator}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
