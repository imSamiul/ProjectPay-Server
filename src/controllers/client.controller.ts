import { Request, Response } from 'express';
import ClientModel from '../models/client.model';
import ProjectManagerModel from '../models/manager.model';
import ProjectModel from '../models/project.model';

// GET: Search for a client
export const searchClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;

    const client = await ClientModel.find({
      clientId,
    });
    res.status(200).json(client);
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
