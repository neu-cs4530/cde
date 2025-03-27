import mongoose from 'mongoose';
import supertest from 'supertest';
import { createServer } from 'http';
import { app } from '../../../app';
import * as projectService from '../../../services/project/project.service';
import * as projectStateService from '../../../services/project/projectState.service';
import * as projectFileService from '../../../services/project/projectFile.service';
import * as projectFileCommentService from '../../../services/project/projectFileComment.service';
import * as userService from '../../../services/user.service';
import databaseUtil from '../../../utils/database.util';
import {
  Project,
  DatabaseProject,
  ProjectState,
  DatabaseProjectState,
  ProjectFile,
  DatabaseProjectFile,
  ProjectFileComment,
  DatabaseProjectFileComment,
  Collaborator,
  SafeDatabaseUser,
} from '../../../types/types';

const mockOwnerUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'harry',
  dateJoined: new Date('2025-03-26'),
};

const mockOwnerCollab: Collaborator = {
  userId: mockOwnerUser._id,
  role: 'OWNER',
};

const mockEditorUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'ariel',
  dateJoiend: new Date('2025-03-26'),
};

const mockEditorCollab: Collaborator = {
  userId: mockEditorUser._id,
  role: 'EDITOR',
};

const mockViewerUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'manas',
  dateJoined: new Date('2025-03-26'),
};

const mockViewerCollab: Collaborator = {
  userId: mockViewerUser._id,
  role: 'VIEWER',
};

const mockOutsiderUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'adeel',
  dateJoined: new Date('2025-03-26'),
};

const mockProjectState: ProjectState = {
  files: [],
};

const mockDatabaseProjectState: DatabaseProjectState = {
  _id: new mongoose.Types.ObjectId(),
  files: [],
  createdAt: new Date('2025-03-26'),
  updatedAt: new Date('2025-03-26'),
};

const mockProject: Project = {
  name: 'test project',
  creator: mockOwnerUser.username,
  collaborators: [mockOwnerCollab, mockEditorCollab, mockViewerCollab],
  currentState: mockProjectState,
  savedStates: [],
};

const mockDatabaseProject: DatabaseProject = {
  _id: new mongoose.Types.ObjectId(),
  name: mockProject.name,
  collaborators: mockProject.collaborators,
  currentState: mockDatabaseProjectState._id,
  savedStates: [],
  createdAt: new Date('2025-03-26'),
};

const mockProjectJSONResponse = {
  _id: mockDatabaseProject._id.toString(),
  name: mockDatabaseProject.name,
  collaborators: mockProject.collaborators.map(c => c.toString()),
  currentState: mockDatabaseProject._id.toString(),
  savedStates: [],
  createdAt: mockDatabaseProject.createdAt.toISOString(),
};

const saveProjectSpy = jest.spyOn(projectService, 'saveProject');
const deleteProjectByIdSpy = jest.spyOn(projectService, 'deleteProjectById');
const updateProjectSpy = jest.spyOn(projectService, 'updateProject');
const saveProjectStateSpy = jest.spyOn(projectStateService, 'saveProjectState');
const getProjectByIdSpy = jest.spyOn(projectStateService, 'getProjectById');
const getUserByUsernameSpy = jest.spyOn(userService, 'getUserByUsername');

