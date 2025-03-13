import { ObjectId } from 'mongodb';
import { ProjectFile } from './projectFile.d.ts';
import { Collaborator } from './collaborator.d.ts';

/**
 * Represents a collaborative project.
 * - `name`: The name of the project. 
 * - `creator`: The username of the project creator.
 * - `collaborators`: The collaborators on the project.
 * - `files`: The files in the project.
 */
export interface Project {
  name: string; 
  creator: string;
  collaborators: Collaborator[];
  files: ProjectFile[];
}

/**
 * Represents a project in the database.
 * - `name`: The name of the project. 
 * - `files`: The ObjectIds of all files in the project.
 * - `collaborators`: The collaborators on the project.
 */
export interface DatabaseProject extends Omit<Project, 'files'> {
  files: ObjectId[];
}
