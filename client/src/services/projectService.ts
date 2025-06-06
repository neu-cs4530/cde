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
  DatabaseProjectFileComment,
} from '@fake-stack-overflow/shared/types/comment';
import {
  ProjectStateResponse,
  PopulatedDatabaseProjectState,
} from '@fake-stack-overflow/shared/types/projectState';
import { RespondToInviteRequest } from '@fake-stack-overflow/shared/types/user';

import api from './config';

// projects api url
const PROJECT_API_URL = `${process.env.REACT_APP_SERVER_URL}/projects`;

/**
 * Creates a new project in the dashboard of the given actors account, the specified collaborators, and the designated name.
 * @param name - The name of the project title.
 * @param actor - The user who is the owner of the project.
 * @param collaborators - The specified collaborators of the project, if any.
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
 * Deletes a project from the dashboard and from the database given a project ID.
 * @param id - The ID of the project to be deleted.
 * @param actor - The actor who is deleting the project.
 */
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
 * Updates a project based on the project ID.
 * @param id - The ID of the project to be updated.
 * @param actor - The username of the user who is updating the project.
 * @param name - the name of the project.
 * @param fileType - the specified file type.
 */
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

/**
 * Retrieve all projects for a specific user based on their username.
 * @param username - the username of the user to get all all associated projects for.
 */
const getProjectsByUser = async (username: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getProjectsByUser/${username}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by user`);
  }
  return res.data;
};

/**
 *
 * @param user
 * @returns
 */
// Retrieve all notifs for a specific user based on their username.
const getNotifsByUser = async (username: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getNotifsByUser/${username}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting notifs by user`);
  }
  return res.data;
};

// sends a notification to a user
export const sendNotificationToUser = async (
  username: string,
  notif: { projectId: string; notifType: string; role?: string; projectName?: string },
): Promise<void> => {
  const res = await api.post(`${PROJECT_API_URL}/notifications/${username}`, notif);
  if (res.status !== 200) {
    throw new Error(`Failed to send notification to ${username}`);
  }
};

// respond to an invite to a project
export const respondToInvite = async (
  username: string,
  notifId: string,
  action: 'accept' | 'decline',
): Promise<void> => {
  const requestBody: RespondToInviteRequest['body'] = {
    username,
    notifId,
    action,
  };

  const res = await api.post(`${PROJECT_API_URL}/notifications/respond`, requestBody);

  if (res.status !== 200) {
    throw new Error(`Error when responding to invite`);
  }
};

// delete a notification
export const deleteNotification = async (username: string, notifId: string): Promise<void> => {
  const res = await api.delete(`${PROJECT_API_URL}/notifications/${username}/${notifId}`);
  if (res.status !== 200) {
    throw new Error(`Failed to delete notification`);
  }
};

/**
 * Gets the designated project by the given project ID.
 * @param projectId - The project ID to be retrieved.
 * @param actor - The username of the user initiating the retrieval.
 */
const getProjectById = async (
  projectId: string,
  actor: string,
): Promise<PopulatedDatabaseProject> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}?actor=${actor}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by id`);
  }
  return res.data;
};

/**
 * Adds a collaborator to an existing project.
 * @param projectId - The project ID to add collaborators to.
 * @param actor - The username of the user who is adding collaborators.
 * @param collaborator - the username and specified role of the collaborator being added.
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
 * Removes a specific collaborator from the project.
 * @param projectId - The project ID to remove collaborators to.
 * @param actor - The username of the user who is removing collaborators.
 * @param username - the username of the collaborator being removed.
 */
const removeCollaboratorFromProject = async (
  projectId: string,
  actor: string,
  username: string,
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
 * Updates the role of a collaborator on a project.
 * @param projectId - ID of the project to be updated.
 * @param actor - The username of the user who is initiating changes.
 * @param username - The username of the collaborator whose role is changing.
 * @param role - The role the username will be updated to.
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
      projectId,
      actor,
      username,
      role,
    },
  );
  if (res.status !== 200) {
    throw new Error(`Error when updating collaborator roles`);
  }
  return res.data;
};

/**
 * Get all of the states of the project.
 * @param projectId - The ID of the project to retreive states.
 * @param stateId - The state ID to retrieve.
 * @param actor - The user who's project it is.
 */
const getProjectStates = async (
  projectId: string,
  stateId: string,
  actor: string,
): Promise<PopulatedDatabaseProjectState> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/state/${stateId}?actor=${actor}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting project states`);
  }
  return res.data;
};

/**
 * Creates a backup of an exisiting project.
 * @param projectId - The ID of the project to make a backup of.
 * @param actor - The actor initiating the backup.
 */
