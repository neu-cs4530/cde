import express, { Response } from 'express';
// import {
//   saveProject,
// } from '../services/project/project.service';
// import {
//   saveProjectState,
// } from '../services/project/projectState.service';
// import {
//   
// } from '../services/project/projectFile.service';
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
  Project,
  ProjectState,
  ProjectFile,
  ProjectFileComment,
  ProjectRequest,
  // TODO: Requests go here
} from '../types/types';

/**
 * This controller handles project-related routes.
 * @param socket The socket instance to emit events.
 * @returns {express.Router} The router object containing the project routes.
 * @throws {Error} Throws an error if the project creation fails.
 */
const projectController = (socket: FakeSOSocket) => {
  const router = express.Router();

  // TODO: Request validators
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
   * Validates that the request body contains all required fields for a project.
   * @param req The incoming request containing project data.
   * @returns `true` if the body contains valid project fields; otherwise, `false`.
   */
  const isProjectBodyValid = (req: ProjectRequest): boolean =>
    req.body !== undefined &&
    req.body.name !== undefined &&
    req.body.name !== '' &&
    req.body.creator !== undefined &&
    req.body.creator !== '' &&
    req.body.collaborators?.every(c => isCollaboratorRoleValid(c.role)) ?? true;
  
  // TODO: Route functions 
  /**
   * Handles the creation of a new project.
   * @param req The request containing project data.
   * @param res The response, either returning the created Project or an error.
   * @returns A promise resolving to void.
   */
  const createProjectRoute = async (req: ProjectRequest, res: Response): Promise<void> => {
    if (!isProjectBodyValid(req)) {
      res.status(400).send('Invalid project body');
      return;
    }

    try {
      const requestProject = req.body;
      
      // Retrieve project creator's User document from database
      const owner: UserResponse = await getUserByUsername(requestProject.creator);
      
      if ('error' in owner) {
        throw Error(owner.error);
      }
      
      // Initialize list of collaborators as just owner
      const collaborators: Collaborator[] = [{
        userId: owner._id,
        role: 'OWNER',
      }]; 

      // Retrieve any potential invited collaborators from database 
      if (req.body.collaborators) {
        const invitedCollaborators: Collaborator[] = await Promise.all(
          req.body.collaborators.map(c => {
            const user: UserResponse = await getUserByUsername(c.username);

            if ('error' in user) {
              throw Error(user.error);
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

      // Create a new project state for the project
      const state: ProjectState = {
        files: [],
      };
      
      const stateResult: StateResponse = await saveProjectState(state);

      if ('error' in stateResult) {
        throw Error(stateResult.error);
      }
      
      // Create a new project and save it to the database
      const project: Project = {
        name: requestProject.name,
        creator: requestProject.creator,
        collaborators: collaborators,
        currentState: stateResult,
        savedStates: [],
      };

      const result = saveProject(project);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('projectUpdate', {
        project: result,
        type: 'created',
      });
      result.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving project: ${error}`);
    }
  };

  /**
   * TODO: Deletes a project by its ID.
   * @param req The request containing the project's ID as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteProjectRoute = async(req: DeleteProjectRequest, res: Response): Promise<void> => {
    
  };

  /**
   * TODO: 
   */


  // Register the routes
  router.post('/createProject', createProjectRoute);
  router.delete('/deleteProjectById/:projectId', deleteProjectRoute);
  router.patch('/updateProjectById/:projectId', updateProjectRoute);
  router.get('/getProjectsByUser/:username', getProjectsByUserRoute);
  router.get('/:projectId', getProjectRoute);
  // TODO: Change addCollaborator to inviteCollaborator
  router.post('/:projectId/addCollaborator/:username', addCollaboratorRoute);
  router.patch('/:projectId/removeCollaborator/:username', removeCollaboratorRole);
  router.get('/:projectId/getStates', getStatesRoute);
  router.post('/:projectId/createBackup', createBackupRoute);
  router.patch('/:projectId/restoreStateById/:stateId', restoreStateRoute);
  router.delete('/:projectId/deleteStateById/:stateId', deleteStateRoute);
  router.patch('/:projectId/updateStateById/:stateId', updateStateRoute);
  router.get('/:projectId/getFiles', getFilesRoute);
  router.post('/:projectId/createFile', createFileRoute);
  router.delete('/:projectId/deleteFileById/:fileId', deleteFileRoute);
  router.patch('/:projectId/updateFileById/:fileId', updateFileRoute);
  router.get('/:projectId/:fileId', getFileRoute);
  router.post('/:projectId/:fileId/addComment', addFileCommentRoute);
  router.delete('/:projectId/:fileId/deleteCommentsByLine/:lineNumber', deleteFileCommentsByLineRoute);
  router.delete('/:projectId/:fileId/deleteCommentById/:commentId', deleteFileCommentByIdRoute);

  return router;
};

export default projectController;
