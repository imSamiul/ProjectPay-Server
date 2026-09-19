import { Request, Response, NextFunction } from "express";
import * as usersService from "../../services/users-service";

export async function getUserDetails(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(200).send(usersService.getUserDetails(req.user!));
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await usersService.createUser(req.body);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { identifier, password } = req.body;
    const result = await usersService.loginUser(identifier, password);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

export async function logOutUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const message = await usersService.logoutUser(req.user!, req.token!);
    res.status(200).send(message);
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await usersService.updateUserProfile(
      String(req.user!._id),
      req.body,
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

export async function changeUserPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const message = await usersService.changeUserPassword(
      String(req.user!._id),
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.status(200).send({ message });
  } catch (error) {
    next(error);
  }
}
