import { Request, Response } from 'express';

import Fuse from 'fuse.js';
import { generateUUID } from '../utils/uuidGenerator';

import ProjectManager from '../models/manager.model';
import Payment from '../models/payment.model';
import { User } from '../types/user.type';

import ProjectModel from '../models/project.model';
import { InvitationChecks, Project } from '../types/project.type';

import mongoose from 'mongoose';
import ClientModel from '../models/client.model';
import ProjectManagerModel from '../models/manager.model';

// Helper function to extract allowed updates
const extractAllowedUpdates = (body: Partial<Project>) => {
  const allowedUpdates: (keyof Project)[] = [
    'name',
    'budget',
    'advance',

    'clientPhone',
    'clientEmail',

    'endDate',

    'description',
  ];
  return allowedUpdates.reduce((acc, key) => {
    if (key in body) {
      acc[key] = body[key];
    }
    return acc;
  }, {} as Partial<Project>);
};

// GET: search project for manager
export async function searchProject(req: Request, res: Response) {
  const searchQuery = req.query.q;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const projectManagerId = (req.user as User)?._id;
    const projects = await ProjectModel.find({
      projectManager: projectManagerId,
    });
    const options = {
      includeScore: true,
      keys: ['name', 'projectCode'],
      threshold: 0.3,
    };

    const fuse = new Fuse(projects, options);
    const result = fuse.search(searchQuery);

    const matchedProjects = result.map((res) => res.item);

    res.status(200).json(matchedProjects);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      message: errorMessage,
    });
  }
}

