import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
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
} from '../services/project/project.service';
import {
  getProjectStateById,
  saveFileInState,
  deleteFileInState,
} from '../services/project/projectState.service';
import {
 updateProjectFile,
 getProjectFile, 
} from '../services/project/projectFile.service';
// import {
//
// } from '../services/project/projectFileComment.service';
import {
  getUserByUsername,
} from '../services/user.service';
import { populateDocument } from '../utils/database.util';
import {
  FakeSOSocket,
  User,
  UserResponse,
  Collaborator,
  CollaboratorRole,
  Project,
  DatabaseProject,
  ProjectResponse,
  ProjectState,
  DatabaseProjectState,
  ProjectStateResponse,
  ProjectFile,
  DatabaseProjectFile,
  ProjectFileResponse,
  ProjectFileComment,
  CreateProjectRequest,
  ProjectRequest,
  UserByUsernameRequest,
  CollaboratorRequest,
  ProjectStateRequest,
  CreateFileRequest,
  FileRequest,
  AddFileCommentRequest,
  DeleteFileCommentsByLineRequest,
  DeleteFileCommentByIdRequest,
} from '../types/types';

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
    role === 'OWNER' ||
    role === 'EDITOR' ||
    role === 'VIEWER';

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
    (req.body.name ? req.body.name !== undefined : true) &&
    (req.body.name ? req.body.name !== '' : true);
  
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
    (req.body.role ? isCollaboratorRoleValid(req.body.role) : true);

  /**
   * Validates that the request contains all required fields for a project state.
   * @param req The incoming request containing project and state IDs, and actor.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isProjectStateReqValid = (req: ProjectStateRequest): boolean =>
    req.body !== undefined &&
    req.body.actor !== undefined &&
    req.body.actor !== '';

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
    req.body.actor !== '';

  /**
   * Validates that the request contains all required fields for creating 
   * a file comment.
   * @param req The incoming request containing project and file IDs, and comment data.
   * @returns `true` if the request contains valid params and body; otherwise, `false`.
   */
  const isAddFileCommentRequestValid = (req: AddFileCommentRequest): boolean =>
    req.body !== undefined &&
    req.body.comment !== undefined &&
    req.body.comment.text !== undefined &&
    req.body.comment.commentBy !== undefined &&
    req.body.comment.commentBy !== '' &&
    req.body.comment.commentDateTime !== undefined;

  /**
   * Validates that the request contains all required fields for deleting file 
   * comments by line.
   * @param req The incoming request containing project and file IDs, and line number.
   * @returns `true` if the request contains valid params; otherwise, `false`.
   */
  // const isDeleteFileCommentsByLineRequestValid = (req: DeleteFileCommentsByLineRequest): 
  //   boolean =>
  //   req.params !== undefined &&
  //   req.params.projectId !== undefined &&
  //   req.params.projectId !== '' &&
  //   req.params.fileId !== undefined &&
  //   req.params.fileId !== '' &&
  //   req.params.lineNumber !== undefined &&
  //   req.params.lineNumber >= 0;

  /**
   * Validates that the request contains all required fields for deleting file
   * comment by ID.
   * @param req The incoming request containing project, file, and comment IDs.
   * @returns `true` if the request contains valid params; otherwise, `false`.
   */
  // const isDeleteFileCommentByIdRequestValid = (req: DeleteFileCommentByIdRequest): 
  //   boolean =>
  //   req.params !== undefined &&
  //   req.params.projectId !== undefined &&
  //   req.params.projectId !== '' &&
  //   req.params.fileId !== undefined &&
  //   req.params.fileId !== '' &&
  //   req.params.commentId !== undefined &&
  //   req.params.commentId !== '';

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
    
    for (const collaborator of project.collaborators) {
      if (collaborator.userId.equals(userId)) {
        return true;
      }
    }
    
    return false;
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
    
    for (const collaborator of project.collaborators) {
      if (collaborator.userId.toString() === userId.toString() && collaborator.role === 'OWNER') {
        return true;
      }
    }
    
    return false;
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
      const collaborators: Collaborator[] = [{
        userId: owner._id,
        role: 'OWNER',
      }]; 

      // Retrieve any potential invited collaborators from database 
      if (req.body.collaborators) {
        const invitedCollaborators: Collaborator[] = await Promise.all(
          req.body.collaborators.map(async (c) => {
            const user: UserResponse = await getUserByUsername(c.username);
            if ('error' in user) {
              throw new Error(user.error);
            }
            
            const collaborator: Collaborator = {
              userId: user._id,
              role: c.role,
            }

            return collaborator;
          })
        );
        
        collaborators.push(...invitedCollaborators);
      }

      // Create a new project and save it to the database
      // NOTE that currentState will be saved by saveProject()
      const project: Project = {
        name: requestProject.name,
        creator: requestProject.actor,
        collaborators: collaborators,
        currentState: { files: [] },
        savedStates: [],
      };

      const result = await saveProject(project);
      if ('error' in result) {
        throw new Error('Error saving project');
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
  const deleteProjectRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project reqeust');
      return;
    }

    try {
      const projectId = req.params.projectId;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
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
  const updateProjectRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req) || req.body.name === undefined) {
      res.status(400).send('Invalid update project request');
      return;
    }

    try {
      const projectId = req.params.projectId;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }
      
      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
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
  const getProjectsByUserRoute = async(req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error(user.error);
      }

      const projects = [];
      if (user.projects !== undefined) {
        const userProjects: DatabaseProject[] = await Promise.all(
          user.projects.map(async (projectId) => {
            const project: ProjectResponse = await getProjectById(projectId.toString());
            if ('error' in project) {
              throw new Error(project.error);
            }

            return project;
          })
        );

        projects.push(...userProjects);
      }
      
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).send(`Error when getting projects by username: ${error}`);
    }
  };

  /**
   * Retrieves a project by its ID.
   * @param req The request containing the project's ID as a route parameter.
   * @param The response, either containing the project or returning an error.
   * @returns A promise resolving to void.
   */
  const getProjectRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project reqeust');
      return;
    }

    try {
      const projectId = req.params.projectId;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectCollaborator(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

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
  const addCollaboratorRoute = async(req: CollaboratorRequest, res: Response): Promise<void> => {
    if (!isCollaboratorReqValid(req) || req.body.role === undefined) {
      res.status(400).send('Invalid add collaborator request');
      return;
    }

    try {
      const projectId = req.params.projectId;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

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
  const removeCollaboratorRoute = async(req: CollaboratorRequest, res: Response): Promise<void> => {
    if (!isCollaboratorReqValid(req)) {
      res.status(400).send('Invalid collaborator request');
      return;
    }

    try {
      const projectId = req.params.projectId;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
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
  const updateCollaboratorRoleRoute = async(req: CollaboratorRequest, res: Response):
    Promise<void> => {
    if (!isCollaboratorReqValid(req) || req.body.role === undefined) {
      res.status(400).send('Invalid update collaborator role request');
      return;
    }

    try {
      const projectId = req.params.projectId;
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
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
  const getStatesRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if(!isProjectReqValid(req)) {
      res.status(400).send('Invalid project reqeust');
      return;
    }

    try {
      const projectId = req.params.projectId;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectCollaborator(actor._id, project);
      if (validActor === false) {
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
  const createBackupRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project request');
      return;
    }

    try {
      const projectId = req.params.projectId;

      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }

      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
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
  const restoreStateRoute = async(req: ProjectStateRequest, res: Response): Promise<void> => {
    if (!isProjectStateReqValid(req)) {
      res.status(400).send('Invalid project state request');
      return;
    }
    
    try {
      const projectId = req.params.projectId; 
      
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      
      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

      const stateId = new ObjectId(req.params.stateId);
      console.log("String ID:", req.params.stateId, ", Object ID:", stateId);
      
      const state: ProjectStateResponse = await getProjectStateById(stateId.toString());
      if ('error' in state) {
        throw new Error(state.error);
      }

      const validState = project.savedStates
        .reduce((acc, id) => acc || stateId.toString() === id.toString(), false);
      if (!validState) {
        res.status(400).send('Requested state does not belong to project');
        return;
      }

      const result: ProjectResponse = await revertProjectToState(projectId, stateId.toString());
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
  const getFilesRoute = async(req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectReqValid(req)) {
      res.status(400).send('Invalid project request');
      return;
    }

    try {
      const projectId = req.params.projectId; 
      
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      
      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectCollaborator(actor._id, project);
      if (validActor === false) {
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
          state.files.map(async (fileId) => {
            const file: ProjectFileResponse = await getProjectFile(fileId.toString());
            if ('error' in file) {
              throw new Error(file.error);
            }

            return file;
          })
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
  const createFileRoute = async(req: CreateFileRequest, res: Response): Promise<void> => {
    if (!isCreateFileRequestValid(req)) {
      res.status(400).send('Invalid create file request');
      return;
    }

    try {
      const projectId = req.params.projectId; 
      
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      
      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectCollaborator(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(currentStateId.toString());
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
  const deleteFileRoute = async(req: FileRequest, res: Response): Promise<void> => {
    if (!isFileRequestValid(req)) {
      res.status(400).send('Invalid file request');
      return;
    }

    try {
      const projectId = req.params.projectId; 
      
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      
      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(currentStateId.toString());
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const fileId = new ObjectId(req.params.fileId);

      const validFile = currentState.files
        .reduce((acc, id) => acc || fileId.toString() === id.toString(), false);
      if (!validFile) {
        res.status(400).send('Requested file is not part of the current project state');
        return;
      }

      const result: ProjectFileResponse = await deleteFileInState(
        currentStateId.toString(),
        fileId.toString()
      );
      if ('error' in result) {
        throw new Error(result.error);
      }

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
  const updateFileRoute = async(req: FileRequest, res: Response): Promise<void> => {
    if (!isFileRequestValid(req)) {
      res.status(400).send('Invalid file request');
      return;
    }

    try {
      const projectId = req.params.projectId; 
      
      const project: ProjectResponse = await getProjectById(projectId);
      if ('error' in project) {
        throw new Error(project.error);
      }
      
      const actor: UserResponse = await getUserByUsername(req.body.actor);
      if ('error' in actor) {
        throw new Error(actor.error);
      }

      const validActor = isProjectOwner(actor._id, project);
      if (validActor === false) {
        res.status(403).send('Forbidden');
        return;
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(currentStateId.toString());
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const fileId = new ObjectId(req.params.fileId);

      const validFile = currentState.files
        .reduce((acc, id) => acc || fileId.toString() === id.toString(), false);
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
  const getFileRoute = async(req: FileRequest, res: Response): Promise<void> => {
    if (!isFileRequestValid(req)) {
      res.status(400).send('Invalid file request');
      return;
    }

    try {
      const projectId = req.params.projectId;
      
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
      } else {
        console.log(req.body.actor, 'confirmed as collaborator');
        console.log(req.body.actor, ', id:', actor._id.toString());
        project.collaborators.map(c => console.log('collaborator id:', c.userId.toString()));
      }

      const currentStateId = project.currentState;
      const currentState: ProjectStateResponse = await getProjectStateById(currentStateId.toString());
      if ('error' in currentState) {
        throw new Error(currentState.error);
      }

      const fileId = new ObjectId(req.params.fileId);

      if (currentState.files !== null) {
        const validFile = currentState.files
          .reduce((acc, id) => acc || fileId.toString() === id.toString(), false);
        if (!validFile) {
          res.status(400).send('Requested file is not part of the current project state');
          return;
        }
      }

      const result: ProjectFileResponse = await getProjectFile(fileId.toString());
      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when updating project file: ${error}`);
    }
  };

  /**
   * TODO: Adds a comment to a file in a project.
   * @param req The request containing the project and file IDs as route parameters,
   * and the comment data.
   * @param The response, either containing the created comment or returning an error.
   * @returns A promise resolving to void.
   */
  const addFileCommentRoute = async(req: AddFileCommentRequest, res: Response): Promise<void> => {
    res.status(500).send('Unimplemented');
  };

  /**
   * TODO: Deletes all comments on a line in a file.
   * @param req The request containing the project and file IDs, and line number 
   * as route parameters.
   * @param The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteFileCommentsByLineRoute = async(req: DeleteFileCommentsByLineRequest, res: Response):
    Promise<void> => {
    res.status(500).send('Unimplemented');
  };

  /**
   * TODO: Deletes a comment on a project file.
   * @param req The request containing the project, file, and comment IDs 
   * as route parameters.
   * @param The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteFileCommentByIdRoute = async(req: DeleteFileCommentByIdRequest, res: Response):
    Promise<void> => {
    res.status(500).send('Unimplemented');
  };


  // Register the routes
  router.post('/createProject', createProjectRoute);
  router.delete('/deleteProjectById/:projectId', deleteProjectRoute);
  router.patch('/updateProjectById/:projectId', updateProjectRoute);
  router.get('/getProjectsByUser/:username', getProjectsByUserRoute);
  router.get('/:projectId', getProjectRoute);
  // TODO: Change addCollaborator to inviteCollaborator
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
  router.post('/:projectId/file/:fileId/addComment', addFileCommentRoute);
  router.delete('/:projectId/file/:fileId/deleteCommentsByLine/:lineNumber', deleteFileCommentsByLineRoute);
  router.delete('/:projectId/file/:fileId/deleteCommentById/:commentId', deleteFileCommentByIdRoute);

  return router;
};

export default projectController;
