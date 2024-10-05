import { Request, Response } from 'express';
import Project from '../model/projectModel';
// create a new project
export async function createNewProject(req: Request, res: Response) {
  try {
    const {
      name,
      budget,
      advance,
      due,
      client,
      clientPhone,
      clientEmail,
      startDate,
      endDate,
      description,
      status,
    } = req.body;

    const newProject = new Project({
      name,
      budget,
      advance,
      due,
      client,
      clientPhone,
      clientEmail,
      startDate,
      endDate,
      description,
      status,
    });
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(400).send('Project already exists');
    }
    const savedProject = await newProject.save();
    res.status(201).send(savedProject);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}
