import { ObjectId } from 'mongodb';

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
 */
export interface ProjectFile {
  name: string;
  fileType: ProjectFileType;
  contents: string;
}

/**
 * Represents a project file stored in the database.
 * - `_id`: Unique identifier for the project file.
 * - `name`: The file's name, including any extension.
 * - `fileType`: The file's type.
 * - `contents`: The contents of the file as a string.
 */
export interface DatabaseProjectFile extends ProjectFile {
  _id: ObjectId;
}
