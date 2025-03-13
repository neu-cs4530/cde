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
 * - `_id`: The ObjectId of the associated user.
 * - `role`: The user's role as a project collaborator.
 */
export interface Collaborator {
  _id: ObjectId;
  role: CollaboratorRole;
}
