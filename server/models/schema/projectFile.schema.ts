import { Schema } from 'mongoose';
/**
 * Mongoose schema for the ProjectFile collection.
 *
 * This schema defines the structure for storing project files in the database.
 * Each project file includes the following fields:
 * - `name`: The file's name, including any extension.
 * - `fileType`: The file's type, being one of PYTHON, JAVA, JAVASCRIPT, or OTHER.
 * - `contents`: The contents of the file as a string.
 * - `comments`: An array of references to `ProjectFileComment` documents that are
 *   comments on the file.
 */
const projectFileSchema: Schema = new Schema(
  {
    name: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['PYTHON', 'JAVA', 'JAVASCRIPT', 'OTHER'],
    },
    contents: {
      type: String,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'ProjectFileComment' }],
  },
  { collection: 'ProjectFile' },
);

export default projectFileSchema;
