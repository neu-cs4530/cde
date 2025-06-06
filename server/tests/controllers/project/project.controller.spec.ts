import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { app } from '../../../app';
import * as projectService from '../../../services/project/project.service';
import * as projectStateService from '../../../services/project/projectState.service';
import * as projectFileService from '../../../services/project/projectFile.service';
import * as projectFileCommentService from '../../../services/project/projectFileComment.service';
import * as userService from '../../../services/user.service';
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
  _id: new ObjectId(11),
  username: 'harry',
  dateJoined: new Date('2025-03-26'),
};

const mockOwnerCollab: Collaborator = {
  userId: mockOwnerUser._id,
  role: 'OWNER',
};

const mockEditorUser: SafeDatabaseUser = {
  _id: new ObjectId(12),
  username: 'ariel',
  dateJoined: new Date('2025-03-26'),
};

const mockEditorCollab: Collaborator = {
  userId: mockEditorUser._id,
  role: 'EDITOR',
};

const mockViewerUser: SafeDatabaseUser = {
  _id: new ObjectId(13),
  username: 'isha',
  dateJoined: new Date('2025-03-26'),
};

const mockViewerCollab: Collaborator = {
  userId: mockViewerUser._id,
  role: 'VIEWER',
};

const mockOutsiderUser: SafeDatabaseUser = {
  _id: new ObjectId(14),
  username: 'adeel',
  dateJoined: new Date('2025-03-26'),
};

const mockComment: ProjectFileComment = {
  text: 'phenomenal',
  commentBy: mockViewerUser.username,
  commentDateTime: new Date('2025-03-26'),
  lineNumber: 1,
};

const mockDatabaseComment: DatabaseProjectFileComment = {
  _id: new ObjectId(51),
  text: 'phenomenal code',
  commentBy: mockViewerUser.username,
  commentDateTime: new Date('2025-03-26'),
  lineNumber: 1,
};

const mockCommentJSONResponse = {
  _id: mockDatabaseComment._id.toString(),
  text: mockDatabaseComment.text,
  commentBy: mockDatabaseComment.commentBy,
  commentDateTime: mockDatabaseComment.commentDateTime.toISOString(),
  lineNumber: mockDatabaseComment.lineNumber,
};

const mockProjectFile: ProjectFile = {
  name: 'hello.py',
  fileType: 'PYTHON',
  contents: 'print("Hello world!")',
  comments: [],
};

const mockDatabaseProjectFile: DatabaseProjectFile = {
  _id: new ObjectId(21),
  name: mockProjectFile.name,
  fileType: mockProjectFile.fileType,
  contents: mockProjectFile.contents,
  comments: [],
};

const mockFileJSONResponse = {
  _id: mockDatabaseProjectFile._id.toString(),
  name: mockDatabaseProjectFile.name,
  fileType: mockDatabaseProjectFile.fileType,
  contents: mockDatabaseProjectFile.contents,
  comments: [],
};

const mockProjectState: ProjectState = {
  files: [],
};

const mockDatabaseProjectState: DatabaseProjectState = {
  _id: new ObjectId(31),
  files: [],
  createdAt: new Date('2025-03-26'),
  updatedAt: new Date('2025-03-26'),
};

const mockSavedDatabaseProjectState: DatabaseProjectState = {
  _id: new ObjectId(32),
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
  _id: new ObjectId(41),
  name: mockProject.name,
  creator: mockProject.creator,
  collaborators: mockProject.collaborators,
  currentState: mockDatabaseProjectState._id,
  savedStates: [],
  createdAt: new Date('2025-03-26'),
};

const MOCK_COLLABORATORS_JSON = mockProject.collaborators.map(c => ({
  userId: c.userId.toString(),
  role: c.role,
}));

const mockProjectJSONResponse = {
  _id: mockDatabaseProject._id.toString(),
  name: mockDatabaseProject.name,
  creator: mockDatabaseProject.creator,
  collaborators: MOCK_COLLABORATORS_JSON,
  currentState: mockDatabaseProjectState._id.toString(),
  savedStates: [],
  createdAt: mockDatabaseProject.createdAt.toISOString(),
};

