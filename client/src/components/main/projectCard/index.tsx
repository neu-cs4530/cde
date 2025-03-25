import React from 'react';
import './index.css';
import { DatabaseProject } from '../../../types/types';
import { getMetaData } from '../../../tool';

/**
 * ProjectCard component displays a single project with all of its associated fields such as its name, creation data, current state, and all collaborators.
 *
 * @param project: The project object to display.
 */
const ProjectCard = ({ project }: { project: DatabaseProject }) => (
    <div className='project'>
        <div className='project-header'>
            <div className='project-name'>{project.name}</div>
            <div className='project-creation'>{getMetaData(project.createdAt)}</div>
            <div className='project-curr-state'>{project.currentState.toString()}</div>
            <div className='project-collaborators'>Collaborators: {project.collaborators?.map(id => id.toString()).join(', ')}</div>
        </div>
    </div>
);

export default ProjectCard;