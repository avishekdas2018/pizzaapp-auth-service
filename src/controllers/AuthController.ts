import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private TokenService: TokenService,
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
      });

      this.logger.info(`User has been registered successfully: ${user.id}`, {
        id: user.id,
      });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.TokenService.generateAccessToken(payload);

      // Persist refresh token
      const newRefreshToken = await this.TokenService.persistRefreshToken(user);
      // const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;
      // const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      // const newRefreshToken = await refreshTokenRepository.save({
      //   user: user,
      //   expiresAt: new Date(Date.now() + MS_IN_A_YEAR),
      // });

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
}
