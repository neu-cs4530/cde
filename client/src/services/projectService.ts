import { DatabaseProject } from '@fake-stack-overflow/shared/types/project';
import { DatabaseProjectFile } from '@fake-stack-overflow/shared/types/projectFile';
// import axios from 'axios';
import api from './config';

const PROJECT_API_URL = `${process.env.REACT_APP_SERVER_URL}/project`;

const createProject = async (): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/createProject`);
  if (res.status !== 200) {
    throw new Error(`Error when creating project`);
  }
  return res.data;
};

const deleteProjectById = async (id: string): Promise<DatabaseProject> => {
  const res = await api.delete(`${PROJECT_API_URL}/deleteProjectById/${id}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting project by id`);
  }
  return res.data;
};

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

const getProjectsByUser = async (user: string): Promise<DatabaseProject[]> => {
  const res = await api.get(`${PROJECT_API_URL}/getProjectsByUser/${user}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by user`);
  }
  return res.data;
};
const getProjectById = async (projectId: string): Promise<DatabaseProject> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting projects by id`);
  }
  return res.data;
};
const addCollaboratorToProject = async (user: string, id: string): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${id}/addCollaborator/${user}`);
  if (res.status !== 200) {
    throw new Error(`Error when adding collaborators to the project`);
  }
  return res.data;
};

const removeCollaboratorFromProject = async (
  user: string,
  id: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${id}/removeCollaborator/${user}`);
  if (res.status !== 200) {
    throw new Error(`Error when removing collaborators to the project`);
  }
  return res.data;
};
const updateCollaboratorRole = async (
  user: string,
  id: string,
  role: string,
): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${id}/updateCollaboratorRole/${user}`, { role });
  if (res.status !== 200) {
    throw new Error(`Error when updating collaborator roles`);
  }
  return res.data;
};
const getProjectStates = async (id: string, projectId: string): Promise<DatabaseProject> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getStates`);
  if (res.status !== 200) {
    throw new Error(`Error when getting project states`);
  }
  return res.data;
};
const createProjectBackup = async (id: string, projectId: string): Promise<DatabaseProject> => {
  const res = await api.post(`${PROJECT_API_URL}/${projectId}/createBackup`);
  if (res.status !== 200) {
    throw new Error(`Error when creating project backups`);
  }
  return res.data;
};

const restoreStateById = async (projectId: string, stateId: string): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/restoreStateById/${stateId}`);
  if (res.status !== 200) {
    throw new Error(`Error when restoring state by id`);
  }
  return res.data;
};
const deleteStateById = async (projectId: string, stateId: string): Promise<DatabaseProject> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/deleteStateById/${stateId}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting state by id`);
  }
  return res.data;
};
const getFiles = async (projectId: string): Promise<DatabaseProjectFile[]> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/getFiles`);
  if (res.status !== 200) {
    throw new Error(`Error when getting files`);
  }
  return res.data;
};
const updateStateById = async (projectId: string, stateId: string): Promise<DatabaseProject> => {
  const res = await api.patch(`${PROJECT_API_URL}/${projectId}/updateStateById/${stateId}`);
  if (res.status !== 200) {
    throw new Error(`Error when updating state by id`);
  }
  return res.data;
};

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
const deleteFileById = async (projectId: string, fileId: string): Promise<DatabaseProjectFile> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/deleteFileById/${fileId}`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting file by id`);
  }
  return res.data;
};
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
const getFileById = async (projectId: string, fileId: string): Promise<DatabaseProjectFile> => {
  const res = await api.get(`${PROJECT_API_URL}/${projectId}/file/${fileId}`);
  if (res.status !== 200) {
    throw new Error(`Error when getting file by id`);
  }
  return res.data;
};

const addCommentToFile = async (
  projectId: string,
  fileId: string,
  lineNumber: number,
  commentContent: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.post(
    `${PROJECT_API_URL}/${projectId}/file/${fileId}/addComment/${lineNumber}`,
    commentContent,
  );
  if (res.status !== 200) {
    throw new Error(`Error when adding comment to file`);
  }
  return res.data;
};
const deleteCommentsByLine = async (
  projectId: string,
  fileId: string,
): Promise<DatabaseProjectFile> => {
  const res = await api.delete(`${PROJECT_API_URL}/${projectId}/file/${fileId}/deleteCommentsByLine`);
  if (res.status !== 200) {
    throw new Error(`Error when deleting comments by line`);
  }
  return res.data;
};
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
  updateStateById,
  createFile,
  deleteFileById,
  updateFileById,
  getFileById,
  addCommentToFile,
  deleteCommentsByLine,
  deleteCommentById,
};
