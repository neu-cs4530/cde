import { ObjectId } from 'mongodb';
import { ProjectState, PopulatedDatabaseProjectState } from './projectState';
import { Collaborator, PopulatedCollaborator } from './collaborator';

/**
 * Represents a collaborative project.
 * - `name`: The name of the project.
 * - `creator`: The username of the project creator.
 * - `collaborators`: The collaborators on the project.
 * - `currentState`: The current state of the files in the project.
 * - `savedStates`: All saved states of the files in the project.
 */
export interface Project {
  name: string;
  creator: string;
  collaborators: Collaborator[];
  currentState: ProjectState;
  savedStates: ProjectState[];
}

/**
 * Represents a project in the database.
 * - `_id`: Unique identifier for the project, provided by MongoDB.
 * - `name`: The name of the project.
 * - `collaborators`: The ObjectIds of all users that are collaborators on the project.
 * - `currentState`: The ObjectId of the corresponding current project state.
 * - `savedStates`: The ObjectIds of all saved states of the files in the project.
 * - `createdAt`: Timestamp for when the project was created (set by Mongoose).
 */
export interface DatabaseProject extends Omit<Project, 'currentState' | 'savedStates'> {
  _id: ObjectId;
  currentState: ObjectId;
  savedStates: ObjectId[];
  createdAt: Date;
}

/**
 * Represents a fully populated project from the database.
 * - `collaborators`: An array of populated `PopulatedCollaborator` objects.
 * - `currentState`: A populated `DatabaseProjectState` object.
 * - `savedStates`: An array of populated `DatabaseProjectState` objects.
 */
export interface PopulatedDatabaseProject
extends Omit<DatabaseProject, 'collaborators' | 'currentState' | 'savedStates'> {
  collaborators: PopulatedCollaborator[];
  currentState: PopulatedDatabaseProjectState;
  savedStates: PopulatedDatabaseProjectState[];
}
