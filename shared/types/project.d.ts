import { ObjectId } from 'mongodb';
import { ProjectFile, DatabaseProjectFile } from './projectFile';
import { Collaborator, PopulatedCollaborator } from './collaborator';

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
 * - `collaborators`: The ObjectIds of all users that are collaborators on the project.
 * - `_id`: Unique identifier for the project, provided by MongoDB.
 */
export interface DatabaseProject extends Omit<Project, 'files'> {
  _id: ObjectId;
  files: ObjectId[];
}

/**
 * Represents a fully populated project from the database.
 * - `collaborators`: An array of populated `PopulatedCollaborator` objects.
 * - `files`: An array of populated `DatabaseProjectFile` objects.
 */
export interface PopulatedDatabaseProject extends Omit<DatabaseProject, 'collaborators' | 'files'> {
  collaborators: PopulatedCollaborator[];
  files: DatabaseProjectFile[];
}
