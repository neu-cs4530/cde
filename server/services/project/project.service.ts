import { ObjectId } from 'mongodb';
import ProjectModel from '../../models/projects.model';
import ProjectStateModel from '../../models/projectStates.model';
import ProjectFileModel from '../../models/projectFiles.model';
import UserModel from '../../models/users.model';
import {
  Project,
  ProjectResponse,
  CollaboratorRole,
  DatabaseProject,
  SafeDatabaseUser,
  User,
  DatabaseProjectState,
  ProjectFile,
  DatabaseProjectFile,
} from '../../types/types';

/**
 * Saves a new project to the database.
 * @param {Project} project - The project object to be saved, containing project data.
 * @returns {Promise<ProjectResponse>} - Resolves with the saved project object or an error message.
 */
export const saveProject = async (project: Project): Promise<ProjectResponse> => {
  try {
    const state: DatabaseProjectState | null = await ProjectStateModel.create(project.currentState);

    if (!state) {
      throw new Error('Failed to save project state');
    }

    const result: DatabaseProject | null = await ProjectModel.create(project);

    if (!result) {
      throw new Error('Failed to save project');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving project: ${error}` };
  }
};

/**
 * Deletes a project by its ID.
 * @param {string} projectId - The ID of the project object to be deleted.
 * @returns {Promise<ProjectResponse>} - Resolves with the deleted project object or an error message.
 */
export const deleteProjectById = async (projectId: string): Promise<ProjectResponse> => {
  try {
    const project: DatabaseProject | null = await ProjectModel.findById(projectId);

    if (project) {
      // We need to delete all associated states, their files, and their file comments.
      const stateIds = [...project.savedStates, project.currentState];

      const projectStates = await ProjectStateModel.find({ _id: { $in: stateIds } });

      if (project.savedStates !== undefined && project.savedStates.length > 0) {
        const fileIds: ObjectId[] = projectStates.reduce((acc: ObjectId[], s) => {
          acc.push(...s.files);
          return acc;
        }, [] as ObjectId[]);

        // TODO: Eventually, delete comments.

        await ProjectFileModel.deleteMany({ _id: { $in: fileIds } });
      }

      await ProjectStateModel.deleteMany({ _id: { $in: stateIds } });

      const deletedProject: DatabaseProject | null = await ProjectModel.findOneAndDelete({
        _id: projectId,
      });

      if (!deletedProject) {
        throw new Error('Error deleting project');
      }

      return deletedProject;
    }
    throw new Error('Error finding project');
  } catch (error) {
    return { error: `Error occurred when finding project: ${error}` };
  }
};

/**
 * Updates an existing project with the provided fields.
 * @param {string} projectId - The ID of the project to be updated.
 * @param {Partial<DatabaseProject>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<DatabaseProject>,
): Promise<ProjectResponse> => {
  try {
    const pushFields: Record<string, unknown> = {};
    const setFields: Record<string, unknown> = {};

    for (const key in updates) {
      if (['savedStates', 'collaborators'].includes(key)) {
        pushFields[key] = updates[key as keyof Project];
      } else {
        setFields[key] = updates[key as keyof Project];
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
            pushFields[key] = updates[key as keyof Project];
          } else {
            setFields[key] = updates[key as keyof Project];
          }
        }
      }
    }
    if (Object.keys(setFields).length > 0) {
      updateQuery.$set = setFields;
    }

    const updatedProject: DatabaseProject | null = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      updateQuery,
      { new: true },
    );

    if (!updatedProject) {
      throw new Error('Error updating project');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when updating project: ${error}` };
  }
};

/**
 * Adds a collaborator to a project and updates the user accordingly.
 * @param {string} projectId - The ID of the project the collaborator is being added to.
 * @param {string} username - The username of the user to be added as a collaborator.
 * @param {CollaboratorRole} role - The role of the added collaborator: either owner, editor, or viewer.
 * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
 */
