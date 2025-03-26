import ProjectStateModel from '../../../models/projectStates.model';
import {
  saveProjectState,
  deleteProjectStateById,
  updateProjectState,
  getProjectStateById,
  filterProjectStateFilesBySearch,
} from '../../../services/project/projectState.service';
import { ObjectId } from 'mongodb';
import {
  ProjectState,
  DatabaseProjectState,
  PopulatedDatabaseProjectState,
  ProjectFile,
  PopulatedDatabaseProjectFile,
} from '../../../../shared/types/types';

jest.mock('../../../models/projectStates.model');

const fakeObjectId = new ObjectId();

const fakeProjectFile: PopulatedDatabaseProjectFile = {
  _id: new ObjectId(),
  name: 'main.py',
  fileType: 'PYTHON',
  contents: 'print("Hello")',
  comments: [],
};

const fakeState: ProjectState = {
  files: [
    {
      name: fakeProjectFile.name,
      fileType: fakeProjectFile.fileType,
      contents: fakeProjectFile.contents,
      comments: fakeProjectFile.comments,
    },
  ],
};

const fakeDatabaseState: DatabaseProjectState = {
  _id: fakeObjectId,
  files: [fakeProjectFile._id],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Project State Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveProjectState', () => {
    it('should return the saved state', async () => {
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(fakeDatabaseState);
      const result = await saveProjectState(fakeState);
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if saving fails', async () => {
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(null);
      const result = await saveProjectState({} as any);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.create as jest.Mock).mockRejectedValue(new Error('save error'));
      const result = await saveProjectState({} as any);
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectStateById', () => {
    it('should delete and return the state', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseState);
      const result = await deleteProjectStateById(fakeObjectId.toHexString());
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if state is not found', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result = await deleteProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('delete error'));
      const result = await deleteProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });
  });

  describe('updateProjectState', () => {
    it('should update and return the state', async () => {
      const updates = { files: [fakeProjectFile._id] };
      const updatedState = { ...fakeDatabaseState, ...updates };
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedState);
      const result = await updateProjectState(fakeObjectId.toHexString(), updates as any);
      expect(result).toEqual(updatedState);
    });

    it('should return error if update fails', async () => {
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result = await updateProjectState(fakeObjectId.toHexString(), {});
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('update error'));
      const result = await updateProjectState(fakeObjectId.toHexString(), {});
      expect('error' in result).toBe(true);
    });
  });

  describe('getProjectStateById', () => {
    it('should return the state if found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      const result = await getProjectStateById(fakeObjectId.toHexString());
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await getProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockRejectedValue(new Error('find error'));
      const result = await getProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });
  });

  describe('filterProjectStateFilesBySearch', () => {
    const populatedState: PopulatedDatabaseProjectState = {
      ...fakeDatabaseState,
      files: [fakeProjectFile],
    };

    it('should return the file if found by name', () => {
      const result = filterProjectStateFilesBySearch(populatedState, 'main');
      expect(result).toEqual(fakeProjectFile);
    });

    it('should return error if no matching file is found', () => {
      const result = filterProjectStateFilesBySearch(populatedState, 'other');
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', () => {
      const badState = null as unknown as PopulatedDatabaseProjectState;
      const result = filterProjectStateFilesBySearch(badState, 'main');
      expect('error' in result).toBe(true);
    });
  });
});
