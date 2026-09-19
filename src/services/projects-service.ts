import mongoose from "mongoose";
import Project from "../models/project-model";
import ProjectManager from "../models/manager-model";
import Payment from "../models/payment-model";
import Client from "../models/client-model";
import { ProjectType } from "../types/project-document-type";
import { generateUUID, escapeRegex } from "../utils/uuid-generator";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/app-error";

const ALLOWED_UPDATES: (keyof ProjectType)[] = [
  "name",
  "budget",
  "advance",
  "endDate",
  "demoLink",
  "typeOfWeb",
  "description",
];

function extractAllowedUpdates(body: Partial<ProjectType>) {
  return ALLOWED_UPDATES.reduce((acc, key) => {
    if (key in body) {
      acc[key] = body[key];
    }
    return acc;
  }, {} as Partial<ProjectType>);
}

function assertOwnership(
  projectManagerId: unknown,
  userId: string,
): void {
  if (String(projectManagerId) !== String(userId)) {
    throw new ForbiddenError("You do not own this project");
  }
}

export async function searchProjects(
  managerId: string,
  query: string,
  pageParam: number,
  limit: number,
) {
  const safe = escapeRegex(query.trim());
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);
  const filter = {
    projectManager: managerId,
    $or: [
      { name: { $regex: safe, $options: "i" } },
      { projectCode: { $regex: safe, $options: "i" } },
    ],
  };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate({ path: "clients", select: "name email phone clientKey" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * cappedLimit)
      .limit(cappedLimit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit: cappedLimit,
      total,
      totalPages: Math.ceil(total / cappedLimit) || 0,
    },
  };
}

export async function getProjectDetails(
  projectCode: string,
  userId: string,
  userType: "project manager" | "client",
) {
  const filter: Record<string, unknown> = { projectCode };
  if (userType === "client") {
    filter.clients = userId;
  } else {
    filter.projectManager = userId;
  }

  const project = await Project.findOne(filter)
    .populate({
      path: "projectManager",
      select: "name email phone",
    })
    .populate({
      path: "clients",
      select: "name email phone clientKey",
    })
    .populate({
      path: "paymentList",
      options: { sort: { paymentDate: -1 } },
    })
    .lean();

  if (!project) {
    throw new NotFoundError("Project");
  }

  return project;
}

export async function linkClientToProject(
  projectCode: string,
  managerId: string,
  clientKey: string,
) {
  const project = await Project.findOne({ projectCode });
  if (!project) {
    throw new NotFoundError("Project");
  }
  assertOwnership(project.projectManager, managerId);

  const client = await Client.findOne({ clientKey });
  if (!client) {
    throw new NotFoundError("Client");
  }

  const alreadyLinked = project.clients.some(
    (id) => String(id) === String(client._id),
  );
  if (alreadyLinked) {
    throw new ConflictError("Client is already linked to this project");
  }

  project.clients.push(client._id as mongoose.Types.ObjectId);
  await project.save();

  await Client.findByIdAndUpdate(client._id, {
    $addToSet: { projects: project._id },
  });

  return getProjectDetails(projectCode, managerId, "project manager");
}

export async function unlinkClientFromProject(
  projectCode: string,
  managerId: string,
  clientId: string,
) {
  const project = await Project.findOne({ projectCode });
  if (!project) {
    throw new NotFoundError("Project");
  }
  assertOwnership(project.projectManager, managerId);

  project.clients = project.clients.filter(
    (id) => String(id) !== String(clientId),
  ) as mongoose.Types.ObjectId[];
  await project.save();

  await Client.findByIdAndUpdate(clientId, {
    $pull: { projects: project._id },
  });

  return getProjectDetails(projectCode, managerId, "project manager");
}

export async function listMyProjects(clientId: string) {
  const projects = await Project.find({ clients: clientId })
    .select(
      "projectCode name budget advance due totalPaid startDate endDate status clients createdAt",
    )
    .populate({ path: "clients", select: "name email phone clientKey" })
    .sort({ createdAt: -1 })
    .lean();

  return projects;
}

export async function listManagerClients(
  managerId: string,
  pageParam: number,
  limit: number,
) {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);

  const projects = await Project.find({ projectManager: managerId })
    .select("projectCode name status budget due clients")
    .lean();

  type ClientProjectRow = {
    clientId: string;
    projectId: string;
    projectCode: string;
    projectName: string;
    budget: number;
    due: number;
    status: boolean;
  };

  const rows: ClientProjectRow[] = [];
  for (const project of projects) {
    for (const clientId of project.clients ?? []) {
      rows.push({
        clientId: String(clientId),
        projectId: String(project._id),
        projectCode: project.projectCode,
        projectName: project.name,
        budget: project.budget,
        due: project.due,
        status: project.status,
      });
    }
  }

  const clientIds = Array.from(new Set(rows.map((row) => row.clientId)));

  const clientDocs = await Client.find({ _id: { $in: clientIds } })
    .select("name email phone clientKey")
    .lean();
  const clientById = new Map(
    clientDocs.map((client) => [String(client._id), client]),
  );

  const enrichedRows = rows
    .map((row) => {
      const client = clientById.get(row.clientId);
      return {
        ...row,
        clientName: client?.name,
        clientEmail: client?.email,
        clientPhone: client?.phone,
        clientKey: client?.clientKey,
      };
    })
    .sort((a, b) => (a.clientName ?? "").localeCompare(b.clientName ?? ""));

  const total = enrichedRows.length;
  const pageRows = enrichedRows.slice(
    (page - 1) * cappedLimit,
    page * cappedLimit,
  );

  return {
    clients: pageRows,
    pagination: {
      page,
      limit: cappedLimit,
      total,
      totalPages: Math.ceil(total / cappedLimit) || 0,
    },
  };
}

