import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents a comment on a question or an answer.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 */
export interface Comment {
  text: string;
  commentBy: string;
  commentDateTime: Date;
}

/**
 *  Represents a comment on a project file.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 * - `lineNumber`: The line number the comment is on.
 */
export interface ProjectFileComment extends Comment {
  lineNumber: number;
}

/**
 * Represents a comment stored in the database.
 * - `_id`: Unique identifier for the comment.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 */
export interface DatabaseComment extends Comment {
  _id: ObjectId;
}

/**
 * Represents a project file comment in the database.
 * - `_id`: Unique identifier for the comment.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 * - `lineNumber`: The line number the comment is on.
 */
export interface DatabaseProjectFileComment extends ProjectFileComment {
  _id: ObjectId;
}

/**
 * Interface extending the request body for adding a comment to a question or an answer.
 * - `id`: The unique identifier of the question or answer being commented on.
 * - `type`: The type of the comment, either 'question' or 'answer'.
 * - `comment`: The comment object being added.
 */
export interface AddCommentRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer';
    comment: Comment;
  };
}

/**
 * Express request for adding a comment to a project file.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `fileId`: The ID of the file provided as a route parameter.
 * - `comment`: The project file comment object being added.
 */
export interface AddFileCommentRequest extends Request {
  params: {
    projectId: string;
    fileId: string;
  };
  body: {
    comment: ProjectFileComment;
  };
}

/**
 * Express request for deleting a project file line's comments, containing
 * project and file IDs, and line number.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `fileId`: The ID of the file provided as a route parameter.
 * - `lineNumber`: The line number provided as a route parameter.
 */
export interface DeleteFileCommentsByLineRequest extends Request {
  params: {
    projectId: string;
    fileId: string;
    lineNumber: number;
  };
}

/**
 * Express request for deleting a project file comment, containing
 * project, file, and comment IDs.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `fileId`: The ID of the file provided as a route parameter.
 * - `commentId`: The ID of the comment provided as a route parameter.
 */
export interface DeleteFileCommentByIdRequest extends Request {
  params: {
    projectId: string;
    fileId: string;
    commentId: string;
  };
}

/**
 * Type representing possible responses for a Comment-related operation.
 * - Either a `DatabaseComment` object or an error message.
 */
export type CommentResponse = DatabaseComment | { error: string };

/**
 * Type representing possible responses for a ProjectFileComment-related operation.
 * - Either a `DatabaseProjectFileComment` object or an error message.
 */
export type ProjectFileCommentResponse = DatabaseProjectFileComment | { error: string };
