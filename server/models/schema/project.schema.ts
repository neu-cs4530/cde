import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Project collection.
 *
 * This schema defines the structure for storing projects in the database.
 * Each project includes the following fields:
 * - `name`: The name of the project.
 * - `creator`: The username of the project creator.
 * - `collaborators`: An array of references to `User` documents that are project collaborators,
 *   as well as their role.
 * - `currentState`: A reference to a `ProjectState` document that represents the current state
 *   of the project's files.
 * - `savedStates`: An array of references to `ProjectState` documents associated with the project.
 */
const projectSchema: Schema = new Schema(
  {
    name: {
      type: String,
    },
    creator: {
      type: String,
    },
    collaborators: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
      },
    ],
    currentState: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectState',
    },
    savedStates: [{ type: Schema.Types.ObjectId, ref: 'ProjectState' }],
  },
  { collection: 'Project' },
);

export default projectSchema;
