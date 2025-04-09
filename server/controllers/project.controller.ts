import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import {
  saveProject,
  deleteProjectById,
  updateProject,
  addProjectCollaborator,
  removeProjectCollaborator,
  updateProjectCollaboratorRole,
  getProjectById,
  createProjectBackup,
  revertProjectToState,
  getNotifById,
} from '../services/project/project.service';
import {
  getProjectStateById,
  saveFileInState,
  deleteFileInState,
} from '../services/project/projectState.service';
import {
  updateProjectFile,
  getProjectFile,
  executeProjectFile,
} from '../services/project/projectFile.service';
import {
  saveProjectFileComment,
  deleteProjectFileCommentById,
  addCommentToFile,
  removeCommentFromFile,
  getProjectFileComment,
} from '../services/project/projectFileComment.service';
import {
  addNotificationToUser,
  getUserByUsername,
  removeNotificationFromUser,
} from '../services/user.service';
import {
  FakeSOSocket,
  UserResponse,
  Collaborator,
  Project,
  DatabaseProject,
  ProjectResponse,
  ProjectStateResponse,
  ProjectFile,
  DatabaseProjectFile,
  ProjectFileResponse,
  ProjectFileCommentResponse,
  CreateProjectRequest,
  ProjectRequest,
  GetProjectRequest,
  UserByUsernameRequest,
  CollaboratorRequest,
  ProjectStateRequest,
  CreateFileRequest,
  FileRequest,
  GetFileRequest,
  AddFileCommentRequest,
  FileCommentRequest,
  DatabaseNotification,
  NotificationResponse,
  AddNotificationRequest,
  CollaboratorRole,
  RespondToInviteRequest,
} from '../types/types';
import ProjectModel from '../models/projects.model';

export type ProjectFileType = 'PYTHON' | 'JAVA' | 'JAVASCRIPT' | 'OTHER';

/**
 * This controller handles project-related routes.
 * @param socket The socket instance to emit events.
 * @returns {express.Router} The router object containing the project routes.
 * @throws {Error} Throws an error if the project creation fails.
 */
