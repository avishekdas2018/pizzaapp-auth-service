import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import {
  CreateUserRequest,
  LimitedUserData,
  UpdateUserRequest,
  UserQueryParams,
} from "../types";
import { Roles } from "../constants";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password, tenantId, role } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        tenantId,
        role,
      });

      res.status(201).json({
        id: user.id,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, role, email, tenantId } = req.body;
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError.BadRequest("Invalid url param"));
      return;
    }

    this.logger.info(`Updating user with id:`, req.body);

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
        email,
        tenantId,
      } as LimitedUserData);

      this.logger.info(`User updated successfully:`, { id: userId });

      res
        .status(200)
        .json({ id: Number(userId), message: "User updated successfully" });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const validateQuery = matchedData(req, { onlyValidData: true });
    try {
      const [users, count] = await this.userService.getAll(
        validateQuery as UserQueryParams,
      );

      this.logger.info(`All users fetched successfully`);
      res.status(200).json({
        currentPage: validateQuery.currentPage as number,
        perPage: validateQuery.perPage as number,
        total: count,
        data: users,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError.BadRequest("Invalid url param"));
      return;
    }

    try {
      const user = await this.userService.findById(Number(userId));

      if (!user) {
        next(createHttpError.NotFound("User not found"));
        return;
      }

      this.logger.info(`User fetched successfully:`, { id: userId });

      res.status(200).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError.BadRequest("Invalid url param"));
      return;
    }

    try {
      await this.userService.deleteById(Number(userId));

      this.logger.info(`User deleted successfully:`, { id: userId });
      res
        .status(200)
        .json({ id: Number(userId), message: "User deleted successfully" });
    } catch (error) {
      next(error);
      return;
    }
  }
}
