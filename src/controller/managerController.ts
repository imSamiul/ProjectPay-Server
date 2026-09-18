import { Request, Response } from 'express';
import Project from '../model/projectModel';

// GET:
// get all projects for manager
export async function getManagerProjects(req: Request, res: Response) {
  const { pageParam = 1, limit = 10 } = req.query;
  const pageNumber = Number(pageParam);
  const limitNumber = Number(limit);
  try {
    const projects = await Project.find({ projectManager: req.user?._id })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);
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
