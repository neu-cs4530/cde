import { ObjectId } from 'mongodb';
import {
  SafeDatabaseUser,
  CollaboratorRole,
  Project,
  DatabaseProject,
  ProjectResponse,
  ProjectState,
  DatabaseProjectState,
  DatabaseProjectFile,
} from '@fake-stack-overflow/shared/types/types';
import ProjectModel from '../../../models/projects.model';
import ProjectStateModel from '../../../models/projectStates.model';
import ProjectFileModel from '../../../models/projectFiles.model';
import UserModel from '../../../models/users.model';
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
} from '../../../services/project/project.service';
import * as projectService from '../../../services/project/project.service';

jest.mock('../../../models/projects.model');
jest.mock('../../../models/projectStates.model');
jest.mock('../../../models/projectFiles.model');
jest.mock('../../../models/users.model');

const FAKE_PROJECT_ID = new ObjectId().toHexString();

const fakeProjectFile: DatabaseProjectFile = {
  _id: new ObjectId(),
  name: 'main.py',
  fileType: 'PYTHON',
  contents: 'print("Hello")',
  comments: [],
};

const fakeState: ProjectState = {
  files: [],
};

const fakeDatabaseState: DatabaseProjectState = {
  _id: new ObjectId(),
  files: [fakeProjectFile._id],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeProject: DatabaseProject = {
  _id: new ObjectId(),
  name: 'Fake Project',
  creator: 'testuser',
  collaborators: [],
  currentState: fakeDatabaseState._id,
  savedStates: [],
  createdAt: new Date(),
};

const fakeUser: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'testuser',
  dateJoined: new Date(),
};

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveProject', () => {
    it('should return the saved project', async () => {
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(fakeState);
      (ProjectModel.create as jest.Mock).mockResolvedValue(fakeProject);
      const projectInput = {
        name: fakeProject.name,
        creator: fakeProject.creator,
        collaborators: [],
        currentState: fakeState,
        savedStates: [],
      } as unknown as Project;
      const result = await saveProject(projectInput);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual(fakeProject);
    });

    it('should return an error if creation fails', async () => {
      (ProjectModel.create as jest.Mock).mockResolvedValue(null);
      const result = await saveProject({} as unknown as Project);
      expect('error' in result).toBe(true);
    });

    it('should return an error if an exception is thrown', async () => {
      (ProjectModel.create as jest.Mock).mockRejectedValue(new Error('failed'));
      const result = await saveProject({} as unknown as Project);
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectById', () => {
    it('should delete and return the project', async () => {
      (ProjectModel.findById as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findById as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.deleteMany as jest.Mock).mockResolvedValue([]);
      (ProjectStateModel.deleteMany as jest.Mock).mockResolvedValue([fakeDatabaseState]);
      (ProjectModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeProject);
      const result = await deleteProjectById(FAKE_PROJECT_ID);
      if ('error' in result) throw new Error(result.error);
      expect(result).toEqual(fakeProject);
    });

    it('should return an error if deletion fails', async () => {
      (ProjectModel.findById as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findById as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.deleteMany as jest.Mock).mockResolvedValue([]);
      (ProjectStateModel.deleteMany as jest.Mock).mockResolvedValue([fakeDatabaseState]);
      (ProjectModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result = await deleteProjectById(FAKE_PROJECT_ID);
      expect('error' in result).toBe(true);
    });

    it('should return an error if exception is thrown', async () => {
      (ProjectModel.findById as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findById as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.deleteMany as jest.Mock).mockResolvedValue([]);
      (ProjectStateModel.deleteMany as jest.Mock).mockResolvedValue([fakeDatabaseState]);
      (ProjectModel.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('delete error'));
      const result = await deleteProjectById(FAKE_PROJECT_ID);
      expect('error' in result).toBe(true);
    });
  });

  describe('updateProject', () => {
    it('should update non-array fields using $set', async () => {
      const updates = { name: 'Updated Name' };
      const updatedProject = { ...fakeProject, ...updates };
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedProject);
      const result = await updateProject(FAKE_PROJECT_ID, updates);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual(updatedProject);
    });

    it('should update array fields using $push', async () => {
      const updates = {
        collaborators: [
          {
            userId: new ObjectId(),
            role: 'EDITOR' as CollaboratorRole,
          },
        ],
      };
      const updatedProject = { ...fakeProject, ...updates };
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedProject);
      const result = await updateProject(FAKE_PROJECT_ID, updates);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual(updatedProject);
    });

    it('should update both array and non-array fields together', async () => {
      const updates = {
        name: 'Updated Name',
        collaborators: [
          {
            userId: new ObjectId(),
            role: 'VIEWER' as CollaboratorRole,
          },
        ],
      };
      const updatedProject = { ...fakeProject, ...updates };
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedProject);
      const result = await updateProject(FAKE_PROJECT_ID, updates);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual(updatedProject);
      expect(result.name).toEqual('Updated Name');
      expect(result.collaborators).toHaveLength(1);
    });

    it('should return an error if update fails', async () => {
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result = await updateProject(FAKE_PROJECT_ID, {});
      expect('error' in result).toBe(true);
    });

    it('should return an error if exception is thrown', async () => {
      (ProjectModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('update error'));
      const result = await updateProject(FAKE_PROJECT_ID, {});
      expect('error' in result).toBe(true);
    });
  });

  describe('addProjectCollaborator', () => {
    it('should add a collaborator to a project and update the user', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeProject);
      (UserModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const result = await addProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username, 'VIEWER');
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toEqual(fakeProject);
    });

    it('should return error if user not found', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await addProjectCollaborator(FAKE_PROJECT_ID, '1', 'EDITOR');
      expect('error' in result).toBe(true);
    });

    it('should throw an error if user is not found', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await addProjectCollaborator(FAKE_PROJECT_ID, '1', 'VIEWER');
      expect(result).toEqual({
        error: expect.stringContaining('Error finding user'),
      });
    });

    it('should throw an error if project update fails', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });
      jest
        .spyOn(projectService, 'updateProject')
        .mockResolvedValue(null as unknown as ProjectResponse);

      const result = await addProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username, 'EDITOR');

      expect(result).toEqual({
        error: expect.stringContaining('Error updating project collaborators'),
      });
    });

    it('should throw an error if user update fails', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      (UserModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await addProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username, 'EDITOR');

      expect(result).toEqual({
        error: expect.stringContaining('Error updating user'),
      });
    });
  });

  describe('removeProjectCollaborator', () => {
    it('should remove a collaborator from a project and update the user', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeProject);
      (UserModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });

      const result = await removeProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username);
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toEqual(fakeProject);
    });

    it('should return error if user not found', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await removeProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username);
      expect('error' in result).toBe(true);
    });

    it('should throw an error if project update fails', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await removeProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username);

      expect(result).toEqual({
        error: expect.stringContaining('Error updating project'),
      });
    });

    it('should throw an error if user update fails', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser),
      });
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeProject);
      (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await removeProjectCollaborator(FAKE_PROJECT_ID, fakeUser.username);

      expect(result).toEqual({
        error: expect.stringContaining('Error updating user'),
      });
    });
  });

  describe('updateProjectCollaboratorRole', () => {
    it('should update the collaborator role', async () => {
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeProject);

      const result = await updateProjectCollaboratorRole(
        FAKE_PROJECT_ID,
        fakeUser._id.toString(),
        'EDITOR',
      );
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toEqual(fakeProject);
    });

    it('should throw an error if project update fails', async () => {
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await updateProjectCollaboratorRole(
        FAKE_PROJECT_ID,
        fakeUser._id.toString(),
        'EDITOR',
      );

      expect(result).toEqual({
        error: expect.stringContaining('Error updating collaborators'),
      });
    });
  });

  describe('getProjectById', () => {
    it('should return a project by ID', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      const result = await getProjectById(FAKE_PROJECT_ID);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual(fakeProject);
    });

    it('should return error if project is not found', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await getProjectById(FAKE_PROJECT_ID);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectModel.findOne as jest.Mock).mockRejectedValue(new Error('find error'));
      const result = await getProjectById(FAKE_PROJECT_ID);
      expect('error' in result).toBe(true);
    });
  });

  describe('createProjectBackup', () => {
    it('should create a backup project state', async () => {
      const dupFile: DatabaseProjectFile = {
        ...fakeProjectFile,
        _id: new ObjectId(),
      };
      const dupState: DatabaseProjectState = {
        _id: new ObjectId(),
        files: [dupFile._id],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findById as jest.Mock).mockResolvedValue(fakeProjectFile);
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(dupFile);
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(dupState);
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...fakeProject,
        currentState: dupState._id,
        savedStates: [fakeDatabaseState._id],
      });
      
      const result = await createProjectBackup(FAKE_PROJECT_ID);
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toEqual({
        ...fakeProject,
        currentState: dupState._id,
        savedStates: [fakeDatabaseState._id],
      });
    });

    it('should return error if project not found', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Project not found'),
      });
    });

    it('should return error if state not found', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Current project state not found'),
      });
    });

    it('should return error if file not found', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Project file not found'),
      });
    });

    it('should return error if file not created', async () => {
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findById as jest.Mock).mockResolvedValue(fakeProjectFile);
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Error duplicating project file'),
      });
    });

    it('should return error if state not created', async () => {
      const dupFile: DatabaseProjectFile = {
        ...fakeProjectFile,
        _id: new ObjectId(),
      };

      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findById as jest.Mock).mockResolvedValue(fakeProjectFile);
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(dupFile);
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Error duplicating project state'),
      });
    });

    it('should return error if project not updated', async () => {
      const dupFile: DatabaseProjectFile = {
        ...fakeProjectFile,
        _id: new ObjectId(),
      };
      const dupState: DatabaseProjectState = {
        _id: new ObjectId(),
        files: [dupFile._id],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findById as jest.Mock).mockResolvedValue(fakeProjectFile);
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(dupFile);
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(dupState);
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await createProjectBackup(FAKE_PROJECT_ID);
      
      expect(result).toEqual({
        error: expect.stringContaining('Error updating project'),
      });
    });
  });

  describe('revertProjectToState', () => {
    it('should revert project to saved state', async () => {
      const stateId = 'state123';
      const revertedState = { _id: new ObjectId() };
      const updates = {
        currentState: revertedState._id,
        savedStates: [revertedState._id],
      };

      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(revertedState);
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...fakeProject,
        ...updates,
      });

      const result = await revertProjectToState(FAKE_PROJECT_ID, stateId);
      if ('error' in result) throw new Error('Unexpected error');
      expect(result).toEqual({ ...fakeProject, ...updates });
    });

    it('should return error if state not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await revertProjectToState(FAKE_PROJECT_ID, 'missing');
      expect('error' in result).toBe(true);
    });

    it('should return error if project not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue({ _id: new ObjectId() });
      (ProjectModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await revertProjectToState(FAKE_PROJECT_ID, 'validState');
      expect('error' in result).toBe(true);
    });
  });
});
