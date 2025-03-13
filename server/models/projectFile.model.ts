import mongoose, { Model } from 'mongoose';
import projectFileSchema from './schema/projectFile.schema';
import { DatabaseProjectFile } from '../types/types';

/**
 * Mongoose model for `ProjectFile` collection.
 *
 * This model is created using the `ProjectFile` interface and the `projectFileSchema`,
 * representing the `ProjectFile` collection in the MongoDB database, and provides an interface
 * for interacting with the stored project files.
 *
 * @type {Model<DatabaseProjectFile>}
 */
const ProjectFileModel: Model<DatabaseProjectFile> = mongoose.model<DatabaseProjectFile>(
  'ProjectFile',
  projectFileSchema,
);

export default ProjectFileModel;