const saveProjectSpy = jest.spyOn(projectService, 'saveProject');
const deleteProjectByIdSpy = jest.spyOn(projectService, 'deleteProjectById');
const updateProjectSpy = jest.spyOn(projectService, 'updateProject');
const getProjectByIdSpy = jest.spyOn(projectService, 'getProjectById');
const addProjectCollaboratorSpy = jest.spyOn(projectService, 'addProjectCollaborator');
const removeProjectCollaboratorSpy = jest.spyOn(projectService, 'removeProjectCollaborator');
const updateProjectCollaboratorRoleSpy = jest.spyOn(
  projectService,
  'updateProjectCollaboratorRole',
);
const createProjectBackupSpy = jest.spyOn(projectService, 'createProjectBackup');
const revertProjectToStateSpy = jest.spyOn(projectService, 'revertProjectToState');
const getProjectStateByIdSpy = jest.spyOn(projectStateService, 'getProjectStateById');
const saveFileInStateSpy = jest.spyOn(projectStateService, 'saveFileInState');
const deleteFileInStateSpy = jest.spyOn(projectStateService, 'deleteFileInState');
const updateProjectFileSpy = jest.spyOn(projectFileService, 'updateProjectFile');
const getProjectFileByIdSpy = jest.spyOn(projectFileService, 'getProjectFile');
const saveFileCommentSpy = jest.spyOn(projectFileCommentService, 'saveProjectFileComment');
const deleteFileCommentSpy = jest.spyOn(projectFileCommentService, 'deleteProjectFileCommentById');
const addCommentToFileSpy = jest.spyOn(projectFileCommentService, 'addCommentToFile');
const removeCommentFromFileSpy = jest.spyOn(projectFileCommentService, 'removeCommentFromFile');
const getUserByUsernameSpy = jest.spyOn(userService, 'getUserByUsername');

describe('Project Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /projects/createProject', () => {
    it('should create a new project successfully', async () => {
      const mockReqBody = {
        name: mockProject.name,
        actor: mockOwnerUser.username,
        collaborators: [
          {
            username: mockEditorUser.username,
            role: 'EDITOR',
          },
          {
            username: mockViewerUser.username,
            role: 'VIEWER',
          },
        ],
      };

      // The server sequentially retrieves user IDs with getUserByUsername()
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
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
        collaborators: [
          {
            username: 'ariel',
            role: 'PYTHON ENGINEER', // Not a real CollaboratorRole
          },
        ],
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
        actor: mockOwnerUser.username,
        collaborators: [
          {
            username: 'boingo',
            role: 'EDITOR',
          },
        ],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error retrieving user' });

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 500 on service error for project creation', async () => {
      const mockReqBody = {
        name: 'automatic test writer',
        actor: mockOwnerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      saveProjectSpy.mockResolvedValueOnce({ error: 'Error saving project' });

      const response = await supertest(app).post('/projects/createProject').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /projects/deleteProjectById/:projectId', () => {
    it('should delete a project successfully', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      deleteProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app)
        .delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectJSONResponse);
    });

    it('should return 403 if deleter is not project owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if deleter is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      deleteProjectByIdSpy.mockResolvedValueOnce({ error: 'Error deleting project' });

      const response = await supertest(app)
        .delete(`/projects/deleteProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).delete('/projects/deleteProjectById/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/updateProjectById/:projectId', () => {
    it('should update a project successfully', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      updateProjectSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        name: 'best test project ever',
      });

      const response = await supertest(app)
        .patch(`/projects/updateProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockProjectJSONResponse, name: 'best test project ever' });
    });

    it('should return 400 for missing actor', async () => {
      const mockReqBody = {
        name: 'best test project ever',
      };

      const response = await supertest(app)
        .patch(`/projects/updateProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if updater is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .patch(`/projects/updateProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if updater is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
        name: 'best test project ever',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(`/projects/updateProjectById/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch('/projects/updateProjectById/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/getProjectsByUser/:username', () => {
    it("should return all of a user's projects", async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockOwnerUser,
        projects: [mockDatabaseProject._id],
      });
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app).get(
        `/projects/getProjectsByUser/${mockOwnerUser.username}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockProjectJSONResponse]);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(
        `/projects/getProjectsByUser/${mockOwnerUser.username}`,
      );

      expect(response.status).toBe(500);
    });

    it('should return 400 if username not provided', async () => {
      const response = await supertest(app).get('/projects/getProjectsByUser/');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /projects/:projectId', () => {
    it('should return a project successfully', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjectJSONResponse);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({ error: 'Error retrieving project' });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /projects/:projectId/addCollaborator/:username', () => {
    it('should successfully add collaborator to project', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'VIEWER',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      addProjectCollaboratorSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        collaborators: [
          ...mockDatabaseProject.collaborators,
          {
            userId: mockOutsiderUser._id,
            role: 'VIEWER',
          },
        ],
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProjectJSONResponse,
        collaborators: [
          ...mockProjectJSONResponse.collaborators,
          {
            userId: mockOutsiderUser._id.toString(),
            role: 'VIEWER',
          },
        ],
      });
    });

    it('should return 400 if role is not provided', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if role is invalid', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'GOAT',
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if inviter is not owner', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
        role: 'VIEWER',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if inviter is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
        role: 'VIEWER',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'VIEWER',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      addProjectCollaboratorSpy.mockResolvedValueOnce({
        error: 'Error adding collaborator',
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/addCollaborator/${mockOutsiderUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).post(
        `/projects/${mockDatabaseProject._id}/addCollaborator/`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).post(
        `/projects//addCollaborator/${mockOutsiderUser.username}`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/:projectId/removeCollaborator/:username', () => {
    it('should successfully remove collaborator from project', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      removeProjectCollaboratorSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        collaborators: mockDatabaseProject.collaborators.filter(
          c => c.userId !== mockViewerUser._id,
        ),
      });

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/removeCollaborator/${mockViewerUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProjectJSONResponse,
        collaborators: mockProjectJSONResponse.collaborators.filter(
          c => c.userId !== mockViewerUser._id.toString(),
        ),
      });
    });

    it('should return 400 if collaborator is not valid', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/removeCollaborator/${mockOutsiderUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if remover is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/removeCollaborator/${mockViewerUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if remover is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/removeCollaborator/${mockViewerUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      removeProjectCollaboratorSpy.mockResolvedValueOnce({
        error: 'Error removing collaborator',
      });

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/removeCollaborator/${mockViewerUser.username}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).patch(
        `/projects/${mockDatabaseProject._id}/removeCollaborator/`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects//removeCollaborator/${mockOutsiderUser.username}`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/:projectId/updateCollaboratorRole/:username', () => {
    it('should successfully update collaborator role in project', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'EDITOR',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      updateProjectCollaboratorRoleSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        collaborators: [
          ...mockDatabaseProject.collaborators.filter(c => c.userId !== mockViewerUser._id),
          {
            userId: mockViewerUser._id,
            role: 'EDITOR',
          },
        ],
      });

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockViewerUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProjectJSONResponse,
        collaborators: [
          ...mockProjectJSONResponse.collaborators.filter(
            c => c.userId !== mockViewerUser._id.toString(),
          ),
          {
            userId: mockViewerUser._id.toString(),
            role: 'EDITOR',
          },
        ],
      });
    });

    it('should return 400 if collaborator is invalid', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'EDITOR',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockOutsiderUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if role is not provided', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockOutsiderUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if role is invalid', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'GOAT',
      };

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockOutsiderUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if updater is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
        role: 'EDITOR',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockViewerUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if updater is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
        role: 'EDITOR',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockViewerUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        role: 'EDITOR',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      updateProjectCollaboratorRoleSpy.mockResolvedValueOnce({
        error: 'Error updating project',
      });

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/${mockViewerUser.username}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).patch(
        `/projects/${mockDatabaseProject._id}/updateCollaboratorRole/`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects//updateCollaboratorRole/${mockViewerUser.username}`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/:projectId/getStates', () => {
    it('should successfully get all saved project states', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        savedStates: [mockSavedDatabaseProjectState._id],
      });
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getStates`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockSavedDatabaseProjectState._id.toString()]);
    });

    it('should return 403 if user is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        savedStates: [mockSavedDatabaseProjectState._id],
      });
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getStates`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        savedStates: [mockSavedDatabaseProjectState._id],
      });
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getStates`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        error: 'Error retrieving project',
      });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getStates`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 400 if projectId not provided', async () => {
      const response = await supertest(app).get(`/projects//getStates`);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /projects/:projectId/createBackup', () => {
    it('should successfully create a backup state', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      createProjectBackupSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        currentState: mockSavedDatabaseProjectState._id,
        savedStates: [mockDatabaseProjectState._id],
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createBackup`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProjectJSONResponse,
        currentState: mockSavedDatabaseProjectState._id.toString(),
        savedStates: [mockDatabaseProjectState._id.toString()],
      });
    });

    it('should return 403 if user is not owner', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createBackup`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createBackup`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      createProjectBackupSpy.mockResolvedValueOnce({
        error: 'Error updating project',
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createBackup`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).post(`/projects//createBackup`);
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/:projectId/restoreStateById/:stateId', () => {
    it('should successfully restore project state', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        savedStates: [mockSavedDatabaseProjectState._id],
      });
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce(mockSavedDatabaseProjectState);
      revertProjectToStateSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        currentState: mockSavedDatabaseProjectState._id,
      });

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/restoreStateById/${mockSavedDatabaseProjectState._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProjectJSONResponse,
        currentState: mockSavedDatabaseProjectState._id.toString(),
      });
    });

    it('should return 400 if state is not a saved state', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      const paramId = new ObjectId();

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/restoreStateById/${paramId}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not owner', async () => {
      const mockReqBody = {
        actor: mockEditorUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockEditorUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/restoreStateById/${mockSavedDatabaseProjectState._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/restoreStateById/${mockSavedDatabaseProjectState._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProject,
        savedStates: [mockSavedDatabaseProjectState._id],
      });
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce(mockSavedDatabaseProjectState);
      revertProjectToStateSpy.mockResolvedValueOnce({
        error: 'Error reverting project state',
      });

      const response = await supertest(app)
        .patch(
          `/projects/${mockDatabaseProject._id}/restoreStateById/${mockSavedDatabaseProjectState._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects//restoreStateById/${mockSavedDatabaseProjectState._id}`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if stateId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects/${mockDatabaseProject._id}/restoreStateById/`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/:projectId/getFiles', () => {
    it('should successfully return all project files', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      getProjectFileByIdSpy.mockResolvedValueOnce(mockDatabaseProjectFile);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getFiles`)
        .query(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockFileJSONResponse]);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getFiles`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      getProjectFileByIdSpy.mockResolvedValueOnce({
        error: 'Error retrieving file',
      });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/getFiles`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).get(`/projects//getFiles`);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /projects/:projectId/createFile', () => {
    it('should successfully create and return a new project file', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: 'newfile.py',
        fileType: 'PYTHON',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce(mockDatabaseProjectState);
      saveFileInStateSpy.mockResolvedValueOnce(mockDatabaseProjectFile);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createFile`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFileJSONResponse);
    });

    it('should return 400 if file name is not provided', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        fileType: 'PYTHON',
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createFile`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if file type is invalid', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: 'racket file',
        fileType: 'RACKET',
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createFile`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
        name: 'newfile.py',
        fileType: 'PYTHON',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createFile`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: 'newfile.py',
        fileType: 'PYTHON',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce(mockDatabaseProjectState);
      saveFileInStateSpy.mockResolvedValueOnce({
        error: 'Error saving file',
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/createFile`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).post(`/projects//createFile`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /projects/:projectId/deleteFileById/:fileId', () => {
    it('should successfully delete a project file', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      deleteFileInStateSpy.mockResolvedValueOnce(mockDatabaseProjectFile);

      const response = await supertest(app)
        .delete(
          `/projects/${mockDatabaseProject._id}/deleteFileById/${mockDatabaseProjectFile._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFileJSONResponse);
    });

    it('should return 403 if user is not owner', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      const response = await supertest(app)
        .delete(
          `/projects/${mockDatabaseProject._id}/deleteFileById/${mockDatabaseProjectFile._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .delete(
          `/projects/${mockDatabaseProject._id}/deleteFileById/${mockDatabaseProjectFile._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      deleteFileInStateSpy.mockResolvedValueOnce({
        error: 'Error deleting file',
      });

      const response = await supertest(app)
        .delete(
          `/projects/${mockDatabaseProject._id}/deleteFileById/${mockDatabaseProjectFile._id}`,
        )
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).delete(
        `/projects//deleteFileById/${mockDatabaseProjectFile._id}`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if fileId not provided', async () => {
      const response = await supertest(app).delete(
        `/projects/${mockDatabaseProject._id}/deleteFileById/`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /projects/:projectId/updateFileById/:fileId', () => {
    it('should successfully update a project file', async () => {
      const newName = 'goodbye.py';
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: newName,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      updateProjectFileSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectFile,
        name: newName,
      });

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/updateFileById/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockFileJSONResponse,
        name: newName,
      });
    });

    it('should return 403 if user is not owner', async () => {
      const mockReqBody = {
        actor: mockViewerUser.username,
        name: 'goodbye.py',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/updateFileById/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
        name: 'goodbye.py',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/updateFileById/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
        name: 'goodbye.py',
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      updateProjectFileSpy.mockResolvedValueOnce({
        error: 'Error updating file',
      });

      const response = await supertest(app)
        .patch(`/projects/${mockDatabaseProject._id}/updateFileById/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects//updateFileById/${mockDatabaseProjectFile._id}`,
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 if fileId not provided', async () => {
      const response = await supertest(app).patch(
        `/projects/${mockDatabaseProject._id}/updateFileById/`,
      );
      expect(response.status).toBe(404);
    });
  });

  describe('GET /projects/:projectId/file/:fileId', () => {
    it('should successfully retrieve project file', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      getProjectFileByIdSpy.mockResolvedValueOnce(mockDatabaseProjectFile);

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/file/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFileJSONResponse);
    });

    it('should return 400 if file is not part of current state', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      const paramId = new ObjectId();

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/file/${paramId}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/file/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectStateByIdSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectState,
        files: [mockDatabaseProjectFile._id],
      });
      getProjectFileByIdSpy.mockResolvedValueOnce({
        error: 'Error retrieving file',
      });

      const response = await supertest(app)
        .get(`/projects/${mockDatabaseProject._id}/file/${mockDatabaseProjectFile._id}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if projectId not provided', async () => {
      const response = await supertest(app).get(`/projects//file/${mockDatabaseProjectFile._id}`);
      expect(response.status).toBe(404);
    });

    it('should return 404 if fileId not provided', async () => {
      const response = await supertest(app).get(`/projects/${mockDatabaseProject._id}/file/`);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /projects/:projectId/:fileId/addComment', () => {
    it('should successfully add comment to file', async () => {
      const mockReqBody = {
        comment: mockComment,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      saveFileCommentSpy.mockResolvedValueOnce(mockDatabaseComment);
      addCommentToFileSpy.mockResolvedValueOnce({
        ...mockDatabaseProjectFile,
        comments: [mockDatabaseComment._id],
      });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toBe(mockCommentJSONResponse);
    });

    it('should return 400 if commenter is not provided', async () => {
      const mockReqBody = {
        comment: {
          text: 'test comment',
          // missing commentBy
          commentDateTime: new Date(),
          lineNumber: 1,
        },
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if comment body is not provided', async () => {
      const mockReqBody = {
        comment: {
          // missing text
          commentBy: 'harry',
          commentDateTime: new Date(),
          lineNumber: 1,
        },
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 400 if line number is not provided', async () => {
      const mockReqBody = {
        comment: {
          text: 'test comment',
          commentBy: 'harry',
          commentDateTime: new Date(),
          // missing lineNumber
        },
      };

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return 403 if commenter is not a project collaborator', async () => {
      const mockReqBody = {
        comment: {
          ...mockComment,
          commentBy: mockOutsiderUser.username,
        },
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        comment: mockComment,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockViewerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      saveFileCommentSpy.mockResolvedValueOnce({ error: 'error saving comment' });

      const response = await supertest(app)
        .post(`/projects/${mockDatabaseProject._id}/${mockDatabaseProjectFile._id}/addComment`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /projects/:projectId/:fileId/deleteCommentById/:commentId', () => {
    it('should succesfully delete and return comment from file', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      deleteFileCommentSpy.mockResolvedValueOnce(mockDatabaseComment);
      removeCommentFromFileSpy.mockResolvedValueOnce(mockDatabaseProjectFile);

      const projId = mockDatabaseProject._id;
      const fileId = mockDatabaseProjectFile._id;
      const commentId = mockDatabaseComment._id;
      const response = await supertest(app)
        .post(`/projects/${projId}/${fileId}/deleteCommentById/${commentId}`)
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toBe(mockCommentJSONResponse);
    });

    it('should return 400 for missing actor', async () => {
      const projId = mockDatabaseProject._id;
      const fileId = mockDatabaseProjectFile._id;
      const commentId = mockDatabaseComment._id;
      const response = await supertest(app).post(
        `/projects/${projId}/${fileId}/deleteCommentById/${commentId}`,
      );

      expect(response.status).toBe(400);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      const mockReqBody = {
        actor: mockOutsiderUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOutsiderUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);

      const projId = mockDatabaseProject._id;
      const fileId = mockDatabaseProjectFile._id;
      const commentId = mockDatabaseComment._id;
      const response = await supertest(app)
        .post(`/projects/${projId}/${fileId}/deleteCommentById/${commentId}`)
        .send(mockReqBody);

      expect(response.status).toBe(403);
    });

    it('should return 500 on service error', async () => {
      const mockReqBody = {
        actor: mockOwnerUser.username,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOwnerUser);
      getProjectByIdSpy.mockResolvedValueOnce(mockDatabaseProject);
      deleteFileCommentSpy.mockResolvedValueOnce({ error: 'error deleting file comment' });

      const projId = mockDatabaseProject._id;
      const fileId = mockDatabaseProjectFile._id;
      const commentId = mockDatabaseComment._id;
      const response = await supertest(app)
        .post(`/projects/${projId}/${fileId}/deleteCommentById/${commentId}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return 404 if commentId not provided', async () => {
      const projId = mockDatabaseProject._id;
      const fileId = mockDatabaseProjectFile._id;
      const response = await supertest(app).post(
        `/projects/${projId}/${fileId}/deleteCommentById/`,
      );

      expect(response.status).toBe(404);
    });
  });
});
