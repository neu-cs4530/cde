import {
    Project,
    ProjectResponse,
    CollaboratorRole,
  } from '../../types/types';
  
  /**
   * Saves a new project to the database.
   * @param {Project} project - The project object to be saved containing full project data.
   * @returns {Promise<ProjectResponse>} - Resolves with the saved project object or an error message.
   */
  export const saveProject = async (project: Project): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  
  /**
   * Deletes a project by its ID.
   * @param {string} projectId - The ID of the project object to be deleted.
   * @returns {Promise<ProjectResponse>} - Resolves with the deleted project object or an error message.
   */
  export const deleteProjectById = async (projectId: string): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  
  /**
   * Updates an existing project with the provided fields.
   * @param {string} projectId - The ID of the project to be updated.
   * @param {Partial<Project>} updates - An object containing the fields to update and their new values.
   * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
   */
  export const updateProject = async (
    projectId: string,
    updates: Partial<Project>,
  ): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  
  /**
   * Adds a collaborator to a project and updates the user accordingly.
   * @param {string} projectId - The ID of the project the collaborator is being added to.
   * @param {string} username - The username of the user to be added as a collaborator.
   * @param {CollaboratorRole} role - The role of the added collaborator: either owner, editor, or viewer.
   * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
   */
  export const addProjectCollaborator = async (
    projectId: string,
    username: string,
    role: CollaboratorRole,
  ): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  
  /**
   * Retrieves a project by its ID.
   * @param {string} projectId - The ID of the project being retrieved.
   * @returns {Promise<ProjectResponse>} - Resolves with the desired project object or an error message.
   */
  export const getProjectById = async (projectId: string): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  
  /**
   * Reverts a project to a previously saved state by state ID.
   * @param {string} projectId - The ID of the project being backed up.
   * @param {string} stateId - The ID of the state to revert to.
   * @returns {Promise<ProjectResponse>} - Resolves with the reverted project object or an error message.
   */
  export const revertProjectToState = async (
    projectId: string,
    stateId: string,
  ): Promise<ProjectResponse> => {
    // TODO: complete function, delete below line
    return Promise.resolve({} as ProjectResponse);
  };
  