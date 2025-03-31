import { DatabaseProject } from '@fake-stack-overflow/shared/types/project';
import { DatabaseProjectFile } from '@fake-stack-overflow/shared/types/projectFile';
// import axios from 'axios';
import api from './config';

// project api url
const PROJECT_API_URL = `${process.env.REACT_APP_SERVER_URL}/project`;

//Create a new project.
/**
 *
 * @returns
 */
const createProject = async (projectData: Partial<DatabaseProject>): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/createProject`, projectData);
  if (res.status !== 200) {
    throw new Error(`Error when creating project`);
  }
  return res.data;
};

/**
 *
 * @param id
 * @returns
 */
//Delete a project by ID.
const deleteProjectById = async (id: string): Promise<DatabaseProject> => {
  const res = await api.delete(`${PROJECT_API_URL}/deleteProjectById/${id}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting project by id`);
  }
  return res.data;
};
/**
 *
 * @param id
 * @param projectData
 * @returns
 */
//Update project by ID.
const updateProjectById = async (
  id: string,
  projectData: Partial<DatabaseProject>,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/updateProjectById/${id}`, projectData);
  if (res.status !== 200) {
    throw new Error(`Error when updating project by id`);
  }
  return res.data;
};

/**
 *
 * @param user
 * @returns
 */
//Retrieve all projects for a specific user based on their username.
const getProjectsByUser = async (user: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getProjectsByUser/${user}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by user`);
  }
  return res.data;
};
/**
 *
 * @param projectId
 * @returns
 */
const getProjectById = async (projectId: string): Promise<DatabaseProject> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by id`);
  }
  return res.data;
};

/**
 *
 * @param user
 * @param projectId
 * @returns
 */
const addCollaboratorToProject = async (
  projectId: string,
  username: string,
  role: string,
): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/addCollaborator/`, {
    username,
    role,
  });
  if (res.status !== 200) {
    throw new Error(`Error when adding collaborators to the project`);
  }
  return res.data;
};

/**
 *
 * @param user
 * @param projectId
 * @returns
 */
const removeCollaboratorFromProject = async (
  projectId: string,
  username: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/removeCollaborator`, { username });
  if (res.status !== 200) {
    throw new Error(`Error when removing collaborators to the project`);
  }
  return res.data;
};

/**
 *
 * @param user
 * @param id
 * @param role
 * @returns
 */
const updateCollaboratorRole = async (
  projectId: string,
  username: string,
  role: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/updateCollaboratorRole`, {
    username,
    role,
  });
  if (res.status !== 200) {
    throw new Error(`Error when updating collaborator roles`);
  }
  return res.data;
};

/**
 *
 * @param id
 * @param projectId
 * @returns
 */
const getProjectStates = async (projectId: string): Promise<DatabaseProject> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getStates`);
  if (res.status !== 200) {
    throw new Error(`Error when getting project states`);
  }
  return res.data;
};

/**
 *
 * @param id
 * @param projectId
 * @returns
 */
const createProjectBackup = async (projectId: string): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createBackup`);
  if (res.status !== 200) {
    throw new Error(`Error when creating project backups`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param stateId
 * @returns
 */
const restoreStateById = async (projectId: string, stateId: string): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/restoreStateById/${stateId}`);
  if (res.status !== 200) {
    throw new Error(`Error when restoring state by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param stateId
 * @returns
 */
const deleteStateById = async (projectId: string, stateId: string): Promise<DatabaseProject> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/deleteStateById/${stateId}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting state by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @returns
 */
const getFiles = async (projectId: string): Promise<DatabaseProjectFile[]> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getFiles`);
  if (res.status !== 200) {
    throw new Error(`Error when getting files`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileDetails
 * @returns
 */
const createFile = async (
  projectId: string,
  fileDetails: Partial<DatabaseProjectFile>,
): Promise<DatabaseProjectFile> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createFile`, fileDetails);
  if (res.status !== 200) {
    throw new Error(`Error when creating file`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileId
 * @returns
 */
const deleteFileById = async (projectId: string, fileId: string): Promise<DatabaseProjectFile> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/deleteFileById/${fileId}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting file by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileId
 * @param fileDetails
 * @returns
 */
const updateFileById = async (
  projectId: string,
  fileId: string,
  fileDetails: Partial<DatabaseProjectFile>,
): Promise<DatabaseProjectFile> => {
  const res = await api.patch(
    `${PROJECT_API_URL}/${projectId}/updateFileById/${fileId}`,
    fileDetails,
  );
  if (res.status !== 200) {
    throw new Error(`Error when updating file by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileId
 * @returns
 */
const getFileById = async (projectId: string, fileId: string): Promise<DatabaseProjectFile> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting file by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileId
 * @param lineNumber
 * @param commentContent
 * @returns
 */
const addCommentToFile = async (
  projectId: string,
  fileId: string,
  lineNumber: number,
  commentContent: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/file/${fileId}/addComment`, {
    lineNumber,
    commentContent,
  });
  if (res.status !== 200) {
    throw new Error(`Error when adding comment to file`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @param fileId
 * @returns
 */
const deleteCommentsByLine = async (
  projectId: string,
  fileId: string,
  lineNumber: number,
): Promise<DatabaseProjectFile> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/file/${fileId}/deleteCommentsByLine`, {
    data: { lineNumber },
  });
  if (res.status !== 200) {
    throw new Error(`Error when deleting comments by line`);
  }
  return res.data;
};

/**
 *
 * @param fileId
 * @param projectId
 * @param commentId
 * @returns
 */
const deleteCommentById = async (
  fileId: string,
  projectId: string,
  commentId: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.delete(
    `${PROJECT_API_URL}/${projectId}/file/${fileId}/deleteCommentById/${commentId}`,
  );
  if (res.status !== 200) {
    throw new Error(`Error when deleting comments by id`);
  }
  return res.data;
};

export {
  createProject,
  deleteProjectById,
  updateProjectById,
  getProjectsByUser,
  getProjectById,
  addCollaboratorToProject,
  removeCollaboratorFromProject,
  updateCollaboratorRole,
  getProjectStates,
  createProjectBackup,
  restoreStateById,
  deleteStateById,
  getFiles,
  createFile,
  deleteFileById,
  updateFileById,
  getFileById,
  addCommentToFile,
  deleteCommentsByLine,
  deleteCommentById,
};
