import { Schema } from 'mongoose';
/**
 * Mongoose schema for the ProjectState collection.
 *
 * This schema defines the structure for storing project states in the database.
 * Each project state includes the following fields:
 * - `files`: An array of references to `ProjectFile` documents associated with the project state.
 */
const projectStateSchema: Schema = new Schema(
  {
    files: [{ type: Schema.Types.ObjectId, ref: 'ProjectFile' }],
  },
  { collection: 'ProjectState' },
);

export default projectStateSchema;
