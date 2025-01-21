import { Request, Response } from 'express';
import ClientModel from '../models/client.model';
import ProjectModel from '../models/project.model';
import ProjectManagerModel from '../models/manager.model';

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
    const email = req.query.email;
    const projectId = req.params.projectId;

    const project = await ProjectModel.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const findClient = await ClientModel.findOne({
      email: email,
      projectInvitations: { $nin: [projectId] },
      clientProjects: { $nin: [projectId] },
    });
    if (!findClient) {
      return res.status(404).json({
        message: 'Client not found or client already exist in the invitation',
      });
    }
    const updatedClient = await ClientModel.findOneAndUpdate(
      { email: email },
      {
        hasProjectInvitation: true,
        $push: { projectInvitations: projectId },
      },
      { new: true }
    );

    res.status(200).json(updatedClient);
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
// PATCH: accept project invitation to access the project
export async function acceptProjectInvitation(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    const client = await ClientModel.findOneAndUpdate(
      { _id: req.user?._id },
      {
        $push: { clientProjects: projectId },
        $pull: { projectInvitations: projectId },
        hasProjectInvitation: false,
      },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      {
        $push: { approvedClientList: client._id },
      },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const manager = await ProjectManagerModel.findOneAndUpdate(
      { _id: project.projectManager },
      { $push: { clientList: client._id } },
      {
        new: true,
      }
    );

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
