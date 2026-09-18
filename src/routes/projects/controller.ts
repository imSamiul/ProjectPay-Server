import { Request, Response, NextFunction } from "express";
import * as projectsService from "../../services/projects-service";

export async function searchProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await projectsService.searchProjects(
      String(req.user!._id),
      String(req.query.q),
      Number(req.query.pageParam ?? 1),
      Number(req.query.limit ?? 20),
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProjectDetails(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await projectsService.getProjectDetails(
      req.params.projectCode,
      String(req.user!._id),
    );
    res.status(200).send(project);
  } catch (error) {
    next(error);
  }
}

export async function createNewProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await projectsService.createProject(
      String(req.user!._id),
      req.body,
    );
    res.status(201).send(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProjectStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await projectsService.updateProjectStatus(
      req.params.projectCode,
      String(req.user!._id),
      req.body.status,
    );
    res.status(200).send(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProjectDetails(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await projectsService.updateProjectDetails(
      req.params.projectCode,
      String(req.user!._id),
      req.body,
    );
    res.status(200).send(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await projectsService.deleteProject(
      req.params.projectId,
      String(req.user!._id),
    );
    res.status(200).send(project);
  } catch (error) {
    next(error);
  }
}
