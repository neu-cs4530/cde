import { ObjectId } from 'mongodb';
import {
  DatabaseProjectFile,
  ProjectFile,
  ProjectFileResponse,
  ProjectFileComment,
} from '@fake-stack-overflow/shared/types/types';
import ProjectFileModel from '../../../models/projectFiles.model';
import ProjectFileCommentModel from '../../../models/projectFileComments.model';
import {
  saveProjectFile,
  deleteProjectFileById,
  updateProjectFile,
  resolveProjectFileCommentsByLine,
} from '../../../services/project/projectFile.service';

jest.mock('../../../models/projectFiles.model');
jest.mock('../../../models/projectFileComments.model');

const FAKE_ID: string = new ObjectId().toHexString();
const fakeObjectId: ObjectId = new ObjectId();

const fakeComment: ProjectFileComment = {
  lineNumber: 1,
  text: 'Test comment',
  commentBy: 'tester',
  commentDateTime: new Date(),
};

const fakeProjectFile: ProjectFile = {
  name: 'example.py',
  fileType: 'PYTHON',
  contents: 'print("Hello")',
  comments: [fakeComment],
};

const fakeDatabaseFile: DatabaseProjectFile = {
  _id: fakeObjectId,
  ...fakeProjectFile,
  comments: [fakeObjectId],
};

describe('Project File Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveProjectFile', () => {
    it('should return the saved file', async () => {
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      const result: ProjectFileResponse = await saveProjectFile(fakeProjectFile);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if creation fails', async () => {
      (ProjectFileModel.create as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await saveProjectFile({
        name: '',
        fileType: 'OTHER',
        contents: '',
        comments: [],
      });
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.create as jest.Mock).mockRejectedValue(new Error('Create error'));
      const result: ProjectFileResponse = await saveProjectFile({
        name: '',
        fileType: 'OTHER',
        contents: '',
        comments: [],
      });
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectFileById', () => {
    it('should delete and return the file', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      const result: ProjectFileResponse = await deleteProjectFileById(FAKE_ID);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if file not found', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await deleteProjectFileById(FAKE_ID);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Delete error'));
      const result: ProjectFileResponse = await deleteProjectFileById(FAKE_ID);
      expect('error' in result).toBe(true);
    });
  });

  describe('updateProjectFile', () => {
    it('should update non-array fields using $set', async () => {
      const updates: Partial<ProjectFile> = { name: 'updated.py' };
      const updated = { ...fakeDatabaseFile, ...updates };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result: ProjectFileResponse = await updateProjectFile(FAKE_ID, updates);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
    });

    it('should update array fields using $push', async () => {
      const updates: Partial<ProjectFile> = {
        comments: [fakeComment],
      };
      const updated = { ...fakeDatabaseFile, comments: [fakeObjectId] };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result: ProjectFileResponse = await updateProjectFile(FAKE_ID, updates);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
    });

    it('should update both array and non-array fields together', async () => {
      const updates: Partial<ProjectFile> = {
        name: 'updated.py',
        comments: [fakeComment],
      };
      const updated = { ...fakeDatabaseFile, name: 'updated.py', comments: [fakeObjectId] };
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);
      const result: ProjectFileResponse = await updateProjectFile(FAKE_ID, updates);
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(updated);
      expect('name' in result && result.name).toEqual('updated.py');
      expect('comments' in result && result.comments).toHaveLength(1);
    });

    it('should return error if update fails', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await updateProjectFile(FAKE_ID, {});
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Update error'));
      const result: ProjectFileResponse = await updateProjectFile(FAKE_ID, {});
      expect('error' in result).toBe(true);
    });
  });

  describe('resolveProjectFileCommentsByLine', () => {
    it('should resolve comments by line number and update the file', async () => {
      const lineNumber = 5;
      const commentId1 = new ObjectId();
      const commentId2 = new ObjectId();

      const fileWithComments: DatabaseProjectFile = {
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

      const result: ProjectFileResponse = await resolveProjectFileCommentsByLine(
        FAKE_ID,
        lineNumber,
      );
      if ('error' in result) throw new Error(`Unexpected error: ${result.error}`);
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if project file is not found', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await resolveProjectFileCommentsByLine(FAKE_ID, 1);
      expect('error' in result).toBe(true);
    });

    it('should return error if file update fails after comment deletion', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockResolvedValue({
        ...fakeDatabaseFile,
        comments: [],
      });
      (ProjectFileCommentModel.find as jest.Mock).mockResolvedValue([]);
      (ProjectFileCommentModel.deleteMany as jest.Mock).mockResolvedValue({});
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await resolveProjectFileCommentsByLine(FAKE_ID, 1);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOne as jest.Mock).mockRejectedValue(new Error('Find error'));
      const result: ProjectFileResponse = await resolveProjectFileCommentsByLine(FAKE_ID, 1);
      expect('error' in result).toBe(true);
    });
  });
});
