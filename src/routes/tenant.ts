import express from "express";
import authenticate from "../middlewares/authenticate";
import logger from "../config/logger";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import { Roles } from "../constants";
import { canAccess } from "../middlewares/canAccess";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.create(req, res, next),
);

export default router;
