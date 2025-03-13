import { User } from './user.d.ts';

/**
 * Type representing a collaborator's role in a project.
 * - `OWNER`: Project owner, has all permissions.
 * - `EDITOR`: Project editor, has editing and creation/deletion permissions.
 * - `VIEWER`: Project viewer, has viewing and commenting permissions.
 */
export type CollaboratorRole = 'OWNER' | 'EDITOR' | 'VIEWER';

/**
 * Represents a project collaborator, including user data and role.
 * - `username`: The unique username of the user.
 * - `password`: The user's password.
 * - `dateJoined`: The date when the user registered.
 * - `biography`: A short description or bio of the user (optional).
 * - `role`: The user's role as a project collaborator.
 */
export interface Collaborator extends User {
  role: CollaboratorRole;
}
