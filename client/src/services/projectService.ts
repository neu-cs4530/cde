import { DatabaseProject, CreateProjectRequest } from '@fake-stack-overflow/shared/types/project';
import { DatabaseProjectFile } from '@fake-stack-overflow/shared/types/projectFile';
import { RequestCollaborator } from '@fake-stack-overflow/shared/types/collaborator';
import api from './config';

// project api url
const PROJECT_API_URL = `${process.env.REACT_APP_SERVER_URL}/project`;

// Create a new project.
/**
 *
 * @returns
 */
const createProject = async (
  name: string,
  actor: string,
  collaborators?: RequestCollaborator[],
): Promise<DatabaseProject> => {
  const projectData: CreateProjectRequest['body'] = {
    name,
    actor,
    collaborators,
  };

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
// Delete a project by ID.
const deleteProjectById = async (id: string, actor: string): Promise<DatabaseProject> => {
  const data = { actor };
  const res = await api.delete(`${PROJECT_API_URL}/deleteProjectById/${id}`, {
    data,
  });
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
// Update project by ID.
const updateProjectById = async (
  projectId: string,
  actor: string,
  name?: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/updateProjectById/${projectId}`, { actor, name });
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
// Retrieve all projects for a specific user based on their username.
const getProjectsByUser = async (user: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getProjectsByUser${user}`);
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
const getProjectById = async (projectId: string, actor: string): Promise<DatabaseProject> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}`, { data });
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
  actor: string,
  collaborator: RequestCollaborator,
): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/addCollaborator/${collaborator}`, {
    actor,
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
  actor: string, // person removing
  username: string, // user to be removed
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/removeCollaborator/${username}`, {
    actor,
  });
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
  actor: string,
  username: string,
  role: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(
    `${PROJECT_API_URL}/${projectId}/updateCollaboratorRole/${username}`,
    {
      actor,
      role,
    },
  );
  if (res.status !== 200) {
    throw new Error(`Error when updating collaborator roles`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @returns
 */
const getProjectStates = async (projectId: string, actor: string): Promise<DatabaseProject> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getStates`, { data });
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
const createProjectBackup = async (projectId: string, actor: string): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createBackup`, { actor });
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
const restoreStateById = async (
  projectId: string,
  stateId: string,
  actor: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/restoreStateById/${stateId}`, {
    actor,
  });
  if (res.status !== 200) {
    throw new Error(`Error when restoring state by id`);
  }
  return res.data;
};

/**
 *
 * @param projectId
 * @returns
 */
const getFiles = async (projectId: string, actor: string): Promise<DatabaseProjectFile[]> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getFiles`, { data });
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
  actor: string,
  name: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createFile`, {
    actor,
    name,
  });
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
const deleteFileById = async (
  projectId: string,
  fileId: string,
  actor: string,
): Promise<DatabaseProjectFile> => {
  const data = { actor };
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/deleteFileById/${fileId}`, {
    data,
  });
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
  actor: string,
  updates: { name?: string; contents?: string },
): Promise<DatabaseProjectFile> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/updateFileById/${fileId}`, {
    actor,
    ...updates,
  });
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
const getFileById = async (
  projectId: string,
  fileId: string,
  actor: string,
): Promise<DatabaseProjectFile> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}`, { data });
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
  actor: string,
  lineNumber: number,
  commentContent: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/file/${fileId}/addComment`, {
    actor,
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
  actor: string,
  lineNumber: number,
): Promise<DatabaseProjectFile> => {
  const data = { actor };
  const res = await api.delete(
    `${PROJECT_API_URL}/${projectId}/file/${fileId}/deleteCommentsByLine?lineNumber=${lineNumber}`,
    { data },
  );
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
  projectId: string,
  fileId: string,
  commentId: string,
  actor: string,
): Promise<DatabaseProjectFile> => {
  const data = { actor };
  const res = await api.delete(
    `${PROJECT_API_URL}/${projectId}/file/${fileId}/deleteCommentById/${commentId}`,
    { data },
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
  getFiles,
  createFile,
  deleteFileById,
  updateFileById,
  getFileById,
  addCommentToFile,
  deleteCommentsByLine,
  deleteCommentById,
};
