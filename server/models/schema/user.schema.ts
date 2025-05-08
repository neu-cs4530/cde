import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    notifications: {
      type: [
        new Schema(
          {
            projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
            notifType: { type: String },
            role: { type: String, required: false },
            projectName: { type: String, required: false },
          },
          { _id: true },
        ),
      ],
      default: [],
      required: false,
    },
  },
  { collection: 'User' },
);

export default userSchema;
