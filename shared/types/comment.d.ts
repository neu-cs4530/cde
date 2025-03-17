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
 * Interface extending the request body for adding a comment to a project file.
 * - `id`: The unique identifier of the project file being commented on.
 * - `comment`: The project file comment object being added.
 */
export interface AddProjectFileCommentRequest extends Request {
  body: {
    id: string;
    comment: ProjectFileComment;
  };
}

/**
 * Type representing possible responses for a Comment-related operation.
 * - Either a `DatabaseComment` object or an error message.
 */
export type CommentResponse = DatabaseComment | { error: string };

/**
 * Type representing possible responses for a ProjectFileComment-related operation.
 * - Either a `DatabaseComment` object or an error message.
 */
export type CommentResponse = DatabaseComment | { error: string };
