import {
  RequestCollaborator,
  PopulatedCollaborator,
} from '@fake-stack-overflow/shared/types/collaborator';
import {
  PopulatedDatabaseProject,
  DatabaseProject,
  CreateProjectRequest,
} from '@fake-stack-overflow/shared/types/project';
import {
  ProjectFileType,
  ProjectFileResponse,
  DatabaseProjectFile,
} from '@fake-stack-overflow/shared/types/projectFile';
import {
  ProjectFileComment,
  ProjectFileCommentResponse,
} from '@fake-stack-overflow/shared/types/comment';
import {
  ProjectStateResponse,
  PopulatedDatabaseProjectState,
} from '@fake-stack-overflow/shared/types/projectState';

import api from './config';

// ** IMPORTANT: should get requests have the query in the form of
// const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}?actor=${actor}`);
// where the query is at the end, rather than sending it like this?
//  const data = { actor };
//  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}`, { data });
// ** isnt it the case that get reqs we can send a body?*/

// project api url
const PROJECT_API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

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
  fileType?: ProjectFileType,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/updateProjectById/${projectId}`, {
    actor,
    name,
    fileType,
  });
  if (res.status !== 200) {
    throw new Error(`Error when updating project by id`);
  }
  return res.data;
};

const updateProjectState = async (
  projectId: string,
  stateId: string,
  actor: string,
): Promise<ProjectStateResponse> => {
  try {
    const res = await api.put(`${PROJECT_API_URL}/${projectId}/state/${stateId}`, { actor });
    return res.data;
  } catch (error) {
    return { error: 'Error updating project state' };
  }
};

/**
 *
 * @param user
 * @returns
 */
// Retrieve all projects for a specific user based on their username.
const getProjectsByUser = async (username: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getProjectsByUser/${username}`);
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
const getProjectById = async (
  projectId: string,
  actor: string,
  fileId: string,
): Promise<PopulatedDatabaseProject> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}`, { data });
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
const getProjectStates = async (
  projectId: string,
  stateId: string,
  actor: string,
): Promise<PopulatedDatabaseProjectState> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/state/${stateId}`, { data });
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
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getFiles`, {
    params: { actor },
  });
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
  fileType: ProjectFileType,
): Promise<ProjectFileResponse> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createFile`, {
    actor,
    name,
    fileType,
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
  // const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}?actor=${actor}`); query instead?
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
  commentContent: ProjectFileComment,
): Promise<ProjectFileCommentResponse> => {
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

const getCollaborators = async (projectId: string): Promise<PopulatedCollaborator[]> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/collaborators`);
  if (res.status !== 200) {
    throw new Error(`Error getting all collaborators.`);
  }
  return res.data;
};

const saveProjectState = async (
  projectId: string,
  actor: string,
): Promise<ProjectStateResponse> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/state`, { actor });
  if (res.status !== 200) {
    throw new Error(`Error saving project state.`);
  }
  return res.data;
};

const runProjectFile = async (
  projectId: string,
  fileId: string,
  fileName: string,
  fileContent: string,
) => {
  try {
    const response = await fetch(`${PROJECT_API_URL}/${projectId}/run-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // converts the js object w/ the file name and content into a JSON string
        // data sent to server for processing
        fileId,
        fileName,
        fileContent,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to run file (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running project file:', error);
    throw error;
  }
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
  getCollaborators,
  saveProjectState,
  updateProjectState,
  runProjectFile,
};
