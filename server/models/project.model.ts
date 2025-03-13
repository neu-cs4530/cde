import mongoose, { Model } from 'mongoose';
import projectSchema from './schema/project.schema';
import { DatabaseProject } from '../types/types';

/**
 * Mongoose model for the `Project` collection.
 *
 * This model is created using the `Project` interface and the `projectSchema`, representing the 
 * `Project` collection stored in the MongoDB database, and provides an interface for interacting 
 * with the stored projects.
 *
 * @type {Model<DatabaseProject>}
 */
const ProjectModel: Model<DatabaseProject> = mongoose.model<DatabaseProject>(
  'Project',
  projectSchema,
);

export default ProjectModel;
