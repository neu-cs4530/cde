import { ObjectId } from 'mongodb';
import {
  ProjectFileComment,
  DatabaseProjectFileComment,
  DatabaseProjectFile,
  ProjectFileCommentResponse,
  ProjectFileResponse,
} from '@fake-stack-overflow/shared/types/types';
import ProjectFileCommentModel from '../../../models/projectFileComments.model';
import ProjectFileModel from '../../../models/projectFiles.model';
import {
  saveProjectFileComment,
  deleteProjectFileCommentById,
  addCommentToFile,
} from '../../../services/project/projectFileComment.service';

jest.mock('../../../models/projectFileComments.model');
jest.mock('../../../models/projectFiles.model');

const fakeObjectId: ObjectId = new ObjectId();

const fakeProjectFileComment: ProjectFileComment = {
  text: 'Nice function',
  commentBy: 'user1',
  commentDateTime: new Date(),
  lineNumber: 3,
};

const fakeDatabaseComment: DatabaseProjectFileComment = {
  _id: fakeObjectId,
  ...fakeProjectFileComment,
};

const fakeDatabaseFile: DatabaseProjectFile = {
  _id: new ObjectId(),
  name: 'main.py',
  fileType: 'PYTHON',
  contents: 'print("hi")',
  comments: [fakeObjectId],
};

describe('Project File Comment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('saveProjectFileComment', () => {
    it('should return the saved comment', async () => {
      (ProjectFileCommentModel.create as jest.Mock).mockResolvedValue(fakeDatabaseComment);
      const result: ProjectFileCommentResponse =
        await saveProjectFileComment(fakeProjectFileComment);
      expect(result).toEqual(fakeDatabaseComment);
    });

    it('should return error if saving fails', async () => {
      (ProjectFileCommentModel.create as jest.Mock).mockResolvedValue(null);
      const invalidComment: ProjectFileComment = {
        text: '',
        commentBy: '',
        commentDateTime: new Date(),
        lineNumber: 0,
      };
      const result: ProjectFileCommentResponse = await saveProjectFileComment(invalidComment);
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileCommentModel.create as jest.Mock).mockRejectedValue(new Error('save error'));
      const result: ProjectFileCommentResponse =
        await saveProjectFileComment(fakeProjectFileComment);
      expect('error' in result).toBe(true);
    });
  });

  describe('deleteProjectFileCommentById', () => {
    it('should delete and return the comment', async () => {
      (ProjectFileCommentModel.findOneAndDelete as jest.Mock).mockResolvedValue(
        fakeDatabaseComment,
      );
      const result: ProjectFileCommentResponse = await deleteProjectFileCommentById(
        fakeObjectId.toHexString(),
      );
      expect(result).toEqual(fakeDatabaseComment);
    });

    it('should return error if comment is not found', async () => {
      (ProjectFileCommentModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileCommentResponse = await deleteProjectFileCommentById(
        fakeObjectId.toHexString(),
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileCommentModel.findOneAndDelete as jest.Mock).mockRejectedValue(
        new Error('delete error'),
      );
      const result: ProjectFileCommentResponse = await deleteProjectFileCommentById(
        fakeObjectId.toHexString(),
      );
      expect('error' in result).toBe(true);
    });
  });

  describe('addCommentToFile', () => {
    it('should add the comment and return the updated file', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(fakeDatabaseFile);
      const result: ProjectFileResponse = await addCommentToFile(
        fakeDatabaseFile._id.toHexString(),
        fakeDatabaseComment,
      );
      expect(result).toEqual(fakeDatabaseFile);
    });

    it('should return error if file update fails', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      const result: ProjectFileResponse = await addCommentToFile(
        fakeDatabaseFile._id.toHexString(),
        fakeDatabaseComment,
      );
      expect('error' in result).toBe(true);
    });

    it('should return error if exception is thrown', async () => {
      (ProjectFileModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('update error'));
      const result: ProjectFileResponse = await addCommentToFile(
        fakeDatabaseFile._id.toHexString(),
        fakeDatabaseComment,
      );
      expect('error' in result).toBe(true);
    });
  });
});
