import { Schema } from 'mongoose';
/**
 * Mongoose schema for the ProjectFile collection.
 *
 * This schema defines the structure for storing project files in the database.
 * Each project file includes the following fields:
 * - ``: 
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
    }
  },
  { collection: 'ProjectFile' },
);

export default projectFileSchema;
