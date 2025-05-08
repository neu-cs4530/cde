import { Schema } from 'mongoose';

/**
 * Mongoose schema for the ProjectFileComment collection.
 *
 * This schema defines the structure of comment used in project files in the database.
 * Each comment includes the following fields:
 * - `text`: The content of the comment.
 * - `commentBy`: The username of the user who commented.
 * - `commentDateTime`: The date and time when the comment was posted.
 * - `lineNumber`: The line number the comment is on.
 */
const projectFileCommentSchema: Schema = new Schema(
  {
    text: {
      type: String,
    },
    commentBy: {
      type: String,
    },
    commentDateTime: {
      type: Date,
    },
    lineNumber: {
      type: Number,
    },
  },
  { collection: 'ProjectFileComment' },
);

export default projectFileCommentSchema;
