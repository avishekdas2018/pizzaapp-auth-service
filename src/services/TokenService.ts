import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";

export class TokenService {
  constructor(
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}
  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;

    if (!Config.PRIVATE_KEY) {
      const err = createHttpError(
        500,
        "Something went wrong while reading private key",
      );
      throw err;
    }

    try {
      privateKey = Config.PRIVATE_KEY;
    } catch (error) {
      const err = createHttpError(
        500,
        "Something went wrong while reading private key",
      );
      throw err;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    // Persist refresh token
    const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;

    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_A_YEAR),
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
