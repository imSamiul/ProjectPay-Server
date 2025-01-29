import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ClientModel from '../models/client.model';
import ProjectManagerModel from '../models/manager.model';
import ProjectModel from '../models/project.model';
import { InvitationChecks } from '../types/project.type';

// GET: Search for a client
export const searchClient = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const clients = await ClientModel.find({
      email: { $regex: new RegExp(email as string, 'i') },
    });
    res.status(200).json(clients);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
};
// GET: Get all invitations project for a client
export const getClientInvitations = async (req: Request, res: Response) => {
  try {
    const client = await ClientModel.findOne({
      _id: req.user?._id,
    }).populate('projectInvitations');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client.projectInvitations);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
};
//PATCH: handle send invitation to a client to join a project

export async function sendInvitationToClient(req: Request, res: Response) {
  try {
    const email = req.query.email as string;
    const projectId = req.params.projectId;

    // Convert projectId to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Perform all checks in parallel for better performance
    const [project, client] = await Promise.all([
      ProjectModel.findById(projectObjectId),
      ClientModel.findOne({ email }),
    ]);

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
      return res.status(404).json({ message: 'Project not found' });
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
        { email },
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

// PATCH: accept project invitation to access the project
export async function acceptProjectInvitation(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const clientId = req.user?._id;

    const [client, project, manager] = await Promise.all([
      // Update client
      ClientModel.findOneAndUpdate(
        { _id: clientId },
        {
          $pull: { projectInvitations: projectId },
          $push: { clientProjects: projectId },
          $set: { hasProjectInvitation: false },
        },
        { new: true }
      ),
      // Update project
      ProjectModel.findOneAndUpdate(
        { _id: projectId },
        {
          $push: { approvedClientList: clientId },
          $pull: { requestedClientList: clientId },
        },
        { new: true }
      ),
      // Update manager
      ProjectModel.findOne({ _id: projectId }).then((project) =>
        ProjectManagerModel.findOneAndUpdate(
          { _id: project?.projectManager },
          { $push: { clientList: clientId } },
          { new: true }
        )
      ),
    ]);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ client, project, manager });
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
