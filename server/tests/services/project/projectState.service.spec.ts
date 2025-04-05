import { ObjectId } from 'mongodb';
import {
  ProjectState,
  DatabaseProjectState,
  ProjectStateResponse,
  ProjectFile,
  DatabaseProjectFile,
  ProjectFileResponse,
} from '@fake-stack-overflow/shared/types/types';
import ProjectStateModel from '../../../models/projectStates.model';
import ProjectFileModel from '../../../models/projectFiles.model';
import {
  saveProjectState,
  deleteProjectStateById,
  updateProjectState,
  getProjectStateById,
  saveFileInState,
  deleteFileInState,
  // filterProjectStateFilesBySearch,
} from '../../../services/project/projectState.service';

jest.mock('../../../models/projectStates.model');
jest.mock('../../../models/projectFiles.model');

const fakeObjectId: ObjectId = new ObjectId();

const fakeFile: ProjectFile = {
  name: 'main.py',
  fileType: 'PYTHON',
  contents: 'print("Hello")',
  comments: [],
};

const fakeDatabaseFile: DatabaseProjectFile = {
  _id: new ObjectId(),
  name: fakeFile.name,
  fileType: fakeFile.fileType,
  contents: fakeFile.contents,
  comments: [],
};

const fakeState: ProjectState = {
  files: [fakeFile],
};

const fakeDatabaseState: DatabaseProjectState = {
  _id: fakeObjectId,
  files: [fakeDatabaseFile._id],
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
      const result: ProjectStateResponse = await saveProjectState(fakeState);
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if saving fails', async () => {
      (ProjectStateModel.create as jest.Mock).mockResolvedValue(null);
      const result: ProjectStateResponse = await saveProjectState({ files: [] });
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.create as jest.Mock).mockRejectedValue(new Error('save error'));
      const result: ProjectStateResponse = await saveProjectState({ files: [] });
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectStateById', () => {
    it('should delete and return the state', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseState);
      const result: ProjectStateResponse = await deleteProjectStateById(fakeObjectId.toHexString());
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if state is not found', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result: ProjectStateResponse = await deleteProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOneAndDelete as jest.Mock).mockRejectedValue(
        new Error('delete error'),
      );
      const result: ProjectStateResponse = await deleteProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });
  });

  describe('updateProjectState', () => {
    it('should update and return the state', async () => {
      const updates: Partial<ProjectState> = {
        files: [fakeFile],
      };
      const updatedState: DatabaseProjectState = { ...fakeDatabaseState };
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedState);
      const result: ProjectStateResponse = await updateProjectState(
        fakeObjectId.toHexString(),
        updates,
      );
      expect(result).toEqual(updatedState);
    });

    it('should return error if update fails', async () => {
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result: ProjectStateResponse = await updateProjectState(fakeObjectId.toHexString(), {});
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error('update error'),
      );
      const result: ProjectStateResponse = await updateProjectState(fakeObjectId.toHexString(), {});
      expect('error' in result).toBe(true);
    });
  });

  describe('getProjectStateById', () => {
    it('should return the state if found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      const result: ProjectStateResponse = await getProjectStateById(fakeObjectId.toHexString());
      expect(result).toEqual(fakeDatabaseState);
    });

    it('should return error if not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);
      const result: ProjectStateResponse = await getProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockRejectedValue(new Error('find error'));
      const result: ProjectStateResponse = await getProjectStateById(fakeObjectId.toHexString());
      expect('error' in result).toBe(true);
    });
  });

  describe('saveFileInState', () => {
    it('should save a file in the state', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue({
        ...fakeDatabaseState,
        files: [],
      });
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeDatabaseState);

      const result: ProjectFileResponse = await saveFileInState(
        fakeDatabaseState._id.toString(),
        fakeFile,
      );
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toBe(fakeDatabaseFile);
    });

    it('should return error if state not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await saveFileInState(
        fakeDatabaseState._id.toString(),
        fakeFile,
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if file not created', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue({
        ...fakeDatabaseState,
        files: [],
      });
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await saveFileInState(
        fakeDatabaseState._id.toString(),
        fakeFile,
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if state not updated', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue({
        ...fakeDatabaseState,
        files: [],
      });
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await saveFileInState(
        fakeDatabaseState._id.toString(),
        fakeFile,
      );
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteFileInState', () => {
    it('should delete a file in the state', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...fakeDatabaseState,
        files: [],
      });

      const result: ProjectFileResponse = await deleteFileInState(
        fakeDatabaseState._id.toString(),
        fakeDatabaseFile._id.toString(),
      );
      if ('error' in result) {
        throw new Error(`Unexpected error: ${result.error}`);
      }
      expect(result).toBe(fakeDatabaseFile);
    });

    it('should return error if state not found', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await deleteFileInState(
        fakeDatabaseState._id.toString(),
        fakeDatabaseFile._id.toString(),
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if file not deleted', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await deleteFileInState(
        fakeDatabaseState._id.toString(),
        fakeDatabaseFile._id.toString(),
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if state not updated', async () => {
      (ProjectStateModel.findOne as jest.Mock).mockResolvedValue(fakeDatabaseState);
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      (ProjectStateModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result: ProjectFileResponse = await deleteFileInState(
        fakeDatabaseState._id.toString(),
        fakeDatabaseFile._id.toString(),
      );
      expect('error' in result).toBe(true);
    });
  });

  // describe('filterProjectStateFilesBySearch', () => {
  //   const populatedState: PopulatedDatabaseProjectState = {
  //     ...fakeDatabaseState,
  //     files: [fakeDatabaseFile],
  //   };
  //
  //   it('should return the file if found by name', () => {
  //     const result: ProjectFile | { error: string } = filterProjectStateFilesBySearch(
  //       populatedState,
  //       'main',
  //     );
  //     expect(result).toEqual(fakeDatabaseFile);
  //   });
  //
  //   it('should return error if no matching file is found', () => {
  //     const result: ProjectFile | { error: string } = filterProjectStateFilesBySearch(
  //       populatedState,
  //       'other',
  //     );
  //     expect('error' in result).toBe(true);
  //   });
  //
  //   it('should return error if exception is thrown', () => {
  //     const badState = null as unknown as PopulatedDatabaseProjectState;
  //     const result: ProjectFile | { error: string } = filterProjectStateFilesBySearch(
  //       badState,
  //       'main',
  //     );
  //     expect('error' in result).toBe(true);
  //   });
  // });
});