describe('Project Controller', () => {
  describe('POST /projects/createProject', () => {
    it('should create a new project successfully', async () => {
      const mockReqBody = {
        name: mockProject.name,
        actor: mockOwnerUser.name,
        collaborators: [{
          username: mockEditorUser.name,
          role: 'EDITOR', 
        },
        {
          username: mockViewerUser.name,
          role: 'VIEWER', 
        }],
      };
      
      // The server sequentially retrieves user IDs with getUserByUsername()
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      saveProjectStateSpy.mockResolvedValueOnce(mockDatabaseProjectState);
      
      saveProjectSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectJSONResponse);
      expect(saveProjectSpy).toHaveBeenCalledWith(mockProject);
    });

    it('should return 400 if request body is invalid', async () => {
      const mockReqBody = {
        name: 'ai-agent job-taker 9000',
        // Request body missing necessary actor field
      };

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if a collaborator in request body has an invalid role', async () => {
      const mockReqBody = {
        name: 'python homework solver',
        actor: 'harry',
        collaborators: [{
          username: 'ariel',
          role: 'PYTHON ENGINEER',  // Not a real CollaboratorRole
        }],
      };
      
      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 500 on service error for creator retrieval', async () => {
      const mockReqBody = {
        name: 'the best project ever',
        actor: 'mustache',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error retrieving user' });

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 on service error for collaborator retrieval', async () => {
      const mockReqBody = {
        name: 'the best project ever',
        actor: mockOwnerUser.name,
        collaborators: [{
          username: 'boingo',
          role: 'EDITOR',
        }],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error retrieving user' });

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 on service error for state creation', async () => {
      const mockReqBody = {
        name: 'automatic test writer',
        actor: mockOwnerUser.name,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      saveProjectStateSpy.mockResolvedValueOnce({ error: 'Error saving project state' });

      const response = await supertest.app.post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 on service error for project creation', async () => {
      const mockReqBody = {
        name: 'automatic test writer',
        actor: mockOwnerUser.name,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      saveProjectStateSpy.mockResolvedValueOnce(mockDatabaseProjectState);
      saveProjectSpy.mockResolvedValueOnce({ error: 'Error saving project' });

      const response = await supertest.app.post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /projects/deleteProjectById/:projectId', () => {
    it('should delete a project successfully', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      deleteProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app).delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectJSONResponse);
    });

    it('should return 403 if deleter is not project owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app).delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if deleter is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app).delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      deleteProjectByIdSpy.mockResolvedValueOnce({ error: 'Error deleting project' });

      const response = await supertest(app).delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).delete('projects/deleteProjectById/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/updateProjectById/:projectId', () => {
    it('should update a project successfully', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.name,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      updateProjectSpy.mockResolvedValueOnce({ ...mockDatabaseProject, name: 'best test project ever' });

      const response = await supertest(app).patch(`/projects/updateProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockProjectJSONResponse, name: 'best test project ever' });
    });

    it('should return 400 for missing actor', async () => {
      const mockReqBody = {
        name: 'best test project ever',
      };

      const response = await supertest(app).patch(`/projects/updateProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if updater is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.name,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app).patch(`/projects/updateProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if updater is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.name,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app).patch(`/projects/updateProjectById/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch('projects/updateProjectById/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/getProjectsByUser/:username', () => {
    it('should return all of a user\'s projects', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ ...mockOwnerUser, projects: [mockDatabaseProject._id] });

      const response = await supertest(app).get(`/projects/getProjectsByUser/${mockOwnerUser.name}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectJSONResponse);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/projects/getProjectsByUser/${mockOwnerUser.name}`);

      expect(reponse.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).get('/projects/getProjectsByUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/:projectId', () => {
    it('should return a project successfully', async () => {
      const mockReqBody = {
        actor: mockViewerUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      const response = await supertest(app).get(`/projects/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toBe(mockProjectJSONResponse);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockViewerUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce({ error: 'Error retrieving project' });

      const response = await supertest(app).get(`/projects/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status(500));
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.name,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app).get(`/projects/${mockDatabaseProject._id}`).send(mockReqBody);

      expect(response.status(403));
    });
  });

  describe('POST /projects/:projectId/addCollaborator/:username', () => {
    it('should successfully add collaborator to project', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if inviter is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if inviter is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/removeCollaborator/:username', () => {
    it('should successfully remove collaborator from project', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if remover is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if remover is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/updateCollaboratorRole/:username', () => {
    it('should successfully update collaborator role in project', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if updater is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if updater is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/getStates', () => {
    it('should successfully get all saved project states', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/createBackup', () => {
    it('should successfully create a backup state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/restoreStateById/:stateId', () => {
    it('should successfully restore project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('DELETE /projects/:projectId/deleteStateById/:stateId', () => {
    it('should successfully delete a project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/updateStateById/:stateId', () => {
    it('should successfully update project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/getFiles', () => {
    it('should successfully return all project files', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/createFile', () => {
    it('should successfully create and return a new project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if file name is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('DELETE /projects/:projectId/deleteFileById/:fileId', () => {
    it('should successfully delete a project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/updateFileById/:fileId', () => {
    it('should successfully update a project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/:fileId', () => {
    it('should successfully retrieve project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/addComment', () => {
    it('should successfully add comment to file', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if commenter is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if comment body is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if line number is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if commenter is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/deleteCommentsByLine/:lineNumber', () => {
    it('should successfully delete and return all comments from file on line', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if no comments on specified line', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if lineNumber not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/deleteCommentById/:commentId', () => {
    it('should succesfully delete and return comment from file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner or editor', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if commentId not provided', async () => {
      expect(true).toBe(false);
    });
  });
});
