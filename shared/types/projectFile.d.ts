import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { ProjectFileComment, DatabaseProjectFileComment } from './comment';

/**
 * Type representing a project file's type. Accounts for first-class supported
 * filetypes.
 * - `PYTHON`: .py file
 * - `JAVA`: .java file
 * - `JAVASCRIPT`: .js file
 * - `OTHER`: any other file extension
 */
export type ProjectFileType = 'PYTHON' | 'JAVA' | 'JAVASCRIPT' | 'OTHER';

/**
 * Represents a file in a project.
 * - `name`: The file's name, including any extension.
 * - `fileType`: The file's type.
 * - `contents`: The contents of the file as a string.
 * - `comments`: The comments on the file.
 */
export interface ProjectFile {
  name: string;
  fileType: ProjectFileType;
  contents: string;
  comments: ProjectFileComment[];
}

/**
 * Represents a project file stored in the database.
 * - `_id`: Unique identifier for the project file.
 * - `name`: The file's name, including any extension.
 * - `fileType`: The file's type.
 * - `contents`: The contents of the file as a string.
 * - `comments`: An array of ObjectIds referencing the comments on the file.
 */
export interface DatabaseProjectFile extends Omit<ProjectFile, 'comments'> {
  _id: ObjectId;
  comments: ObjectId[];
}

/**
 * Represents a fully populated project file from the database.
 * - `comments`: An array of populated `DatabaseProjectFileComment` objects.
 */
export interface PopulatedDatabaseProjectFile extends Omit<DatabaseProjectFile, 'comments'> {
  comments: DatabaseProjectFileComment[];
}

/**
 * A type representing the possible responses for a ProjectFile operation.
 * - Either a `DatabaseProjectFile` object or an error message.
 */
export type ProjectFileResponse = DatabaseProjectFile | { error: string };

/**
 * Express request for creating project files, containing project ID and
 * file data.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `actor`: The username of the actor submitted in the request (body).
 */
export interface CreateFileRequest extends Request {
  params: {
    projectId: string;
  };
  body: {
    actor: string;
    name: string;
    fileType: ProjectFileType;
  };
}

/**
 * Express request for updating files, containing project and file IDs,
 * and the username of the actor.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `fileId`: The ID of the file provided as a route parameter.
 * - `actor`: The username of the actor submitted in the request (body).
 * - `name`: Optionally, a new name for the file.
 * - `fileType`: Optionally, a new file type.
 */
export interface FileRequest extends Request {
  params: {
    projectId: string;
    fileId: string;
  };
  body: {
    actor: string;
    name?: string;
    fileType?: ProjectFileType;
    contents?: string;
  };
}

/**
 * Express request for getting a file, containing project and file IDs,
 * and the username of the actor.
 * - `projectId`: The ID of the project provided as a route parameter.
 * - `fileId`: The ID of the file provided as a route parameter.
 * - `actor`: The username of the actor provided as a route query.
 */
export interface GetFileRequest extends Request {
  params: {
    projectId: string;
    fileId: string;
  };
  query: {
    actor: string;
  };
}
