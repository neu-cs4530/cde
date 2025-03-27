import ProjectFileCommentModel from '../../models/projectFileComments.model';
import ProjectFileModel from '../../models/projectFiles.model';
import { DatabaseProjectFile, ProjectFile, ProjectFileResponse } from '../../types/types';

/**
 * Saves a new project file to the database.
 * @param {ProjectFile} file - The project file object to be saved containing full file data.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the saved project file object or an error message.
 */
export const saveProjectFile = async (file: ProjectFile): Promise<ProjectFileResponse> => {
  try {
    const result: DatabaseProjectFile = await ProjectFileModel.create(file);

    if (!result) {
      throw Error('Failed to create project file');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving project file: ${error}` };
  }
};

/**
 * Deletes a project file by its ID.
 * @param {string} fileId - The ID of the project file to be deleted.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the deleted project file object or an error message.
 */
export const deleteProjectFileById = async (fileId: string): Promise<ProjectFileResponse> => {
  try {
    const deletedProjectFile: DatabaseProjectFile | null = await ProjectFileModel.findOneAndDelete({
      _id: fileId,
    });

    if (!deletedProjectFile) {
      throw Error('Error deleting project file');
    }

    return deletedProjectFile;
  } catch (error) {
    return { error: `Error occurred when finding project file: ${error}` };
  }
};

/**
 * Updates an existing project file with the provided fields.
 * @param {string} fileId - The ID of the project file to be updated.
 * @param {Partial<ProjectFile>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the updated project file object or an error message.
 */
export const updateProjectFile = async (
  fileId: string,
  updates: Partial<ProjectFile>,
): Promise<ProjectFileResponse> => {
  try {
    const pushFields: Record<string, unknown> = {};
    const setFields: Record<string, unknown> = {};

    for (const key in updates) {
      if (['comments'].includes(key)) {
        pushFields[key] = updates[key as keyof ProjectFile];
      } else {
        setFields[key] = updates[key as keyof ProjectFile];
      }
    }

    const updateQuery: {
      $push?: Record<string, unknown>;
      $set?: Record<string, unknown>;
    } = {};
    if (Object.keys(pushFields).length > 0) {
      updateQuery.$push = pushFields;

      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          if (['savedStates', 'collaborators'].includes(key)) {
            pushFields[key] = updates[key as keyof ProjectFile];
          } else {
            setFields[key] = updates[key as keyof ProjectFile];
          }
        }
      }
    }
    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }

    const updatedProjectFile: DatabaseProjectFile | null = await ProjectFileModel.findOneAndUpdate(
      { _id: fileId },
      updateQuery,
      { new: true },
    );

    if (!updatedProjectFile) {
      throw Error('Error updating project file');
    }

    return updatedProjectFile;
  } catch (error) {
    return { error: `Error occurred when updating project file: ${error}` };
  }
};

/**
 * Resolves all comments on a specific line in a project file.
 * @param {string} fileId - The ID of the project file where the comments to be resolved are.
 * @param {number} lineNumber - The line number the comments are on.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the updated project file object or an error message.
 */
export const resolveProjectFileCommentsByLine = async (
  fileId: string,
  lineNumber: number,
): Promise<ProjectFileResponse> => {
  try {
    const projectFile = await ProjectFileModel.findOne({ _id: fileId });

    if (!projectFile) {
      throw Error('Project file not found');
    }

    const commentsToDelete = await ProjectFileCommentModel.find({
      _id: { $in: projectFile.comments },
      lineNumber,
    });

    const commentIdsToDelete = commentsToDelete.map(c => c._id);

    await ProjectFileCommentModel.deleteMany({ _id: { $in: commentIdsToDelete } });

    const updatedProjectFile = await ProjectFileModel.findOneAndUpdate(
      { _id: fileId },
      { $pull: { comments: { $in: commentIdsToDelete } } },
      { new: true },
    );

    if (!updatedProjectFile) {
      throw Error('Failed to update project file after resolving comments');
    }

    return updatedProjectFile;
  } catch (error) {
    return { error: `Error occurred when resolving comments: ${error}` };
  }
};

/**
 * Retrieves a project file document by its ID.
 * @param fileId - The ID of the project file to retrieve.
 * @returns {Promise<ProjectFileResponse>} - The project file or an error message.
 */
export const getProjectFile = async (fileId: string): Promise<ProjectFileResponse> => {
    try {
      const file: DatabaseProjectFile | null = await ProjectFileModel.findById(fileId);
  
      if (!file) {
        throw new Error('File not found');
      }
  
      return file;
    } catch (error) {
      return { error: `Error retrieving file: ${error}` };
    }
  };
  