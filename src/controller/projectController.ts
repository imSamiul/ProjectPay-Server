import { Request, Response } from 'express';
import Project from '../model/projectModel';
import ProjectManager from '../model/managerModel';
import { generateUUID } from '../utils/uuidGenerator';
import Fuse from 'fuse.js';
import User from '../model/userModel';

//GET:
// search for specific project for manager
export async function searchProject(req: Request, res: Response) {
  const searchQuery = req.query.q;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const projectManagerId = req.user?._id;
    const projects = await Project.find({
      projectManager: projectManagerId, // Ensure this is filtering by manager
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
    let errorMessage = 'Failed to fetch projects';
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

    let projectCode;
    let existingProjectCode;

    do {
      projectCode = generateUUID(); // Generate new UUID
      existingProjectCode = await Project.findOne({ projectCode });
    } while (existingProjectCode);

    const newProject = new Project({
      projectCode,
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
      projectManager: req.user?._id,
    });
    const existingProject = await Project.findOne({ name });

    if (existingProject) {
      return res.status(400).send('Project already exists');
    }

    const savedProject = await newProject.save();
    console.log(req.user?._id);

    if (savedProject) {
      const updatedProject = await ProjectManager.findOneAndUpdate(
        {
          _id: req.user?._id,
          userType: 'projectManager', // Ensure you're querying the discriminator for ProjectManager
        },
        {
          $push: { managerProjects: savedProject._id },
        }
        // Return the updated document, and create it if it doesn't exist
      );

      console.log(updatedProject);
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
