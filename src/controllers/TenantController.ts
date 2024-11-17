import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;

    this.logger.debug(`Creating tenant with name:`, req.body);

    try {
      const tenant = await this.tenantService.create({
        name,
        address,
      });
      this.logger.info(`Tenant created with id: ${tenant.id}`);
      res.status(201).json({
        id: tenant.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      const error = createHttpError(400, "Invalid tenant id");
      next(error);
      return;
    }
    this.logger.debug(`Updating tenant with name:`, req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });
      this.logger.info(`Tenant has been updateded:`, { id: tenantId });
      res.status(201).json({
        id: Number(tenantId),
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAll();

      this.logger.info(`All tenants have been fetched`);
      res.status(200).json(tenants);
    } catch (error) {
      next(error);
      return;
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      const error = createHttpError(400, "Invalid tenant id");
      next(error);
      return;
    }

    try {
      const tenant = await this.tenantService.getById(Number(tenantId));

      if (!tenant) {
        next(createHttpError(404, "Tenant not found"));
        return;
      }

      this.logger.info(`Tenant has been fetched:`, { id: tenantId });
      res.status(200).json(tenant);
    } catch (error) {
      next(error);
      return;
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      const error = createHttpError(400, "Invalid tenant id");
      next(error);
      return;
    }

    try {
      await this.tenantService.deleteById(Number(tenantId));
      this.logger.info(`Tenant has been deleted:`, { id: Number(tenantId) });
      res.status(200).json({
        id: Number(tenantId),
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}
