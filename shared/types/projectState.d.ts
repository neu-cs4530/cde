import { ObjectId } from 'mongodb';
import { ProjectFile, PopulatedDatabaseProjectFile } from './projectFile';

/**
 * Represents the saved state of a project's files.
 * - `files`: The files in the project state.
 */
export interface ProjectState {
  files: ProjectFile[];
}

/**
 * Represents a project state in the database.
 * - `_id`: Unique identifier for the project state, provided by MongoDB.
 * - `files`: The ObjectIds of all files in the project state.
 * - `createdAt`: Timestamp for when the project state was created (set by Mongoose).
 * - `updatedAt`: Timestamp for when the project state was last updated (set by Mongoose).
 */
export interface DatabaseProjectState extends Omit<ProjectState, 'project' | 'files'> {
  _id: ObjectId;
  files: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a fully populated project state from the database.
 * - `files`: An array of populated `DatabaseProjectFile` objects.
 */
export interface PopulatedDatabaseProjectState extends Omit<DatabaseProjectState, 'files'> {
  files: PopulatedDatabaseProjectFile[];
}
