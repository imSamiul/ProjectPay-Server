import { Request, Response } from 'express';
import ClientModel from '../models/client.model';
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
// GET: Get the client projects
export async function getClientProjects(req: Request, res: Response) {
  try {
    const clientId = req.user?._id;
    const projects = await ProjectModel.find({
      approvedClientList: clientId,
    })
      .select('projectCode name budget status due totalPaid')
      .populate('projectManager', 'userName email')
      .exec();

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to fetch projects',
    });
  }
}
// GET: get all requested projects
export async function getRequestedProjects(req: Request, res: Response) {
  try {
    const clientId = req.user?._id;
    const projects = await ProjectModel.find({
      requestedClientList: clientId,
    })
      .select('projectCode name budget status due totalPaid')
      .populate('projectManager', 'userName email')
      .exec();
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to fetch projects',
    });
  }
}
