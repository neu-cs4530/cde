import ProjectFileCommentModel from '../../models/projectFileComments.model';
import ProjectFileModel from '../../models/projectFiles.model';
import {
  ProjectFileComment,
  ProjectFileCommentResponse,
  DatabaseProjectFileComment,
  DatabaseProjectFile,
  ProjectFileResponse,
} from '../../types/types';

/**
 * Saves a new comment on a project file to the database.
 * @param {ProjectFileComment} comment - The project file comment object containing all comment data.
 * @returns {Promise<ProjectFileCommentResponse>} - Resolves with the project file comment object or an error message.
 */
export const saveProjectFileComment = async (
  comment: ProjectFileComment,
): Promise<ProjectFileCommentResponse> => {
  try {
    const result: DatabaseProjectFileComment = await ProjectFileCommentModel.create(comment);

    if (!result) {
      throw Error('Failed to save file comment');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving file comment: ${error}` };
  }
};

/**
 * Deletes a comment on a project file by its ID.
 * @param {string} commentId - The ID of the comment being deleted.
 * @returns {Promise<ProjectFileCommentResponse>} - Resolves with the deleted project file comment object or an error message.
 */
export const deleteProjectFileCommentById = async (
  commentId: string,
): Promise<ProjectFileCommentResponse> => {
  try {
    const deletedProjectFileComment: DatabaseProjectFileComment | null =
      await ProjectFileCommentModel.findOneAndDelete({
        _id: commentId,
      });

    if (!deletedProjectFileComment) {
      throw Error('Error deleting project file comment');
    }

    return deletedProjectFileComment;
  } catch (error) {
    return { error: `Error occurred when finding project file comment: ${error}` };
  }
};

/**
 * Adds an existing comment to a project file.
 * @param {string} fileId - The ID of the comment being added to a project file.
 * @param {DatabaseProjectFileComment} comment - The object containing all of the comment data.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the added project file comment object or an errro message.
 */
export const addCommentToFile = async (
  fileId: string,
  comment: DatabaseProjectFileComment,
): Promise<ProjectFileResponse> => {
  try {
    const updatedProjectFile: DatabaseProjectFile | null = await ProjectFileModel.findOneAndUpdate(
      { _id: fileId },
      { $push: { comments: comment } },
      { new: true },
    );

    if (!updatedProjectFile) {
      throw Error('Error updating file');
    }

    return updatedProjectFile;
  } catch (error) {
    return { error: `Error occurred when updating file: ${error}` };
  }
};

/**
 * Retrieves a project file comment document by its ID.
 * @param commentFileId - The ID of the project file comment to retrieve.
 * @returns {Promise<ProjectFileCommentResponse>} - The project file comment or an error message.
 */
export const getProjectFileComment = async (commentFileId: string): Promise<ProjectFileCommentResponse> => {
    try {
      const fileComment: DatabaseProjectFileComment | null = await ProjectFileCommentModel.findById(commentFileId);
  
      if (!fileComment) {
        throw new Error('File comment not found');
      }
  
      return fileComment;
    } catch (error) {
      return { error: `Error retrieving file comment: ${error}` };
    }
  };
