import Project from "../models/project-model";
import User from "../models/user-model";
import { BadRequestError, NotFoundError } from "../utils/app-error";

type UserRole = "client" | "project manager" | "admin";

export async function getPlatformStats() {
  const [usersByRole, projectTotals] = await Promise.all([
    User.aggregate([{ $group: { _id: "$userType", count: { $sum: 1 } } }]),
    Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalBudget: { $sum: "$budget" },
          totalDue: { $sum: "$due" },
          totalCollected: { $sum: "$totalPaid" },
        },
      },
    ]),
  ]);

  const counts: Record<string, number> = { client: 0, "project manager": 0, admin: 0 };
  for (const row of usersByRole) {
    counts[row._id as string] = row.count;
  }

  const totals = projectTotals[0] ?? {
    totalProjects: 0,
    totalBudget: 0,
    totalDue: 0,
    totalCollected: 0,
  };

  return {
    users: {
      total: counts.client + counts["project manager"] + counts.admin,
      clients: counts.client,
      projectManagers: counts["project manager"],
      admins: counts.admin,
    },
    projects: {
      total: totals.totalProjects,
      totalBudget: totals.totalBudget,
      totalDue: totals.totalDue,
      totalCollected: totals.totalCollected,
    },
  };
}

export async function listAllUsers(pageParam: number, limit: number, role?: UserRole) {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);
  const filter = role ? { userType: role } : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phone userType createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * cappedLimit)
      .limit(cappedLimit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      createdAt: user.createdAt,
    })),
    pagination: {
      page,
      limit: cappedLimit,
      total,
      totalPages: Math.ceil(total / cappedLimit) || 0,
    },
  };
}

export async function listAllProjects(pageParam: number, limit: number) {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);

  const [projects, total] = await Promise.all([
    Project.find()
      .select("projectCode name budget due totalPaid status clientName projectManager createdAt")
      .populate("projectManager", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * cappedLimit)
      .limit(cappedLimit)
      .lean(),
    Project.countDocuments(),
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

export async function deleteUser(targetUserId: string, requestingUserId: string) {
  if (targetUserId === requestingUserId) {
    throw new BadRequestError("You cannot delete your own account");
  }

  const target = await User.findById(targetUserId);
  if (!target) {
    throw new NotFoundError("User");
  }

  if (target.userType === "admin") {
    throw new BadRequestError("Admin accounts cannot be deleted from this panel");
  }

  await User.findByIdAndDelete(targetUserId);
  return { id: targetUserId };
}
