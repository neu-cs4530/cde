import { Request } from 'express';
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

/**
 * A type representing the possible responses for a ProjectState operation.
 * - Either a `DatabaseProjectState` object or an error message.
 */
export type ProjectStateResponse = DatabaseProjectState | { error: string };

/**
 * Express request for updating project states, containing project and state IDs,
 * and the username of the actor.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `stateId`: The ID of the state provided as a route parameter.
 * - `actor`: The username of the actor submitted in the request (body).
 */
export interface ProjectStateRequest extends Request {
  params: {
    projectId: string;
    stateId: string;
  };
  body: {
    actor: string;
  };
}
