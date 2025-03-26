import ProjectFileModel from '../../../models/projectFiles.model';
import ProjectFileCommentModel from '../../../models/projectFileComments.model';
import {
  saveProjectFile,
  deleteProjectFileById,
  updateProjectFile,
  resolveProjectFileCommentsByLine,
} from '../../../services/project/projectFile.service';
import { ObjectId } from 'mongodb';
import { DatabaseProjectFile, ProjectFile, ProjectFileType, ProjectFileResponse } from '../../../../shared/types/types';

jest.mock('../../../models/projectFiles.model');
jest.mock('../../../models/projectFileComments.model');

const fakeId = new ObjectId().toHexString();
const fakeObjectId = new ObjectId();

const fakeProjectFile: ProjectFile = {
  name: 'example.py',
  fileType: 'PYTHON' as ProjectFileType,
  contents: 'print("Hello")',
  comments: [],
};

const fakeDatabaseFile: DatabaseProjectFile = {
  _id: fakeObjectId,
  ...fakeProjectFile,
  comments: [],
};

describe('Project File Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveProjectFile', () => {
    it('should return the saved file', async () => {
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      const result = await saveProjectFile(fakeProjectFile);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if creation fails', async () => {
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(null);
      const result = await saveProjectFile({} as any);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.create as jest.Mock).mockRejectedValue(new Error('Create error'));
      const result = await saveProjectFile({} as any);
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectFileById', () => {
    it('should delete and return the file', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      const result = await deleteProjectFileById(fakeId);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if file not found', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result = await deleteProjectFileById(fakeId);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Delete error'));
      const result = await deleteProjectFileById(fakeId);
      expect('error' in result).toBe(true);
    });
  });

  describe('updateProjectFile', () => {
    it('should update non-array fields using $set', async () => {
      const updates = { name: 'updated.py' };
      const updated = { ...fakeDatabaseFile, ...updates };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result = await updateProjectFile(fakeId, updates);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
    });

    it('should update array fields using $push', async () => {
      const updates = {
        comments: [new ObjectId()],
      };
      const updated = { ...fakeDatabaseFile, ...updates };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result = await updateProjectFile(fakeId, updates as any);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
    });

    it('should update both array and non-array fields together', async () => {
      const updates = {
        name: 'updated.py',
        comments: [new ObjectId()],
      };
      const updated = { ...fakeDatabaseFile, ...updates };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result = await updateProjectFile(fakeId, updates as any);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
      expect('name' in result && result.name).toEqual('updated.py');
      expect('comments' in result && result.comments).toHaveLength(1);
    });

    it('should return error if update fails', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result = await updateProjectFile(fakeId, {});
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Update error'));
      const result = await updateProjectFile(fakeId, {});
      expect('error' in result).toBe(true);
    });
  });

  describe('resolveProjectFileCommentsByLine', () => {
    it('should resolve comments by line number and update the file', async () => {
      const lineNumber = 5;
      const commentId1 = new ObjectId();
      const commentId2 = new ObjectId();

      const fileWithComments = {
        ...fakeDatabaseFile,
        comments: [commentId1, commentId2],
      };

      const commentDocs = [
        { _id: commentId1, lineNumber },
        { _id: commentId2, lineNumber },
      ];

      (ProjectFileModel.findOne as jest.Mock).mockResolvedValue(fileWithComments);
      (ProjectFileCommentModel.find as jest.Mock).mockResolvedValue(commentDocs);
      (ProjectFileCommentModel.deleteMany as jest.Mock).mockResolvedValue({});
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeDatabaseFile);

      const result = await resolveProjectFileCommentsByLine(fakeId, lineNumber);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if project file is not found', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await resolveProjectFileCommentsByLine(fakeId, 1);
      expect('error' in result).toBe(true);
    });

    it('should return error if file update fails after comment deletion', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockResolvedValue({ ...fakeDatabaseFile, comments: [] });
      (ProjectFileCommentModel.find as jest.Mock).mockResolvedValue([]);
      (ProjectFileCommentModel.deleteMany as jest.Mock).mockResolvedValue({});
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result = await resolveProjectFileCommentsByLine(fakeId, 1);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockRejectedValue(new Error('Find error'));
      const result = await resolveProjectFileCommentsByLine(fakeId, 1);
      expect('error' in result).toBe(true);
    });
  });
});