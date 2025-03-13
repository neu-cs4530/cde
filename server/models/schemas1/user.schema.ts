import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `email`
 * - `theme`
 * - `createdAt`
 * - `updatedAt`
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateJoined: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    createdAt: {
      type: Date,
      default: Date.now 
    },
    updatedAt: {
      type: Date,
      default: Date.now 
    },
  },
  { collection: 'User' },
);

export default userSchema;
