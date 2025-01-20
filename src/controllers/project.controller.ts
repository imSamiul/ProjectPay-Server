import { Request, Response } from 'express';

import { generateUUID } from '../utils/uuidGenerator';
import Fuse from 'fuse.js';

import ProjectManager from '../models/manager.model';
import Payment from '../models/payment.model';
import { User } from '../types/user.type';

import { Project } from '../types/project.type';
import ProjectModel from '../models/project.model';
import ClientModel from '../models/client.model';
import ProjectManagerModel from '../models/manager.model';

// Helper function to extract allowed updates
const extractAllowedUpdates = (body: Partial<Project>) => {
  const allowedUpdates: (keyof Project)[] = [
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
  }, {} as Partial<Project>);
};

// GET: search project for manager
export async function searchProject(req: Request, res: Response) {
  const searchQuery = req.query.q;

  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const projectManagerId = (req.user as User)?._id;
    const projects = await ProjectModel.find({
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
  }
}
// GET: search project for client
// TODO: will delete this if necessary
export async function searchProjectForClient(req: Request, res: Response) {
  const projectCode = req.query.projectCode;

  if (!projectCode || typeof projectCode !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const project = await ProjectModel.find(
      {
        projectCode: projectCode,
      },
      { projectCode: 1, name: 1, _id: 0 }
    );

    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      message: errorMessage,
    });
  }
}

// GET: get the project details
export async function getProjectDetails(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const project = await ProjectModel.findOne({ projectCode })
      .populate({
        path: 'projectManager',
        select: '-managerProjects -clientList',
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
      existingProjectCode = await ProjectModel.findOne({ projectCode });
    } while (existingProjectCode);

    const existingProject = await ProjectModel.findOne({
      name: projectData.name,
      projectCode: projectCode,
    });

    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }
    const newProject = new ProjectModel({
      projectCode,
      ...projectData,
      startDate,
      status,
      projectManager: (req.user as User)?._id,
    });

    const savedProject = await newProject.save();

    if (savedProject) {
      await ProjectManager.findOneAndUpdate(
        {
          _id: (req.user as User)?._id,
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
  }
}

// PATCH: Update project complete status
export async function updateProjectStatus(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const { status } = req.body;

    const updatedProject = await ProjectModel.findOneAndUpdate(
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
    const project = await ProjectModel.findOne({ projectCode });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
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
  }
}

//PATCH: handle send request to manager from client to access the project
export async function handleClientRequest(req: Request, res: Response) {
  try {
    const projectCode = req.params.projectCode;
    const findClient = await ClientModel.findOne({ userId: req.user?._id });
    if (!findClient) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // check if the client has already requested the project
    const project = await ProjectModel.findOne({
      projectCode,
      requestedClientList: { $in: [findClient._id] },
    });
    if (project) {
      return res.status(400).json({ message: 'Client already requested' });
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      { projectCode },
      {
        hasClientRequest: true,
        $push: { requestedClientList: findClient._id },
      },
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
  }
}
// PATCH: handle accept client request to access the project for manager
export async function acceptClientRequest(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId;

    const findManager = await ProjectManagerModel.findOne({
      userId: req.user?._id,
    });
    if (!findManager) {
      return res.status(404).json({ message: 'Project Manager not found' });
    }
    if (!req.body.clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }
    // check if the client does not exist in the requestedClientList
    const project = await ProjectModel.findOne({
      _id: projectId,
      requestedClientList: { $in: [req.body.clientId] },
      projectManager: findManager._id,
    });
    if (!project) {
      return res.status(400).json({ message: 'Client request not found' });
    }
    const findClient = await ClientModel.findOne({ _id: req.body.clientId });
    if (!findClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updatedProject = await ProjectModel.findOneAndUpdate(
      {
        _id: projectId,
        requestedClientList: { $in: [req.body.clientId] },
        projectManager: findManager._id,
      },
      {
        hasClientRequest: false,
        $push: { approvedClientList: req.body.clientId },
        $pull: { requestedClientList: req.body.clientId },
      },
      {
        new: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    // update client's clientProjects array
    const updatedClient = await ClientModel.findOneAndUpdate(
      { _id: req.body.clientId },
      {
        $push: { clientProjects: updatedProject._id },
      },
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({ updatedProject, updatedClient });
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

// DELETE: delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const projectId = req.params.projectId;
    const project = await ProjectModel.findOneAndDelete({
      _id: projectId,
      projectManager: req.user?._id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get payment IDs from the deleted project's paymentList field
    const paymentIds = project.paymentList;

    // Delete all payments related to the project using the IDs in paymentList
    await Payment.deleteMany({ _id: { $in: paymentIds } });
    await ProjectManagerModel.findOneAndUpdate(
      { _id: project.projectManager },
      { $pull: { managerProjects: project._id } }
    );

    res.status(200).json(project);
  } catch (error) {
    let errorMessage = 'Failed to delete project';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      message: errorMessage,
    });
  }
}
