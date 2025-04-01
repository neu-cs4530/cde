import ProjectStateModel from '../../models/projectStates.model';
import {
  ProjectState,
  ProjectStateResponse,
  PopulatedDatabaseProjectState,
  ProjectFile,
  DatabaseProjectState,
} from '../../types/types';

/**
 * Saves a new project state to the database.
 * @param {ProjectState} state - The project state object being saved containing all project state data.
 * @returns {Promise<ProjectStateResponse>} - Resolves with the saved project state object or an error message.
 */
export const saveProjectState = async (state: ProjectState): Promise<ProjectStateResponse> => {
  try {
    const result: DatabaseProjectState = await ProjectStateModel.create(state);

    if (!result) {
      throw Error('Failed to save project state');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving project state: ${error}` };
  }
};

/**
 * Deletes a project state by its ID.
 * @param {string} stateId - The ID of the project state object being deleted.
 * @returns {Promise<ProjectStateResponse>} - Resolves with the deleted project state object or an error message.
 */
export const deleteProjectStateById = async (stateId: string): Promise<ProjectStateResponse> => {
  try {
    const deletedProjectState: DatabaseProjectState | null =
      await ProjectStateModel.findOneAndDelete({
        _id: stateId,
      });

    if (!deletedProjectState) {
      throw Error('Error deleting project state');
    }

    return deletedProjectState;
  } catch (error) {
    return { error: `Error occurred when finding project state: ${error}` };
  }
};

/**
 * Updates an existing project state with the provided fields.
 * @param {string} stateId - The ID of the project state object being updated.
 * @param {Partial<ProjectState>} updates - A partial object containing the fields being updated and their new values.
 * @returns {Promise<ProjectStateResponse>} - Resolves with the updated project state object or an error message.
 */
export const updateProjectState = async (
  stateId: string,
  updates: Partial<ProjectState>,
): Promise<ProjectStateResponse> => {
  try {
    const pushFields: Record<string, unknown> = {};
    const setFields: Record<string, unknown> = {};

    for (const key in updates) {
      if (['files'].includes(key)) {
        pushFields[key] = updates[key as keyof ProjectState];
      } else {
        setFields[key] = updates[key as keyof ProjectState];
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
            pushFields[key] = updates[key as keyof ProjectState];
          } else {
            setFields[key] = updates[key as keyof ProjectState];
          }
        }
      }
    }
    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }

    const updatedProjectState: DatabaseProjectState | null =
      await ProjectStateModel.findOneAndUpdate({ _id: stateId }, updateQuery, { new: true });

    if (!updatedProjectState) {
      throw Error('Error updating project state');
    }

    return updatedProjectState;
  } catch (error) {
    return { error: `Error occurred when updating project state: ${error}` };
  }
};

/**
 * Retrieves a project state by its ID.
 * @param {string} stateId - The ID of the project state object being retrieved.
 * @returns {Promise<ProjectStateResponse>} - Resolves with the retrieved project state object or an error message.
 */
export const getProjectStateById = async (stateId: string): Promise<ProjectStateResponse> => {
  try {
    const projectState: DatabaseProjectState | null = await ProjectStateModel.findOne({
      _id: stateId,
    });

    if (!projectState) {
      throw Error('Project state not found');
    }

    return projectState;
  } catch (error) {
    return { error: `Error occurred when finding project state: ${error}` };
  }
};

/**
 * Filters files in a project state by a search string.
 * @param {PopulatedDatabaseProjectState} state - The project state being searched.
 * @param {string} search - The string the user is searching for.
 * @returns {ProjectFile} - Returns the found project file object or an error messge.
 */
export const filterProjectStateFilesBySearch = (
  state: PopulatedDatabaseProjectState,
  search: string,
): ProjectFile | { error: string } => {
  try {
    const { files } = state;

    for (const file of files) {
      if (file.name.toLowerCase().includes(search.toLowerCase())) {
        return file;
      }
    }

    return { error: 'No matching file found.' };
  } catch (error) {
    return { error: `Error searching files: ${error}` };
  }
};
