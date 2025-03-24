import {
  ProjectFileComment,
  ProjectFileCommentResponse,
  DatabaseProjectFileComment,
} from '../../types/types';

/**
 * Saves a new comment on a project file to the database.
 * @param {ProjectFileComment} comment - The project file comment object containing all comment data.
 * @returns {Promise<ProjectFileCommentResponse>} - Resolves with the project file comment object or an error message.
 */
export const saveProjectFileComment = async (
  comment: ProjectFileComment,
): Promise<ProjectFileCommentResponse> =>
  // TODO: complete function, delete below line
  Promise.resolve({} as ProjectFileCommentResponse);

/**
 * Deletes a comment on a project file by its ID.
 * @param {string} commentId - The ID of the comment being deleted.
 * @returns {Promise<ProjectFileCommentResponse>} - Resolves with the deleted project file comment object or an error message.
 */
export const deleteProjectFileCommentById = async (
  commentId: string,
): Promise<ProjectFileCommentResponse> =>
  // TODO: complete function, delete below line
  Promise.resolve({} as ProjectFileCommentResponse);

/**
 * Adds an existing comment to a project file.
 * @param {string} fileId - The ID of the comment being added to a project file.
 * @param {DatabaseProjectFileComment} comment - The object containing all of the comment data.
 * @returns {Promise<ProjectFileCommentResponse>} - Resolves with the added project file comment object or an errro message.
 */
export const addCommentToFile = async (
  fileId: string,
  comment: DatabaseProjectFileComment,
): Promise<ProjectFileCommentResponse> =>
  // TODO: complete function, delete below line
  Promise.resolve({} as ProjectFileCommentResponse);