export async function createProject(
  managerId: string,
  body: Record<string, unknown>,
) {
  const projectData = extractAllowedUpdates(body as Partial<ProjectType>);
  const { startDate, status } = body as {
    startDate?: string;
    status?: boolean;
  };

  const existingProject = await Project.findOne({ name: projectData.name });
  if (existingProject) {
    throw new ConflictError("Project already exists");
  }

  let projectCode = generateUUID();
  let attempts = 0;
  while (await Project.exists({ projectCode })) {
    projectCode = generateUUID();
    attempts += 1;
    if (attempts > 10) {
      throw new BadRequestError("Failed to generate unique project code");
    }
  }

  const newProject = new Project({
    projectCode,
    ...projectData,
    startDate,
    status: status ?? false,
    projectManager: managerId,
  });

  const savedProject = await newProject.save();

  await ProjectManager.findByIdAndUpdate(managerId, {
    $push: { managerProjects: savedProject._id },
  });

  return savedProject;
}

export async function updateProjectStatus(
  projectCode: string,
  managerId: string,
  status: boolean,
) {
  const project = await Project.findOne({ projectCode });
  if (!project) {
    throw new NotFoundError("Project");
  }
  assertOwnership(project.projectManager, managerId);

  project.status = status;
  await project.save();
  return project;
}

export async function updateProjectDetails(
  projectCode: string,
  managerId: string,
  body: Partial<ProjectType>,
) {
  const updates = extractAllowedUpdates(body);
  if (Object.keys(updates).length === 0) {
    throw new BadRequestError("Invalid updates!");
  }

  const project = await Project.findOne({ projectCode });
  if (!project) {
    throw new NotFoundError("Project");
  }
  assertOwnership(project.projectManager, managerId);

  const budget = updates.budget ?? project.budget;
  const advance = updates.advance ?? project.advance;

  const updatedProject = await Project.findOneAndUpdate(
    { projectCode, projectManager: managerId },
    {
      ...updates,
      due: budget - advance - project.totalPaid,
    },
    { new: true, runValidators: true },
  );

  return updatedProject;
}

export async function deleteProject(projectId: string, managerId: string) {
  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new NotFoundError("Project");
  }
  assertOwnership(project.projectManager, managerId);

  await Project.deleteOne({ _id: projectId });
  await Payment.deleteMany({ projectId: project._id });
  await ProjectManager.findByIdAndUpdate(managerId, {
    $pull: { managerProjects: project._id },
  });

  return project;
}

export async function listManagerProjects(
  managerId: string,
  pageParam: number,
  limit: number,
) {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);
  const filter = { projectManager: managerId };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate({ path: "clients", select: "name email phone clientKey" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * cappedLimit)
      .limit(cappedLimit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit: cappedLimit,
      total,
      totalPages: Math.ceil(total / cappedLimit) || 0,
    },
  };
}

export async function getManagerStats(managerId: string) {
  const today = new Date().toISOString().split("T")[0];
  const managerObjectId = new mongoose.Types.ObjectId(managerId);

  const [projectTotals, clientCountResult] = await Promise.all([
    Project.aggregate([
      { $match: { projectManager: managerObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", true] },
                    {
                      $not: {
                        $and: [
                          { $gt: ["$due", 0] },
                          { $lt: ["$endDate", today] },
                        ],
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", true] },
                    { $gt: ["$due", 0] },
                    { $lt: ["$endDate", today] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalBudget: { $sum: "$budget" },
          totalDue: { $sum: "$due" },
          totalCollected: { $sum: "$totalPaid" },
        },
      },
    ]),
    Project.aggregate([
      { $match: { projectManager: managerObjectId } },
      { $unwind: "$clients" },
      { $group: { _id: "$clients" } },
      { $count: "total" },
    ]),
  ]);

  const totals = projectTotals[0] ?? {
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    totalBudget: 0,
    totalDue: 0,
    totalCollected: 0,
  };

  return {
    projects: {
      total: totals.total,
      active: totals.active,
      completed: totals.completed,
      overdue: totals.overdue,
      totalBudget: totals.totalBudget,
      totalDue: totals.totalDue,
      totalCollected: totals.totalCollected,
    },
    clients: {
      total: clientCountResult[0]?.total ?? 0,
    },
  };
}
