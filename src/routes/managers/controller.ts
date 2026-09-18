import { Request, Response, NextFunction } from "express";
import * as projectsService from "../../services/projects-service";
import * as usersService from "../../services/users-service";

export async function getManagerProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pageParam = Number(req.query.pageParam ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await projectsService.listManagerProjects(
      String(req.user!._id),
      pageParam,
      limit,
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function getManagerStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await projectsService.getManagerStats(String(req.user!._id));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function createClient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const client = await usersService.createManagerClient(
      String(req.user!._id),
      req.body,
    );
    res.status(201).send({ client });
  } catch (error) {
    next(error);
  }
}

export async function listClients(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await usersService.listManagerClients(
      String(req.user!._id),
      Number(req.query.pageParam ?? 1),
      Number(req.query.limit ?? 10),
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}
