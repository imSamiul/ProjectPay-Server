import { Request, Response } from 'express';
import Project from '../model/projectModel';
import ProjectManager from '../model/managerModel';
import { generateUUID } from '../utils/uuidGenerator';
import Fuse from 'fuse.js';
import { ProjectType } from '../types/projectDocumentType';
import Payment from '../model/paymentModel';

// Helper function to extract allowed updates
const extractAllowedUpdates = (body: Partial<ProjectType>) => {
  const allowedUpdates: (keyof ProjectType)[] = [
    'name',
    'budget',
    'advance',
    'clientName',
    'clientPhone',
    'clientEmail',
    'clientAddress',
    'clientDetails',
    'endDate',
    'demoLink',
    'typeOfWeb',
    'description',
  ];
  return allowedUpdates.reduce((acc, key) => {
    if (key in body) {
      acc[key] = body[key];
    }
    return acc;
  }, {} as Partial<ProjectType>);
};

// GET: search project for manager
export async function searchProject(req: Request, res: Response) {
  const searchQuery = req.query.q;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const projectManagerId = req.user?._id;
    const projects = await Project.find({
      projectManager: projectManagerId,
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
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}

// GET: get the project details
export async function getProjectDetails(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const project = await Project.findOne({ projectCode })
      .populate({
        path: 'projectManager',
        select: '-_id -managerProjects -phone -userType -clientList',
      })
      .populate('paymentList');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to fetch project details';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}

// POST: create a new project
export async function createNewProject(req: Request, res: Response) {
  try {
    const projectData = extractAllowedUpdates(req.body);
    const { startDate, status } = req.body;

    let projectCode;
    let existingProjectCode;

    do {
      projectCode = generateUUID();
      existingProjectCode = await Project.findOne({ projectCode });
    } while (existingProjectCode);

    const newProject = new Project({
      projectCode,
      ...projectData,
      startDate,
      status,
      projectManager: req.user?._id,
    });

    const existingProject = await Project.findOne({ name: projectData.name });

    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }

    const savedProject = await newProject.save();

    if (savedProject) {
      await ProjectManager.findOneAndUpdate(
        {
          _id: req.user?._id,
          userType: 'project manager',
        },
        {
          $push: { managerProjects: savedProject._id },
        }
      );
    }

    res.status(201).json(savedProject);
  } catch (error) {
    let errorMessage = 'Failed to create project';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}

// PATCH: Update project complete status
export async function updateProjectStatus(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const { status } = req.body;

    const updatedProject = await Project.findOneAndUpdate(
      { projectCode },
      { status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    let errorMessage = 'Failed to update project status';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}

// PATCH: update project details
export async function updateProjectDetails(req: Request, res: Response) {
  const projectCode = req.params.projectCode;
  const updates = extractAllowedUpdates(req.body);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    const project = await Project.findOne({ projectCode });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await Project.findOneAndUpdate(
      { projectCode },
      {
        ...updates,
        due: updates.budget
          ? updates.budget - (updates.advance ?? 0) - project.totalPaid
          : project.due,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    let errorMessage = 'Failed to update project details';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}

// DELETE: delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findOneAndDelete({ _id: projectId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get payment IDs from the deleted project's paymentList field
    const paymentIds = project.paymentList;

    // Delete all payments related to the project using the IDs in paymentList
    await Payment.deleteMany({ _id: { $in: paymentIds } });

    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to delete project';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
    console.log(error);
  }
}
