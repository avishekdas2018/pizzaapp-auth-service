import { NextFunction, Request, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private TokenService: TokenService,
    private credentialService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to registering user", {
      firstName,
      lastName,
      email,
      password: "******",
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });

      this.logger.info(`User has been registered successfully: ${user.id}`, {
        id: user.id,
      });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        // Add tenantId to payload
        tenant: user.tenant ? String(user.tenant.id) : "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = this.TokenService.generateAccessToken(payload);

      // Persist refresh token
      const newRefreshToken = await this.TokenService.persistRefreshToken(user);

      const refreshToken = this.TokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    this.logger.debug("New request to login user", {
      email,
      password: "******",
    });

    // Check if username (email) exists in database
    // Compare password with database
    // If password is correct, generate access token and refresh token
    // Add token to cookie
    // Return response
    try {
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const error = createHttpError(
          400,
          "Invalid email or password dose not exist",
        );
        next(error);
        return;
      }

      const isPasswordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordMatch) {
        const error = createHttpError(400, "Invalid email or password");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        tenant: user.tenant ? String(user.tenant.id) : "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = this.TokenService.generateAccessToken(payload);

      // Persist refresh token
      const newRefreshToken = await this.TokenService.persistRefreshToken(user);

      const refreshToken = this.TokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      this.logger.info(`User has been logged in successfully:`, {
        id: user.id,
      });
      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
        tenant: req.auth.tenant,
        firstName: req.auth.firstName,
        lastName: req.auth.lastName,
        email: req.auth.email,
      };

      const accessToken = this.TokenService.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(
          400,
          "User with token could not be found",
        );
        next(error);
        return;
      }

      // Persist refresh token
      const newRefreshToken = await this.TokenService.persistRefreshToken(user);

      await this.TokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.TokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year         //1000 * 60 * 60 * 24 * 7  (7 days),
        sameSite: "strict",
        secure: true,
      });

      this.logger.info(`User has been logged in successfully:`, {
        id: user.id,
        message: `Welcome back ${user.firstName} ${user.lastName}`,
      });
      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.TokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info(`Refresh token has been deleted successfully`, {
        id: req.auth.id,
      });
      this.logger.info(`User has been logged out successfully:`, {
        id: req.auth.sub,
      });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "User has been logged out successfully" });
    } catch (error) {
      next(error);
      return;
    }
  }
}
