import { Request, Response, NextFunction } from "express";
import * as adminService from "../../services/admin-service";

export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.getPlatformStats();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pageParam = Number(req.query.pageParam ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const role = req.query.role as "client" | "project manager" | "admin" | undefined;
    const result = await adminService.listAllUsers(pageParam, limit, role);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pageParam = Number(req.query.pageParam ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.listAllProjects(pageParam, limit);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminService.deleteUser(
      req.params.userId,
      String(req.user!._id),
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}
