import mongoose, { Model } from 'mongoose';
import projectStateSchema from './schema/projectState.schema';
import { DatabaseProjectState } from '../types/types';

/**
 * Mongoose model for the `ProjectState` collection.
 *
 * This model is created using the `ProjectState` interface and the `projectStateSchema`,
 * representing the `ProjectState` collection stored in the MongoDB database, and provides
 * an interface for interacting with the stored project states.
 *
 * @type {Model<DatabaseProjectState>}
 */
const ProjectStateModel: Model<DatabaseProjectState> = mongoose.model<DatabaseProjectState>(
  'ProjectState',
  projectStateSchema,
);

export default ProjectStateModel;
