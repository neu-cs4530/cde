import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ProjectFileCommentModel from '../../models/projectFileComments.model';
import ProjectFileModel from '../../models/projectFiles.model';
import {
  DatabaseProjectFile,
  ProjectFile,
  ProjectFileResponse,
  ExecutionResult,
} from '../../types/types';

/**
 * Saves a new project file to the database.
 * @param {ProjectFile} file - The project file object to be saved containing full file data.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the saved project file object or an error message.
 */
export const saveProjectFile = async (file: ProjectFile): Promise<ProjectFileResponse> => {
  try {
    const result: DatabaseProjectFile = await ProjectFileModel.create(file);

    if (!result) {
      throw Error('Failed to create project file');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving project file: ${error}` };
  }
};

/**
 * Deletes a project file by its ID.
 * @param {string} fileId - The ID of the project file to be deleted.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the deleted project file object or an error message.
 */
export const deleteProjectFileById = async (fileId: string): Promise<ProjectFileResponse> => {
  try {
    const deletedProjectFile: DatabaseProjectFile | null = await ProjectFileModel.findOneAndDelete({
      _id: fileId,
    });

    if (!deletedProjectFile) {
      throw Error('Error deleting project file');
    }

    return deletedProjectFile;
  } catch (error) {
    return { error: `Error occurred when finding project file: ${error}` };
  }
};

/**
 * Updates an existing project file with the provided fields.
 * @param {string} fileId - The ID of the project file to be updated.
 * @param {Partial<ProjectFile>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the updated project file object or an error message.
 */
export const updateProjectFile = async (
  fileId: string,
  updates: Partial<ProjectFile>,
): Promise<ProjectFileResponse> => {
  try {
    const pushFields: Record<string, unknown> = {};
    const setFields: Record<string, unknown> = {};

    for (const key in updates) {
      if (['comments'].includes(key)) {
        pushFields[key] = updates[key as keyof ProjectFile];
      } else {
        setFields[key] = updates[key as keyof ProjectFile];
      }
    }

    const updateQuery: {
      $push?: Record<string, unknown>;
      $set?: Record<string, unknown>;
    } = {};
    if (Object.keys(pushFields).length > 0) {
      updateQuery.$push = pushFields;

      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          if (['savedStates', 'collaborators'].includes(key)) {
            pushFields[key] = updates[key as keyof ProjectFile];
          } else {
            setFields[key] = updates[key as keyof ProjectFile];
          }
        }
      }
    }
    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }

    const updatedProjectFile: DatabaseProjectFile | null = await ProjectFileModel.findOneAndUpdate(
      { _id: fileId },
      updateQuery,
      { new: true },
    );

    if (!updatedProjectFile) {
      throw Error('Error updating project file');
    }

    return updatedProjectFile;
  } catch (error) {
    return { error: `Error occurred when updating project file: ${error}` };
  }
};

/**
 * Resolves all comments on a specific line in a project file.
 * @param {string} fileId - The ID of the project file where the comments to be resolved are.
 * @param {number} lineNumber - The line number the comments are on.
 * @returns {Promise<ProjectFileResponse>} - Resolves with the updated project file object or an error message.
 */
export const resolveProjectFileCommentsByLine = async (
  fileId: string,
  lineNumber: number,
): Promise<ProjectFileResponse> => {
  try {
    const projectFile = await ProjectFileModel.findOne({ _id: fileId });

    if (!projectFile) {
      throw Error('Project file not found');
    }

    const commentsToDelete = await ProjectFileCommentModel.find({
      _id: { $in: projectFile.comments },
      lineNumber,
    });

    const commentIdsToDelete = commentsToDelete.map(c => c._id);

    await ProjectFileCommentModel.deleteMany({ _id: { $in: commentIdsToDelete } });

    const updatedProjectFile = await ProjectFileModel.findOneAndUpdate(
      { _id: fileId },
      { $pull: { comments: { $in: commentIdsToDelete } } },
      { new: true },
    );

    if (!updatedProjectFile) {
      throw Error('Failed to update project file after resolving comments');
    }

    return updatedProjectFile;
  } catch (error) {
    return { error: `Error occurred when resolving comments: ${error}` };
  }
};

/**
 * Retrieves a project file document by its ID.
 * @param fileId - The ID of the project file to retrieve.
 * @returns {Promise<ProjectFileResponse>} - The project file or an error message.
 */
export const getProjectFile = async (fileId: string): Promise<ProjectFileResponse> => {
  try {
    const file: DatabaseProjectFile | null = await ProjectFileModel.findById(fileId);

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  } catch (error) {
    return { error: `Error retrieving file: ${error}` };
  }
};

/**
 * Executes a Python file
 * @param fileName - The name of the Python file
 * @param fileContent - The content of the Python file
 * @returns Promise resolving to execution result
 */
const executePythonFile = async (fileName: string, fileContent: string): Promise<ExecutionResult> =>
  new Promise(resolve => {
    try {
      // temporary directory for the file
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'py-execution-'));
      const filePath = path.join(tempDir, fileName);
      // file content to the temporary location
      fs.writeFileSync(filePath, fileContent);
      // Python command based on platform
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      // eslint-disable-next-line no-console
      console.log(`Using Python command: ${pythonCommand}`);
      // spawning py process to execute the file
      const pythonProcess = spawn(pythonCommand, [filePath]);
      let output = '';
      let errorOutput = '';
      // stdout data
      pythonProcess.stdout.on('data', data => {
        output += data.toString();
      });
      // stderr data
      pythonProcess.stderr.on('data', data => {
        errorOutput += data.toString();
      });
      // process completion
      pythonProcess.on('close', code => {
        try {
          fs.unlinkSync(filePath);
          fs.rmdirSync(tempDir);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error cleaning up temporary files:', err);
        }
        resolve({
          success: code === 0,
          output,
          error: errorOutput,
        });
      });
      // process errors
      pythonProcess.on('error', err => {
        resolve({
          success: false,
          output: '',
          error: `Error executing Python: ${err.message}`,
        });
      });
    } catch (error) {
      resolve({
        success: false,
        output: '',
        error: `Error setting up execution environment: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });

/**
 * Executes a Java file
 * @param fileName - The name of the Java file
 * @param fileContent - The content of the Java file
 * @returns Promise resolving to execution result
 */
const executeJavaFile = async (fileName: string, fileContent: string): Promise<ExecutionResult> =>
  new Promise(resolve => {
    try {
      // creating temporary directory
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'java-execution-'));
      const filePath = path.join(tempDir, fileName);
      // writing Java file
      fs.writeFileSync(filePath, fileContent);
      // get class name (assuming public class name matches filename)
      const className = fileName.replace('.java', '');
      // compile the Java file
      // eslint-disable-next-line no-console
      console.log('Compiling Java file...');
      const compileProcess = spawn('javac', [filePath]);
      let compileError = '';
      compileProcess.stderr.on('data', data => {
        compileError += data.toString();
      });
      compileProcess.on('close', compileCode => {
        if (compileCode !== 0) {
          // failed comp
          try {
            fs.unlinkSync(filePath);
            fs.rmdirSync(tempDir);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error cleaning up temporary files:', err);
          }
          resolve({
            success: false,
            output: '',
            error: `Compilation error: ${compileError}`,
          });
          return;
        }
        // If compilation success, run the Java class
        // eslint-disable-next-line no-console
        console.log('Running Java program...');
        const runProcess = spawn('java', ['-cp', tempDir, className]);
        let output = '';
        let runError = '';
        runProcess.stdout.on('data', data => {
          output += data.toString();
        });
        runProcess.stderr.on('data', data => {
          runError += data.toString();
        });
        // temp directory clean up
        runProcess.on('close', runCode => {
          try {
            fs.unlinkSync(filePath);
            fs.unlinkSync(path.join(tempDir, `${className}.class`));
            fs.rmdirSync(tempDir);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error cleaning up temporary files:', err);
          }
          resolve({
            success: runCode === 0,
            output,
            error: runError,
          });
        });
        runProcess.on('error', err => {
          resolve({
            success: false,
            output: '',
            error: `Error executing Java: ${err.message}`,
          });
        });
      });
      compileProcess.on('error', err => {
        resolve({
          success: false,
          output: '',
          error: `Error compiling Java: ${err.message}`,
        });
      });
    } catch (error) {
      resolve({
        success: false,
        output: '',
        error: `Error setting up Java execution environment: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });

/**
 * Executes a project file with the given content and returns the output.
 * @param fileName - The name of the file to execute.
 * @param fileContent - The content of the file to execute.
 * @returns Promise resolving to execution result.
 */
export const executeProjectFile = async (
  fileName: string,
  fileContent: string,
): Promise<ExecutionResult> => {
  // eslint-disable-next-line no-console
  console.log(`Attempting to execute file: ${fileName}`);
  if (fileName.endsWith('.py')) {
    return executePythonFile(fileName, fileContent);
  }
  if (fileName.endsWith('.java')) {
    return executeJavaFile(fileName, fileContent);
  }
  return {
    success: false,
    output: '',
    error: 'Only Python and Java files are supported for execution',
  };
};