export const addProjectCollaborator = async (
  projectId: string,
  username: string,
  role: CollaboratorRole,
): Promise<ProjectResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw new Error('Error finding user');
    }

    const projectUpdates: Partial<DatabaseProject> = {
      collaborators: [
        {
          userId: user._id,
          role,
        },
      ],
    };
    const updatedProject: DatabaseProject | { error: string } = await updateProject(
      projectId,
      projectUpdates,
    );

    if (!updatedProject) {
      throw new Error('Error updating project collaborators');
    }

    const objectId = new ObjectId(projectId);
    const userUpdates: Partial<User> = {
      projects: [objectId],
    };

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $push: userUpdates },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw new Error('Error updating user');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when adding project collaborator: ${error}` };
  }
};

/**
 * Removes a collaborator from a project and updates the user accordingly.
 * @param {string} projectId - The ID of the project the collaborator is being added to.
 * @param {string} username - The username of the user to be added as a collaborator.
 * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
 */
export const removeProjectCollaborator = async (
  projectId: string,
  username: string,
): Promise<ProjectResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw new Error('Error finding user');
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      { $pull: { collaborators: { user: user._id } } },
      { new: true },
    );

    if (!updatedProject) {
      throw Error('Error updating project');
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $pull: { projects: new ObjectId(projectId) } },
      { new: true },
    );

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when removing project collaborator: ${error}` };
  }
};

/**
 * Updates a project collaborator's role by their ID.
 * @param {string} projectId - The ID of the project being updated.
 * @param {string} userId - The ID of the collaborator being updated.
 * @param {CollaboratorRole} role - The new role of the collaborator.
 * @returns {Promise<ProjectResponse>} - Resolves with the updated project object or an error message.
 */
export const updateProjectCollaboratorRole = async (
  projectId: string,
  userId: string,
  role: CollaboratorRole,
): Promise<ProjectResponse> => {
  try {
    const updatedProject = await ProjectModel.findOneAndUpdate(
      { '_id': projectId, 'collaborators.userId': userId },
      { $set: { 'collaborators.$.role': role } },
      { new: true },
    );

    if (!updatedProject) {
      throw new Error('Error updating collaborators');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when updating collaborator role: ${error}` };
  }
};

/**
 * Retrieves a project by its ID.
 * @param {string} projectId - The ID of the project being retrieved.
 * @returns {Promise<ProjectResponse>} - Resolves with the desired project object or an error message.
 */
export const getProjectById = async (projectId: string): Promise<ProjectResponse> => {
  try {
    const project: DatabaseProject | null = await ProjectModel.findOne({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  } catch (error) {
    return { error: `Error occurred when finding project: ${error}` };
  }
};

export const createProjectBackup = async (projectId: string): Promise<ProjectResponse> => {
  try {
    const project: DatabaseProject | null = await ProjectModel.findOne({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    const currentState: DatabaseProjectState | null = await ProjectStateModel.findOne({
      _id: project.currentState,
    });

    if (!currentState) {
      throw new Error('Current project state not found');
    }

    const duplicateFiles = await Promise.all(
      currentState.files.map(async fileId => {
        const result: DatabaseProjectFile | null = await ProjectFileModel.findById(fileId);

        if (!result) {
          throw new Error('Project file not found');
        }

        // TODO: Later, comments.
        const file: ProjectFile = {
          name: result.name,
          fileType: result.fileType,
          contents: result.contents,
          comments: [],
        };

        const duplicate: DatabaseProjectFile | null = await ProjectFileModel.create(file);

        if (!duplicate) {
          throw new Error('Error duplicating project file');
        }

        return duplicate;
      }),
    );

    const duplicateState: DatabaseProjectState | null = await ProjectStateModel.create({
      files: duplicateFiles.map(f => f._id),
    });

    if (!duplicateState) {
      throw new Error('Error duplicating project state');
    }

    const updatedProject: DatabaseProject | null = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: { currentState: duplicateState._id },
        $push: { savedStates: currentState._id },
      },
      { new: true },
    );

    if (!updatedProject) {
      throw new Error('Error updating project');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when creating backup: ${error}` };
  }
};

/**
 * Reverts a project to a previously saved state by state ID.
 * @param {string} projectId - The ID of the project being backed up.
 * @param {string} stateId - The ID of the state to revert to.
 * @returns {Promise<ProjectResponse>} - Resolves with the reverted project object or an error message.
 */
export const revertProjectToState = async (
  projectId: string,
  stateId: string,
): Promise<ProjectResponse> => {
  try {
    const revertedState = await ProjectStateModel.findOne({ _id: stateId });

    if (!revertedState) {
      throw Error('Project state not found');
    }

    const project = await ProjectModel.findOne({ _id: projectId });

    if (!project) {
      throw Error('Project not found');
    }

    const updates: Partial<DatabaseProject> = {
      currentState: revertedState._id,
      savedStates: [project.currentState._id],
    };

    const revertedProject = await updateProject(projectId, updates);

    return revertedProject;
  } catch (error) {
    return { error: `Error occurred when reverting project to saved state: ${error}` };
  }
};
