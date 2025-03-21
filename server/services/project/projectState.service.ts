import {
    ProjectState,
    ProjectStateResponse,
    PopulatedDatabaseProjectState,
    ProjectFile,
  } from '../../types/types';
  
  /**
   * Saves a new project state to the database.
   * @param {ProjectState} state - The project state object being saved containing all project state data.
   * @returns {Promise<ProjectStateResponse>} - Resolves with the saved project state object or an error message.
   */
  export const saveProjectState = async (state: ProjectState): Promise<ProjectStateResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectStateResponse);
  };
  
  /**
   * Deletes a project state by its ID.
   * @param {string} stateId - The ID of the project state object being deleted.
   * @returns {Promise<ProjectStateResponse>} - Resolves with the deleted project state object or an error message.
   */
  export const deleteProjectStateById = async (stateId: string): Promise<ProjectStateResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectStateResponse);
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
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectStateResponse);
  };
  
  /**
   * Retrieves a project state by its ID.
   * @param {string} stateId - The ID of the project state object being retrieved.
   * @returns {Promise<ProjectStateResponse>} - Resolves with the retrieved project state object or an error message.
   */
  export const getProjectStateById = async (stateId: string): Promise<ProjectStateResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectStateResponse);
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
  ): ProjectFile => {
    // TODO: complete function, delete below line
    return {} as ProjectFile;
  };
  