import { Request, Response } from 'express';
import Project from '../model/projectModel';
import ProjectManager from '../model/managerModel';
import { generateUUID } from '../utils/uuidGenerator';
//GET:
// search for specific project for manager
export async function searchProject(req: Request, res: Response) {
  const searchQuery = req.query.q;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Split search query into words and create regex for each
    const searchTerms = searchQuery.trim().split(/\s+/);
    const regexArray = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: new RegExp(term, 'i') } }, // Partial match in 'name'
        { client: { $regex: new RegExp(term, 'i') } }, // Partial match in 'client'
      ], // 'i' makes it case-insensitive
    }));

    console.log(searchTerms);
    console.log(regexArray);
    const projectManagerId = req.user?._id;

    // Use $and to ensure all search terms are matched
    const projects = await Project.find({
      projectManager: projectManagerId,
      $and: regexArray,
    });

    res.json(projects);
  } catch (error) {
    let errorMessage = 'Failed to search projects';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}

//POST:
// create a new project
export async function createNewProject(req: Request, res: Response) {
  try {
    const {
      name,
      budget,
      advance,

      client,
      clientPhone,
      clientEmail,
      clientAddress,
      clientDetails,

      startDate,
      endDate,
      demoLink,
      typeOfWeb,
      description,
      status,
    } = req.body;

    let projectId;
    let existingProjectId;

    do {
      projectId = generateUUID(); // Generate new UUID
      existingProjectId = await Project.findOne({ projectId });
    } while (existingProjectId);

    const newProject = new Project({
      projectId,
      name,
      budget,
      advance,
      due: budget - advance,
      client,
      clientPhone,
      clientEmail,
      clientAddress,
      clientDetails,
      startDate,
      endDate,
      demoLink,
      typeOfWeb,
      description,
      status,
      projectManager: req.user?._id,
    });
    const existingProject = await Project.findOne({ name });

    if (existingProject) {
      return res.status(400).send('Project already exists');
    }

    const savedProject = await newProject.save();
    if (savedProject) {
      await ProjectManager.updateOne(
        { _id: req.user?._id },
        { $push: { myProjects: savedProject._id } }
      );
    }
    res.status(201).send(savedProject);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).send({ message: errorMessage });
  }
}
