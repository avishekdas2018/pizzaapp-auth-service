import express, { NextFunction, Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import logger from "../config/logger";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { Roles } from "../constants";
import { canAccess } from "../middlewares/canAccess";
import { CreateTenantRequest } from "../types";
import tenantValidator from "../validators/tenant-validator";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.create(req, res, next),
);

router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
);

router.get("/", (req: Request, res: Response, next: NextFunction) =>
  tenantController.getAll(req, res, next),
);

router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
  tenantController.getOne(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.delete(req, res, next),
);

export default router;
