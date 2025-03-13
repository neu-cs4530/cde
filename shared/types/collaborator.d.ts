import { User } from './user.d.ts';

/**
 * Type representing a collaborator's role in a project.
 * - `OWNER`: Project owner, has all permissions.
 * - `EDITOR`: Project editor, has editing and creation/deletion permissions.
 * - `VIEWER`: Project viewer, has viewing and commenting permissions.
 */
export type CollaboratorRole = 'OWNER' | 'EDITOR' | 'VIEWER';

/**
 * Represents a project collaborator.
 * - `userId`: The ObjectId of the associated user.
 * - `role`: The user's role as a project collaborator.
 */
export interface Collaborator {
  userId: ObjectId;
  role: CollaboratorRole;
}

/**
 * Represents a fully populated collaborator from the database.
 * - `user`: A populated `User` object.
 */
export interface PopulatedCollaborator extends Omit<Collaborator, '_id'> {
  user: User;
}