const projectController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates that a string is a valid CollaboratorRole.
   * @param role The string to validate.
   * @returns `true` if the role is `OWNER`, `EDITOR`, or `VIEWER`; otherwise `false`.
   */
  const isCollaboratorRoleValid = (role: string): boolean =>
    role === 'OWNER' || role === 'EDITOR' || role === 'VIEWER';

  /**
   * Validates that a string is a valid ProjectFileType.
   * @param fileType The string to validate.
   * @returns `true` if the fileType is `PYTHON`, `JAVA`, `JAVASCRIPT`, or `OTHER`;
   * otherwise `false`.
   */
  const isProjectFileTypeValid = (fileType: string): boolean =>
    fileType === 'PYTHON' ||
    fileType === 'JAVA' ||
    fileType === 'JAVASCRIPT' ||
    fileType === 'OTHER';

  /**
   * Validates that the request body contains all required fields for creating a project.
   * @param req The incoming request containing project data.
   * @returns `true` if the body contains valid project fields; otherwise, `false`.
   */
  const isCreateProjectReqValid = (req: CreateProjectRequest): boolean =>
    req.body !== undefined &&
    req.body.name !== undefined &&
    req.body.name !== '' &&
    req.body.actor !== undefined &&
    req.body.actor !== '' &&
    (req.body.collaborators?.every(c => isCollaboratorRoleValid(c.role)) ?? true);

  /**
   * Validates that the request contains all required fields for a project.
   * @param req The incoming request containing project ID and actor.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isProjectReqValid = (req: ProjectRequest): boolean =>
    req.body !== undefined &&
    req.body.actor !== undefined &&
    req.body.actor !== '' &&
    (req.body.name ? req.query.name !== undefined : true) &&
    (req.body.name ? req.query.name !== '' : true);

  /**
   * Validates that the request contains all required fields for getting a project.
   * @param req The incoming request containing project ID and actor.
   * @returns `true` if the request contains valid params and query; otherwise, `false`.
   */
  const isGetProjectReqValid = (req: GetProjectRequest): boolean =>
    req.query !== undefined && req.query.actor !== undefined && req.query.actor !== '';

  /**
   * Validates that the request contains all required fields for a collaborator.
   * @param req The incoming request containing project ID, collaborator, and actor.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isCollaboratorReqValid = (req: CollaboratorRequest): boolean =>
    req.body !== undefined &&
    req.body.actor !== undefined &&
    req.body.actor !== '' &&
    (req.body.role ? req.body.role !== undefined : true) &&
    (req.body.role ? isCollaboratorRoleValid(req.body.role as string) : true);

  /**
   * Validates that the request contains all required fields for a project state.
   * @param req The incoming request containing project and state IDs, and actor.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isProjectStateReqValid = (req: ProjectStateRequest): boolean =>
    req.body !== undefined && req.body.actor !== undefined && req.body.actor !== '';

  /**
   * Validates that the request contains all required fields for file creation.
   * @param req The incoming request containing project ID, actor, and file data.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isCreateFileRequestValid = (req: CreateFileRequest): boolean =>
    req.body !== undefined &&
    req.body.actor !== undefined &&
    req.body.actor !== '' &&
    req.body.name !== undefined &&
    req.body.name !== '' &&
    req.body.fileType !== undefined &&
    isProjectFileTypeValid(req.body.fileType);

  /**
   * Validates that the request contains all required fields for a file.
   * @param req The incoming request containing project and file IDs, and actor.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isFileRequestValid = (req: FileRequest): boolean =>
    req.body !== undefined &&
    req.body.actor !== undefined &&
    req.body.actor !== '' &&
    (req.body.name ? req.body.name !== undefined && req.body.name !== '' : true) &&
    (req.body.fileType ? isProjectFileTypeValid(req.body.fileType) : true) &&
    (req.body.contents ? req.body.contents !== undefined && req.body.contents !== '' : true);

  /**
   * Validates that the request contains all required fields for getting a file.
   * @param req The incoming request containing project and file IDs, and actor.
   * @returns `true` if the request contains valid params and query; otherwise, `false`.
   */
  const isGetFileRequestValid = (req: GetFileRequest): boolean =>
    req.query !== undefined && req.query.actor !== undefined && req.query.actor !== '';

  /**
   * Validates that the request contains all required fields for creating
   * a file comment.
   * @param req The incoming request containing project and file IDs, and comment data.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  // const isAddFileCommentRequestValid = (req: AddFileCommentRequest): boolean =>
  //   req.body !== undefined &&
  //   req.body.comment !== undefined &&
  //   req.body.comment.text !== undefined &&
  //   req.body.comment.commentBy !== undefined &&
  //   req.body.comment.commentBy !== '' &&
  //   req.body.comment.commentDateTime !== undefined;

  /**
   * Validates that the request contains all required fields for accessing file
   * comment by ID.
   * @param req The incoming request containing project, file, and comment IDs.
   * @returns `true` if the request contains valid params; otherwise, `false`.
   */
  const isFileCommentRequestValid = (req: FileCommentRequest): boolean =>
    req.body.actor !== undefined && req.body.actor !== '';

  /**
   * Validates that a given user is a collaborator on a given project.
   * @param userId The ID of the user.
   * @param project The project response from the database.
   * @returns `true` if the user is a project collaborator; otherwise, `false`.
   */
  const isProjectCollaborator = (userId: ObjectId, project: DatabaseProject): boolean => {
    if ('error' in project || project.collaborators === undefined) {
      return false;
    }

    const result = project.collaborators.reduce((acc, c) => acc || c.userId.equals(userId), false);

    return result;
  };

  /**
   * Validates that a given user is an owner on a given project.
   * @param userId The ID of the user.
   * @param project The project response from the database.
   * @returns `true` if the user is a project owner; otherwise, `false`.
   */
  const isProjectOwner = (userId: ObjectId, project: DatabaseProject): boolean => {
    if ('error' in project || project.collaborators === undefined) {
      return false;
    }

    const result = project.collaborators.reduce(
      (acc, c) => acc || (c.userId.equals(userId) && c.role === 'OWNER'),
      false,
    );

    return result;
  };

  /**
   * Creates a new project.
   * @param req The request containing project data.
   * @param res The response, either returning the created Project or an error.
   * @returns A promise resolving to void.
   */
  const createProjectRoute = async (req: CreateProjectRequest, res: Response): Promise<void> => {
    if (!isCreateProjectReqValid(req)) {
      res.status(400).send('Invalid create project request');
      return;
    }

    try {
      const requestProject = req.body;

      // Retrieve project creator's User document from database
      const owner: UserResponse = await getUserByUsername(requestProject.actor);
      if ('error' in owner) {
        throw new Error(owner.error);
      }

      // Initialize list of collaborators as just owner
      const collaborators: Collaborator[] = [
        {
          userId: owner._id,
          role: 'OWNER',
        },
      ];

      // Retrieve any potential invited collaborators from database
      if (req.body.collaborators) {
        const invitedCollaborators: Collaborator[] = await Promise.all(
          req.body.collaborators.map(async c => {
            const user: UserResponse = await getUserByUsername(c.username);
            if ('error' in user) {
              throw new Error(user.error);
            }

            const collaborator: Collaborator = {
              userId: user._id,
              role: c.role,
            };

            return collaborator;
          }),
        );

        collaborators.push(...invitedCollaborators);
      }

      // Create a new project and save it to the database
      // NOTE that currentState will be saved by saveProject()
      const project: Project = {
        name: requestProject.name,
        creator: requestProject.actor,
        collaborators,
        currentState: { files: [] },
        savedStates: [],
      };

      const result = await saveProject(project);
      if ('error' in result) {
        throw new Error(`Error saving project: ${result.error}`);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving project: ${error}`);
    }
  };

  /**
   * Deletes a project by its ID.
   * @param req The request containing the project's ID as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteProjectRoute = async (req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project reqeust');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const result: ProjectResponse = await deleteProjectById(projectId);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when deleting project: ${error}`);
    }
  };

  /**
   * Updates a project by its ID.
   * @param req The request containing the project's ID as a route parameter.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateProjectRoute = async (req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req) || req.body.name === undefined) {
      res.status(400).send('Invalid update project request');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const result: ProjectResponse = await updateProject(projectId, { name: req.body.name });
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when updating project: ${error}`);
    }
  };

  /**
   * Retrieves all projects a user is collaborating on.
   * @param req The request containing user's username as a route parameter.
   * @param res The response, either containing the user's projects or returning an error.
   * @returns A promise resolving to void.
   */
  const getProjectsByUserRoute = async (
    req: UserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error(user.error);
      }

      const projects = [];
      if (user.projects !== undefined) {
        const userProjects: DatabaseProject[] = await Promise.all(
          user.projects.map(async projectId => {
            const project: ProjectResponse = await getProjectById(projectId.toString());
            if ('error' in project) {
              throw new Error(project.error);
            }

            return project;
          }),
        );

        projects.push(...userProjects);
      }

      res.status(200).json(projects);
    } catch (error) {
      res.status(500).send(`Error when getting projects by username: ${error}`);
    }
  };

  /**
   * Retrieves all notifications a user has.
   * @param req The request containing user's username as a route parameter.
   * @param res The response, either containing the user's notifications or returning an error.
   * @returns A promise resolving to void.
   */
  const getNotifsByUserRoute = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      // console.log('i am here');
      const { username } = req.params;

      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error(user.error);
      }

      const notifs = [];
      const notifications =
        user.notifications as unknown as Types.DocumentArray<DatabaseNotification>;
      if (notifications !== undefined) {
        const userNotifs: DatabaseNotification[] = await Promise.all(
          notifications.map(async notif => {
            const notifRes: NotificationResponse = await getNotifById(
              user._id.toString(),
              notif._id.toString(),
            );
            if ('error' in notifRes) {
              throw new Error(notifRes.error);
            }

            return notif;
          }),
        );

        notifs.push(...userNotifs);
      }

      res.status(200).json(notifs);
    } catch (error) {
      res.status(500).send(`Error when getting projects by username: ${error}`);
    }
  };

  // handles route to respond to an invite
  const respondToInviteRoute = async (
    req: RespondToInviteRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.body) {
      res.status(400).send('Invalid create project request');
      return;
    }
    // console.log('do u even get here?');
    try {
      // console.log('here?');
      const { username, notifId, action } = req.body;
      // console.log('1');

      // Get user
      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error(user.error);
      }

      // console.log('2');
      // Find notification
      const notifications =
        user.notifications as unknown as Types.DocumentArray<DatabaseNotification>;
      const notif = notifications.id(notifId);
      if (!notif) {
        res.status(404).send('Notification not found');
        return;
      }

      // console.log('3');
      const projectId = notif.projectId.toString();
      const { role } = notif;

      // Accept: add user to project
      if (action === 'accept') {
        const result = await addProjectCollaborator(projectId, username, role as CollaboratorRole);
        if ('error' in result) {
          throw new Error(result.error);
        }
      }

      // console.log('4');
      // Remove the notification
      const removal = await removeNotificationFromUser(username, notifId);
      if ('error' in removal) {
        throw new Error(removal.error);
      }

      // console.log('5');
      res.status(200).json({ message: `${action}ed invite` });
    } catch (error) {
      res.status(500).send(`Error responding to invite: ${error}`);
    }
  };

  // for deleting a notification from user
  const deleteNotificationRoute = async (
    req: UserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    const { username, notifId } = req.params;

    if (!username || !notifId) {
      res.status(400).send('Missing username or notification ID');
      return;
    }

    try {
      const removal = await removeNotificationFromUser(username, notifId);
      if ('error' in removal) {
        throw new Error(removal.error);
      }

      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).send(`Error deleting notification: ${err}`);
    }
  };

  /**
   * Retrieves a project by its ID.
   * @param req The request containing the project's ID as a route parameter.
   * @param The response, either containing the project or returning an error.
   * @returns A promise resolving to void.
   */
  const getProjectRoute = async (req: GetProjectRequest, res: Response): Promise<void> => {
    if (!isGetProjectReqValid(req)) {
      res.status(400).send('Invalid get project reqeust');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.query.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      // const validActor = isProjectCollaborator(actor._id, project);
      // if (validActor === false) {
      //   res.status(403).send('Forbidden');
      //   return;
      // }

      res.status(200).json(project);
    } catch (error) {
      res.status(500).send(`Error when getting project: ${error}`);
    }
  };

  /**
   * Adds a collaborator to a project.
   * @param req The request containing the project's ID and the collaborator's username
   * as route parameters.
   * @param The response, either confirming addition or returning an error.
   * @returns A promise resolving to void.
   */
  const addCollaboratorRoute = async (req: CollaboratorRequest, res: Response): Promise<void> => {
    if (!isCollaboratorReqValid(req) || req.body.role === undefined) {
      res.status(400).send('Invalid add collaborator request');
      return;
    }

    try {
      const { projectId } = req.params;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      // const validActor = isProjectOwner(actor._id, project);
      // if (validActor === false) {
      //   res.status(403).send('Forbidden');
      //   return;
      // }

      const collabName = req.params.username;
      const collaborator: UserResponse = await getUserByUsername(collabName);
      if ('error' in collaborator) {
        throw new Error(collaborator.error);
      }

      const response: ProjectResponse = await addProjectCollaborator(
        projectId,
        collabName,
        req.body.role,
      );
      if ('error' in response) {
        throw new Error(response.error);
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).send(`Error when adding collaborator: ${error}`);
    }
  };

  /**
   * Removes a collaborator from a project.
   * @param req The request containing the project's ID and the collaborator's username
   * as route parameters.
   * @param The response, either confirming removal or returning an error.
   * @returns A promise resolving to void.
   */
  const removeCollaboratorRoute = async (
    req: CollaboratorRequest,
    res: Response,
  ): Promise<void> => {
    if (!isCollaboratorReqValid(req)) {
      res.status(400).send('Invalid collaborator request');
      return;
    }

    try {
      const { projectId } = req.params;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const collabName = req.params.username;
      const collaborator: UserResponse = await getUserByUsername(collabName);
      if ('error' in collaborator) {
        throw new Error(collaborator.error);
      }

      const validCollab = isProjectCollaborator(collaborator._id, project);
      if (!validCollab) {
        res.status(400).send('Invalid collaborator');
        return;
      }

      const result: ProjectResponse = await removeProjectCollaborator(projectId, collabName);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when removing collaborator: ${error}`);
    }
  };

  /**
   * Updates a collaborator's role in a project.
   * @param req The request containing the project's ID and the collaborator's username
   * as route parameters.
   * @param The response, either confirming update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateCollaboratorRoleRoute = async (
    req: CollaboratorRequest,
    res: Response,
  ): Promise<void> => {
    if (req.body.role === undefined) {
      res.status(400).send('Invalid update collaborator role request');
      return;
    }

    try {
      const { projectId } = req.params;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const collabName = req.params.username;
      const collaborator: UserResponse = await getUserByUsername(collabName);
      if ('error' in collaborator) {
        throw new Error(collaborator.error);
      }

      if (!isProjectCollaborator(collaborator._id, project)) {
        res.status(400).send('Invalid collaborator');
        return;
      }

      const updatedProject: ProjectResponse = await updateProjectCollaboratorRole(
        projectId,
        collaborator._id.toString(),
        req.body.role,
      );
      if ('error' in updatedProject) {
        throw new Error(updatedProject.error);
      }

      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).send(`Error when updating collaborator role: ${error}`);
    }
  };

  /**
   * Retrieves all saved state IDs of a project.
   * @param req The request containing the project's ID as a route parameter.
   * @param The response, either containing the saved state IDs or returning an error.
   * @returns A promise resolving to void.
   */
  const getStatesRoute = async (req: GetProjectRequest, res: Response): Promise<void> => {
    if (!isGetProjectReqValid(req)) {
      res.status(400).send('Invalid get project reqeust');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.query.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      res.status(200).json(project.savedStates);
    } catch (error) {
      res.status(500).send(`Error when getting project states: ${error}`);
    }
  };

  /**
   * Creates a backup of the project's current state.
   * @param req The request containing the project's ID as a route parameter.
   * @param The response, either confirming backup or returning an error.
   * @returns A promise resolving to void.
   */
  const createBackupRoute = async (req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project request');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const updatedProject: ProjectResponse = await createProjectBackup(projectId);
      if ('error' in updatedProject) {
        throw new Error(updatedProject.error);
      }

      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).send(`Error when creating project backup: ${error}`);
    }
  };

  /**
   * Restores a project's state to a saved state.
   * @param req The request containing the project and state IDs as route parameters.
   * @param The response, either confirming restoration or returning an error.
   * @returns A promise resolving to void.
   */
  const restoreStateRoute = async (req: ProjectStateRequest, res: Response): Promise<void> => {
    if (!isProjectStateReqValid(req)) {
      res.status(400).send('Invalid project state request');
      return;
    }

    try {
      const { projectId, stateId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const validState = project.savedStates.reduce(
        (acc, id) => acc || stateId === id.toString(),
        false,
      );
      if (!validState) {
        res.status(400).send('Requested state does not belong to project');
        return;
      }

      const state: ProjectStateResponse = await getProjectStateById(stateId);
      if ('error' in state) {
        throw new Error(state.error);
      }

      const result: ProjectResponse = await revertProjectToState(projectId, stateId);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error restoring project state: ${error}`);
    }
  };

  /**
   * Retrieves a project's files based on its current state.
   * @param req The request containing the project's ID as a route parameter.
   * @param The response, either containing the files or returning an error.
   * @returns A promise resolving to void.
   */
  const getFilesRoute = async (req: GetProjectRequest, res: Response): Promise<void> => {
    if (!isGetProjectReqValid(req)) {
      res.status(400).send('Invalid get project request');
      return;
    }

    try {
      const { projectId } = req.params;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      const actor: UserResponse = await getUserByUsername(req.query.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }
      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }
      const stateId = project.currentState;
      const state: ProjectStateResponse = await getProjectStateById(stateId.toString());
      if ('error' in state) {
        throw new Error(state.error);
      }
      const files = [];
      if (state.files !== undefined) {
        const projectFiles: DatabaseProjectFile[] = await Promise.all(
          state.files.map(async fileId => {
            const file: ProjectFileResponse = await getProjectFile(fileId.toString());
            if ('error' in file) {
              throw new Error(file.error);
            }
            return file;
          }),
        );
        files.push(...projectFiles);
      }
      res.status(200).json(files);
    } catch (error) {
      res.status(500).send(`Error when getting project files: ${error}`);
    }
  };

  /**
   * Creates a new file in a project.
   * @param req The request containing the project's ID as a route parameter and file data.
   * @param The response, either returning the created file or returning an error.
   * @returns A promise resolving to void.
   */
  const createFileRoute = async (req: CreateFileRequest, res: Response): Promise<void> => {
    if (!isCreateFileRequestValid(req)) {
      res.status(400).send('Invalid create file request');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(
        currentStateId.toString(),
      );
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      // Create a new file in current state
      const file: ProjectFile = {
        name: req.body.name,
        fileType: req.body.fileType,
        contents: '',
        comments: [],
      };
      const result: ProjectFileResponse = await saveFileInState(currentStateId.toString(), file);
      if ('error' in result) {
        throw new Error(result.error);
      }

      if (socket && 'to' in socket) {
        socket.to(projectId).emit('fileCreated', {
          file: result,
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when creating project file: ${error}`);
    }
  };

  /**
   * Deletes a file in a project.
   * @param req The request containing the project and file IDs as route parameters.
   * @param The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteFileRoute = async (req: FileRequest, res: Response): Promise<void> => {
    if (!isFileRequestValid(req)) {
      res.status(400).send('Invalid file request');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectOwner(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(
        currentStateId.toString(),
      );
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const fileId = new ObjectId(req.params.fileId);

      const validFile = currentState.files.reduce(
        (acc, id) => acc || fileId.toString() === id.toString(),
        false,
      );
      if (!validFile) {
        res.status(400).send('Requested file is not part of the current project state');
        return;
      }

      const result: ProjectFileResponse = await deleteFileInState(
        currentStateId.toString(),
        fileId.toString(),
      );
      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.to(projectId).emit('fileDeleted', { fileId: fileId.toString() });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when deleting project file: ${error}`);
    }
  };

  /**
   * Updates a file in a project.
   * @param req The request containing the project and file IDs as route parameters.
   * @param The response, either confirming update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateFileRoute = async (req: FileRequest, res: Response): Promise<void> => {
    if (!isFileRequestValid(req)) {
      res.status(400).send('Invalid file request');
      return;
    }

    try {
      const { projectId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(
        currentStateId.toString(),
      );
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const fileId = new ObjectId(req.params.fileId);

      const validFile = currentState.files.reduce(
        (acc, id) => acc || fileId.toString() === id.toString(),
        false,
      );
      if (!validFile) {
        res.status(400).send('Requested file is not part of the current project state');
        return;
      }

      // Construct updates from req.body.name and/or req.body.fileType.
      const updates: Record<string, string> = {};
      if (req.body.name !== undefined) {
        updates.name = req.body.name;
      }
      if (req.body.fileType !== undefined) {
        updates.fileType = req.body.fileType;
      }
      if (req.body.contents !== undefined) {
        updates.contents = req.body.contents;
      }

      const result: ProjectFileResponse = await updateProjectFile(fileId.toString(), updates);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when updating project file: ${error}`);
    }
  };

  /**
   * Retrieves a file in a project.
   * @param req The request containing the project and file IDs as route parameters.
   * @param The response, either containing the file or returning an error.
   * @returns A promise resolving to void.
   */
  const getFileRoute = async (req: GetFileRequest, res: Response): Promise<void> => {
    if (!isGetFileRequestValid(req)) {
      res.status(400).send('Invalid get file request');
      return;
    }

    try {
      const { projectId, fileId } = req.params;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.query.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState.toString();
      const currentState: ProjectStateResponse = await getProjectStateById(currentStateId);
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const validFile = currentState.files.reduce(
        (acc, id) => acc || fileId === id.toString(),
        false,
      );
      if (!validFile) {
        res.status(400).send('Requested file is not part of the current project state');
        return;
      }

      const result: ProjectFileResponse = await getProjectFile(fileId);
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when getting project file: ${error}`);
    }
  };
  /**
   * Controller function to handle executing a project file.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   */
  const runProjectFileCode = async (req: FileRequest, res: Response) => {
    try {
      const { fileId, fileName, fileContent } = req.body as unknown as {
        fileId: string;
        fileName: string;
        fileContent: string;
      };
      // Validate required fields
      if (!fileId || !fileName || !fileContent) {
        return res.status(400).json({
          success: false,
          error: 'File ID, name and content are required',
        });
      }
      // executing the file
      const result = await executeProjectFile(fileName, fileContent);
      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        output: result.output,
        error: result.error,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in runProjectFileCode:', error);
      return res.status(500).json({
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  // adds a notification to user
  const addNotificationToUserRoute = async (req: AddNotificationRequest, res: Response) => {
    const { username } = req.params;
    const { projectId, notifType, role, projectName } = req.body;

    try {
      const newNotification = {
        _id: new Types.ObjectId(),
        projectId: new Types.ObjectId(projectId),
        notifType,
        role,
        projectName,
      };

      const notif: NotificationResponse = await addNotificationToUser(username, newNotification);
      if (!notif) {
        throw new Error('Error adding notification');
      }

      res.status(200).json({ message: 'Notification added', notification: newNotification });
    } catch (error) {
      res.status(500).json({ error: `Failed to add notification: ${error}` });
    }
  };

  /**
   * Adds a comment to a file in a project.
   * @param req The request containing the project and file IDs as route parameters,
   * and the comment data.
   * @param The response, either containing the created comment or returning an error.
   * @returns A promise resolving to void.
   */
  const addFileCommentRoute = async (req: AddFileCommentRequest, res: Response): Promise<void> => {
    // if (!isAddFileCommentRequestValid(req)) {
    //   res.status(400).send('Invalid add file comment request');
    //   return;
    // }

    try {
      const { projectId, fileId } = req.params;
      const { comment } = req.body;

      const actor: UserResponse = await getUserByUsername(comment.commentBy);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const savedComment: ProjectFileCommentResponse = await saveProjectFileComment(comment);
      if ('error' in savedComment) {
        throw new Error(savedComment.error);
      }
      const result = await addCommentToFile(fileId, savedComment._id.toString());
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(savedComment);
    } catch (error) {
      res.status(500).send(`Error adding comment to file: ${error}`);
    }
  };

  /**
   * Deletes a comment on a project file.
   * @param req The request containing the project, file, and comment IDs
   * as route parameters.
   * @param The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteFileCommentByIdRoute = async (
    req: FileCommentRequest,
    res: Response,
  ): Promise<void> => {
    if (!isFileCommentRequestValid(req)) {
      res.status(400).send('Invalid delete file comment request');
      return;
    }

    try {
      const { projectId, fileId, commentId } = req.params;

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const deletedComment: ProjectFileCommentResponse =
        await deleteProjectFileCommentById(commentId);
      if ('error' in deletedComment) {
        throw new Error(deletedComment.error);
      }

      const result: ProjectFileResponse = await removeCommentFromFile(fileId, commentId);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.status(200).json(deletedComment);
    } catch (error) {
      res.status(500).send(`Error when deleting file comment: ${error}`);
    }
  };

  /**
   * Retrieves a comment on a project file.
   * @param req The request containing the project, file, and comment IDs
   * as route parameters.
   * @param The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const getFileCommentRoute = async (req: FileCommentRequest, res: Response): Promise<void> => {
    if (!isFileCommentRequestValid(req)) {
      res.status(400).send('Invalid delete file comment request');
      return;
    }

    try {
      const { projectId, fileId, commentId } = req.params;

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const file: ProjectFileResponse = await getProjectFile(fileId);
      if ('error' in file) {
        throw new Error(file.error);
      }

      const validComment = file.comments.reduce(
        (acc, id) => acc || commentId.toString() === id.toString(),
        false,
      );
      if (!validComment) {
        res.status(400).send('Requested comment is not part of the given file');
        return;
      }

      const comment: ProjectFileCommentResponse = await getProjectFileComment(commentId);
      if ('error' in comment) {
        throw new Error(comment.error);
      }

      res.status(200).json(comment);
    } catch (error) {
      res.status(500).send(`Error when retrieving file comment: ${error}`);
    }
  };

  /**
   * Retrieves all comments on a project file.
   * @param req The request containing the project and file IDs as route parameters.
   * @param res The response, either returning comments or an error.
   * @returns A promise resolving to void.
   */
  const getAllFileCommentsRoute = async (req: GetFileRequest, res: Response): Promise<void> => {
    if (!isGetFileRequestValid(req)) {
      res.status(400).send('Invalid get file comments request');
      return;
    }

    try {
      const { projectId, fileId } = req.params;

      const project = await getProjectById(projectId);
      if ('error' in project) throw new Error(project.error);

      const actor = await getUserByUsername(req.query.actor);
      if ('error' in actor) throw new Error(actor.error);

      if (!isProjectCollaborator(actor._id, project)) {
        res.status(403).send('Forbidden');
        return;
      }

      const file = await getProjectFile(fileId);
      if ('error' in file) throw new Error(file.error);

      const comments = await Promise.all(
        file.comments.map(commentId => getProjectFileComment(commentId.toString())),
      );

      const validComments = comments.filter(c => !('error' in c));
      res.status(200).json(validComments);
    } catch (error) {
      res.status(500).send(`Error retrieving file comments: ${error}`);
    }
  };

  // Register the routes
  // router.use((req, res, next) => {
  //   console.log('🔥 Incoming:', req.method, req.originalUrl);
  //   next();
  // });

  router.post('/createProject', createProjectRoute);
  router.delete('/deleteProjectById/:projectId', deleteProjectRoute);
  router.patch('/updateProjectById/:projectId', updateProjectRoute);
  router.get('/getProjectsByUser/:username', getProjectsByUserRoute);
  router.get('/:projectId', getProjectRoute);
  router.post('/:projectId/addCollaborator/:username', addCollaboratorRoute);
  router.patch('/:projectId/removeCollaborator/:username', removeCollaboratorRoute);
  router.patch('/:projectId/updateCollaboratorRole/:username', updateCollaboratorRoleRoute);
  router.get('/:projectId/getStates', getStatesRoute);
  router.post('/:projectId/createBackup', createBackupRoute);
  router.patch('/:projectId/restoreStateById/:stateId', restoreStateRoute);
  router.get('/:projectId/getFiles', getFilesRoute);
  router.post('/:projectId/createFile', createFileRoute);
  router.delete('/:projectId/deleteFileById/:fileId', deleteFileRoute);
  router.patch('/:projectId/updateFileById/:fileId', updateFileRoute);
  router.get('/:projectId/file/:fileId', getFileRoute);
  router.post('/:projectId/run-file', runProjectFileCode);
  router.post('/:projectId/file/:fileId/addComment', addFileCommentRoute);
  router.delete(
    '/:projectId/file/:fileId/deleteCommentById/:commentId',
    deleteFileCommentByIdRoute,
  );
  router.get('/:projectId/file/:fileId/comment/:commentId', getFileCommentRoute);
  router.get('/:projectId/file/:fileId/comments', getAllFileCommentsRoute);
  router.get('/getNotifsByUser/:username', getNotifsByUserRoute);
  router.post('/notifications/respond', respondToInviteRoute);
  router.post('/notifications/:username', addNotificationToUserRoute);
  router.delete('/notifications/:username/:notifId', deleteNotificationRoute);

  socket.on('connection', conn => {
    conn.on('joinProject', (projectId: string) => {
      conn.join(projectId);
      conn.data.projectId = projectId;
    });

    conn.on('leaveProject', async (projectId: string) => {
      try {
        const project: Project | null = await ProjectModel.findById(projectId);
        if (!project) {
          throw new Error('invalid project');
        }
        conn.leave(projectId);
      } catch (error) {
        throw new Error('Unexpected error');
      }
    });

    conn.on('editFile', async ({ fileId, content }) => {
      try {
        const result = await updateProjectFile(fileId, { contents: content });

        if ('error' in result) {
          throw new Error(result.error);
        }

        const { projectId } = conn.data;
        if (projectId) {
          conn.to(projectId).emit('remoteEdit', { fileId, content: result.contents });
        }
      } catch (error) {
        throw new Error('Unexpected');
      }
    });

    conn.on('disconnect', async () => {
      // clean up if needed later
    });
  });

  return router;
};

export default projectController;
