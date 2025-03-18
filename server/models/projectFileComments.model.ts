import mongoose, { Model } from 'mongoose';
import projectFileCommentSchema from './schema/projectFileComment.schema';
import { DatabaseProjectFileComment } from '../types/types';

/**
 * Mongoose model for the `ProjectFileComment` collection.
 *
 * This model is created using the `ProjectFIleComment` interface and the 
 * `projectFileCommentSchema`, representing the `ProjectFileComment` 
 * collection in the MongoDB database, and provides an interface for interacting 
 * with the stored project file comments.
 *
 * @type {Model<DatabaseProjectFileComment>}
 */
const ProjectFileCommentModel: Model<DatabaseProjectFileComment> = 
mongoose.model<DatabaseProjectFileComment>(
  'ProjectFileComment',
  projectFileCommentSchema,
);

export default ProjectFileCommentModel;
