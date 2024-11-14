import { Request, Response } from 'express';
import Project from '../models/project.model';
import { UserType } from '../types/userType';

// GET:
// get all projects for manager
export async function getManagerProjects(req: Request, res: Response) {
  const { pageParam = 1, limit = 10 } = req.query;
  const pageNumber = Number(pageParam);
  const limitNumber = Number(limit);
  try {
    const user = req.user as UserType;
    const projects = await Project.find({ projectManager: user?._id })
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