const createProjectBackup = async (projectId: string, actor: string): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createBackup`, { actor });
  if (res.status !== 200) {
    throw new Error(`Error when creating project backups`);
  }
  return res.data;
};

/**
 * Restores a project to a given state ID.
 * @param projectId - The project ID to be restored.
 * @param stateId - The state ID for the project to be reverted to.
 * @param actor - The actor who is reverting changes.
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
 * Gets all the files associated to a project
 * @param projectId - The project ID to get all files from.
 * @param actor - The actor who is getting all files.
 */
const getFiles = async (projectId: string, actor: string): Promise<DatabaseProjectFile[]> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getFiles?actor=${actor}`, {
    params: { actor },
  });
  if (res.status !== 200) {
    throw new Error(`Error when getting files`);
  }
  return res.data;
};

/**
 * Creates a file within a project
 * @param projectId - The project ID for a file to be created in.
 * @param actor - The owner of the project
 * @param name - The name of the project.
 * @param fileType - The type of file being added.
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
 * Deletes a file within a projct by a fileID
 * @param projectId - The project where the file will be deleted
 * @param fileId - The file to be deleted
 * @param actor - The actor in which this file is associated.
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
 * Updates a file within a project by a project Id.
 * @param projectId -  The project where the file will be updated.
 * @param fileId - The file to be updated.
 * @param actor - the actor in which this file is associated.
 * @param updates - The changes being made to the file.
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
 * Retrieves a file by a FileID.
 * @param projectId - The project to get the file from.
 * @param fileId - The file ID to be retrieved.
 * @param actor - The user who is getting the file.
 * @returns
 */
const getFileById = async (
  projectId: string,
  fileId: string,
  actor: string,
): Promise<DatabaseProjectFile> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}?actor=${actor}`, {
    data,
  });
  if (res.status !== 200) {
    throw new Error(`Error when getting file by id`);
  }
  return res.data;
};

/**
 * Adds a comment to a File
 * @param projectId - The project to add a comment to.
 * @param fileId - The file that will have a comment left on it.
 * @param commentContent - The content of the comment left.
 * @param actor - The user leaving a comment.
 * @param lineNumber - The line number the comment will be left on.
 * @returns
 */
const addCommentToFile = async (
  projectId: string,
  fileId: string,
  commentContent: string,
  actor: string,
  lineNumber: number,
): Promise<ProjectFileCommentResponse> => {
  const comment: ProjectFileComment = {
    text: commentContent,
    commentBy: actor,
    commentDateTime: new Date(),
    lineNumber,
  };
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/file/${fileId}/addComment`, {
    comment,
  });
  if (res.status !== 200) {
    throw new Error(`Error when adding comment to file`);
  }
  return res.data;
};

/**
 * Deletes a comment by an ID.
 * @param projectId - The project where a comment will be deleted.
 * @param fileId - The file where a comment will be deleted.
 * @param commentId - The ID of the comment to delete.
 * @param actor - The user who is deleting a comment.
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

/**
 * Gets a comment by its ID.
 * @param projectId - The project containing the comment.
 * @param fileId - The file containing the comment.
 * @param commentId - The ID of the comment.
 * @param actor - The user who is getting the comment.
 */
const getFileComment = async (
  projectId: string,
  fileId: string,
  commentId: string,
  actor: string,
): Promise<DatabaseProjectFileComment> => {
  const data = { actor };
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}/comment/${commentId}`, {
    data,
  });
  if (res.status !== 200) {
    throw new Error(`Error when getting comment by id`);
  }
  return res.data;
};

/**
 * Gets all the collaborators added to a project.
 * @param projectId - The project to get all collaborators from.
 */
const getCollaborators = async (projectId: string): Promise<PopulatedCollaborator[]> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/collaborators`);
  if (res.status !== 200) {
    throw new Error(`Error getting all collaborators.`);
  }
  return res.data;
};

/**
 * Saves the state of the project at that time.
 * @param projectId - The project of the state to save.
 * @param actor - The user saving the state.
 */
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

/**
 *  Runs a project's file.
 * @param projectId - The project of the file to be ran
 * @param fileId - The file to be ran.
 * @param fileName - The name of the file to be ran.
 * @param fileContent - The content of the file to be ran.
 */
const runProjectFile = async (
  projectId: string,
  fileId: string,
  fileName: string,
  fileContent: string,
): Promise<{ output: string; error?: string }> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/run-file`, {
    fileId,
    fileName,
    fileContent,
  });
  if (res.status !== 200) {
    throw new Error(`Error when running project file`);
  }
  return res.data;
};

/**
 * Retrieves all comments for a file.
 * @param projectId - The project containing the file.
 * @param fileId - The file to retrieve comments from.
 * @param actor - The user retrieving the comments.
 * @returns A list of comments.
 */
const getCommentsForFile = async (
  projectId: string,
  fileId: string,
  actor: string,
): Promise<DatabaseProjectFileComment[]> => {
  const res = await api.get(
    `${PROJECT_API_URL}/${projectId}/file/${fileId}/comments?actor=${actor}`,
  );
  if (res.status !== 200) {
    throw new Error(`Error when getting all comments for file`);
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
  deleteCommentById,
  getCollaborators,
  saveProjectState,
  runProjectFile,
  getNotifsByUser,
  getCommentsForFile,
  getFileComment,
};
