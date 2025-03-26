import mongoose from 'mongoose';
import supertest from 'supertest';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, type Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { app } from '../../app';
// TODO finish imports
import * as projectService from '../../services/project/project.service.spec.ts';
import databaseUtil from '../../utils/database.util';

/**
 * Spies on the service functions 
 */
// TODO


describe.skip('Project Controller', () => {
  describe('POST /projects/createProject', () => {
    it('should create a new project successfully', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if request body is invalid', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if a collaborator in request body has an invalid role', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error for creator retrieval', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error for collaborator retrieval', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error for state creation', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error for project creation', async () => {
      expect(true).toBe(false);
    });
  });

  describe('DELETE /projects/deleteProjectById/:projectId', () => {
    it('should delete a project successfully', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if deleter is not project owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if deleter is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/updateProjectById/:projectId', () => {
    it('should update a project successfully', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 for missing name', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if updater is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if updater is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/getProjectsByUser/:username', () => {
    it('should return all of a user\'s projects', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 if database error while searching username', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId', () => {
    it('should return a project successfully', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/addCollaborator/:username', () => {
    it('should successfully add collaborator to project', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if inviter is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if inviter is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/removeCollaborator/:username', () => {
    it('should successfully remove collaborator from project', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if remover is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if remover is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if username not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/getStates', () => {
    it('should successfully get all saved project states', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/createBackup', () => {
    it('should successfully create a backup state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/restoreStateById/:stateId', () => {
    it('should successfully restore project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('DELETE /projects/:projectId/deleteStateById/:stateId', () => {
    it('should successfully delete a project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/updateStateById/:stateId', () => {
    it('should successfully update project state', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if stateId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/getFiles', () => {
    it('should successfully return all project files', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/createFile', () => {
    it('should successfully create and return a new project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if file name is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('DELETE /projects/:projectId/deleteFileById/:fileId', () => {
    it('should successfully delete a project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('PATCH /projects/:projectId/updateFileById/:fileId', () => {
    it('should successfully update a project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('GET /projects/:projectId/:fileId', () => {
    it('should successfully retrieve project file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/addComment', () => {
    it('should successfully add comment to file', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if commenter is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if comment body is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if line number is not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if commenter is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/deleteCommentsByLine/:lineNumber', () => {
    it('should successfully delete and return all comments from file on line', async () => {
      expect(true).toBe(false);
    });

    it('should return 400 if no comments on specified line', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if lineNumber not provided', async () => {
      expect(true).toBe(false);
    });
  });

  describe('POST /projects/:projectId/:fileId/deleteCommentById/:commentId', () => {
    it('should succesfully delete and return comment from file', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not owner or editor', async () => {
      expect(true).toBe(false);
    });

    it('should return 403 if user is not a project collaborator', async () => {
      expect(true).toBe(false);
    });

    it('should return 500 on service error', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if projectId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if fileId not provided', async () => {
      expect(true).toBe(false);
    });

    it('should return 404 if commentId not provided', async () => {
      expect(true).toBe(false);
    });
  });
});