// GET: get the project details
export async function getProjectDetails(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const project = await ProjectModel.findOne({ projectCode })
      .populate({
        path: 'projectManager',
        select: '-managerProjects -clientList -role -createdAt -updatedAt -__v',
      })
      .populate('paymentList')
      .populate({
        path: 'approvedClientList',
        select:
          '-role -clientProjects -hasProjectInvitation -projectInvitations -createdAt -updatedAt -__v',
      })
      .populate({
        path: 'requestedClientList',
        select:
          '-role -clientProjects -hasProjectInvitation -projectInvitations -createdAt -updatedAt -__v',
      });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to fetch project details';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}

// POST: create a new project
export async function createNewProject(req: Request, res: Response) {
  try {
    const projectData = extractAllowedUpdates(req.body);
    const { startDate, status } = req.body;

    let projectCode;
    let existingProjectCode;

    do {
      projectCode = generateUUID();
      existingProjectCode = await ProjectModel.findOne({ projectCode });
    } while (existingProjectCode);

    const existingProject = await ProjectModel.findOne({
      name: projectData.name,
      projectCode: projectCode,
    });

    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }
    const newProject = new ProjectModel({
      projectCode,
      ...projectData,
      startDate,
      status,
      projectManager: (req.user as User)?._id,
    });

    const savedProject = await newProject.save();

    if (savedProject) {
      await ProjectManager.findOneAndUpdate(
        {
          _id: (req.user as User)?._id,
        },
        {
          $push: { managerProjects: savedProject._id },
        }
      );
    }

    res.status(201).json(savedProject);
  } catch (error) {
    let errorMessage = 'Failed to create project';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}

// PATCH: Update project complete status
export async function updateProjectStatus(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const { status } = req.body;

    const updatedProject = await ProjectModel.findOneAndUpdate(
      { projectCode },
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    let errorMessage = 'Failed to update project status';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}

// PATCH: update project details
export async function updateProjectDetails(req: Request, res: Response) {
  const projectCode = req.params.projectCode;
  const updates = extractAllowedUpdates(req.body);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    const project = await ProjectModel.findOne({ projectCode });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      { projectCode },
      {
        ...updates,
        due: updates.budget
          ? updates.budget - (updates.advance ?? 0) - project.totalPaid
          : project.due,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    let errorMessage = 'Failed to update project details';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}
//PATCH: handle send invitation to a client to join a project

export async function sendInvitationToClient(req: Request, res: Response) {
  try {
    const { clientId } = req.body;
    const projectId = req.params.projectId;
    const managerId = req.user?._id; // Get the current manager's ID

    const [project, client] = await Promise.all([
      ProjectModel.findOne({
        _id: projectId,
        projectManager: managerId, // Add this check to verify project ownership
      }),
      ClientModel.findOne({ clientId }),
    ]);

    // Convert projectId to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Initial validation
    const checks: InvitationChecks = {
      project: Boolean(project),
      client: Boolean(client),
      hasAccess: false,
      hasPendingInvitation: false,
      isRequested: false,
    };

    // If either project or client is not found, return early
    if (!checks.project) {
      return res.status(403).json({
        message: 'Unauthorized: You are not the manager of this project',
      });
    }
    if (!checks.client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Perform remaining checks
    checks.hasAccess = client!.clientProjects.some((id) =>
      id.equals(projectObjectId)
    );
    checks.hasPendingInvitation = client!.projectInvitations.some((id) =>
      id.equals(projectObjectId)
    );
    checks.isRequested = project!.requestedClientList.some((id) =>
      id.equals(client!._id)
    );

    // Validate checks
    if (checks.hasAccess) {
      return res.status(400).json({
        message: 'Client already has access to the project',
      });
    }
    if (checks.hasPendingInvitation) {
      return res.status(400).json({
        message: 'Client already has a pending invitation',
      });
    }

    // Update client and project in parallel
    const [updatedClient, updatedProject] = await Promise.all([
      ClientModel.findOneAndUpdate(
        { email: client!.email },
        {
          hasProjectInvitation: true,
          $push: { projectInvitations: projectObjectId },
        },
        { new: true }
      ),
      ProjectModel.findByIdAndUpdate(
        projectObjectId,
        {
          $push: { requestedClientList: client!._id },
        },
        { new: true }
      ),
    ]);

    return res.status(200).json({
      message: 'Invitation sent successfully',
      client: updatedClient,
      project: updatedProject,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send invitation';
    return res.status(500).json({ message: errorMessage });
  }
}

// PATCH: cancel invitation to client
export async function cancelInvitationToClient(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId;
    const { clientId } = req.body;
    const managerId = req.user?._id;

    if (!projectId || !clientId) {
      return res.status(400).json({
        message: 'Project ID and Client ID are required',
      });
    }

    // Find project and client
    const [project, client] = await Promise.all([
      ProjectModel.findOne({ _id: projectId, projectManager: managerId }),
      ClientModel.findOne({ clientId }),
    ]);

    if (!project || !client) {
      return res.status(404).json({
        message: 'Project or Client not found',
      });
    }

    const projectObjectId = project._id;

    // Check if client has pending invitation
    const checks = {
      hasPendingInvitation: false,
      isRequested: false,
    };

    checks.hasPendingInvitation = client.projectInvitations.some((id) =>
      id.equals(projectObjectId)
    );
    checks.isRequested = project.requestedClientList.some((id) =>
      id.equals(client._id)
    );

    if (!checks.hasPendingInvitation || !checks.isRequested) {
      return res.status(400).json({
        message: 'No pending invitation found for this client',
      });
    }

    // Remove invitation from both client and project
    const [updatedClient, updatedProject] = await Promise.all([
      ClientModel.findOneAndUpdate(
        { email: client.email },
        {
          $pull: { projectInvitations: projectObjectId },
          hasProjectInvitation: client.projectInvitations.length <= 1,
        },
        { new: true }
      ),
      ProjectModel.findByIdAndUpdate(
        projectObjectId,
        {
          $pull: { requestedClientList: client._id },
        },
        { new: true }
      ),
    ]);

    return res.status(200).json({
      message: 'Invitation cancelled successfully',
      client: updatedClient,
      project: updatedProject,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to cancel invitation';
    return res.status(500).json({ message: errorMessage });
  }
}

// DELETE: delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId;
    const project = await ProjectModel.findOneAndDelete({
      _id: projectId,
      projectManager: req.user?._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get payment IDs from the deleted project's paymentList field
    const paymentIds = project.paymentList;

    // Delete all payments related to the project using the IDs in paymentList
    await Payment.deleteMany({ _id: { $in: paymentIds } });
    await ProjectManagerModel.findOneAndUpdate(
      { _id: project.projectManager },
      { $pull: { managerProjects: project._id } }
    );

    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to delete project';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}
