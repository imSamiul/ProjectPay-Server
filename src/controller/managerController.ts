import { Request, Response } from 'express';
import Project from '../model/projectModel';

// GET:
// get all projects for manager
export async function getManagerProjects(req: Request, res: Response) {
  try {
    const projects = await Project.find({ projectManager: req.user?._id });
    res.status(200).send({ projects });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).send({ message: errorMessage });
  }
}
// POST:

// PATCH:

// DELETE:
