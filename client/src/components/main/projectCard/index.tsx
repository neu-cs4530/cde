import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { DatabaseProject } from '../../../types/types';
import 'bootstrap/dist/css/bootstrap.min.css';

const TrashIcon = Icons.FiTrash2 as React.FC;

const ProjectCard = ({ project, onDelete }: { project: DatabaseProject; onDelete: () => void }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <div
      className='card shadow-sm hover-card position-relative'
      onClick={handleClick}
      style={{ cursor: 'pointer' }}>
      <button
        className='btn btn-sm text-danger position-absolute top-0 end-0 m-2'
        title='Delete Project'
        onClick={e => {
          e.stopPropagation();
          const confirmed = window.confirm('Are you sure you want to delete this project?');
          if (confirmed) onDelete();
        }}>
        <TrashIcon />
      </button>
      <div className='card-body project'>
        <div className='project-header'>
          <div className='fw-bold mb-2 project-name'>{project.name}</div>
          <div className='text-muted small mb-1 project-curr-state'>
            Added by: {project.creator}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
