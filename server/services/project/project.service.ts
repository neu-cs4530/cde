import { ObjectId } from 'mongodb';
import ProjectModel from '../../models/projects.model';
import ProjectStateModel from '../../models/projectStates.model';
import UserModel from '../../models/users.model';
import {
  Project,
  ProjectResponse,
  CollaboratorRole,
  DatabaseProject,
  SafeDatabaseUser,
  User,
} from '../../types/types';

/**
 * Saves a new project to the database.
 * @param {Project} project - The project object to be saved containing full project data.
 * @returns {Promise<ProjectResponse>} - Resolves with the saved project object or an error message.
 */
export const saveProject = async (project: Project): Promise<ProjectResponse> => {
  try {
    const result: DatabaseProject = await ProjectModel.create(project);

    if (!result) {
      throw Error('Failed to save project');
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
    const deletedProject: DatabaseProject | null = await ProjectModel.findOneAndDelete({
      _id: projectId,
    });

    if (!deletedProject) {
      throw Error('Error deleting project');
    }

    return deletedProject;
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
      throw Error('Error updating project');
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
      throw Error('Error finding user');
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
      throw Error('Error updating project collaborators');
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
      throw Error('Error updating user');
    }

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when adding project collaborator: ${error}` };
  }
};

/**
 * Removes a collaborator to a project and updates the user accordingly.
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
      throw Error('Error finding user');
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      {
        $pull: { collaborators: { user: user._id } },
      },
      { new: true },
    );

    if (!updatedProject) {
      throw Error('Error finding project');
    }

    await UserModel.updateOne({ _id: user._id }, { $pull: { projects: new ObjectId(projectId) } });

    return updatedProject;
  } catch (error) {
    return { error: `Error occurred when removing project collaborator: ${error}` };
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
      throw Error('Project not found');
    }

    return project;
  } catch (error) {
    return { error: `Error occurred when finding project: ${error}` };
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
