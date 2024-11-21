import { Brackets, Repository, UpdateResult } from "typeorm";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const error = createHttpError(400, "Email is already exists!");
      throw error;
    }
    const saltRounds = 10;
    const hashedPasswod = await bcrypt.hash(password, saltRounds);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPasswod,
        role,
        tenant: tenantId ? { id: tenantId } : null,
      });
    } catch (error) {
      const err = createHttpError(
        500,
        "Faled to create user & store in database",
      );
      throw err;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "email", "password", "firstName", "lastName", "role"],
      relations: {
        tenant: true,
      },
    });
  }

  async update(
    userId: number,
    { firstName, lastName, role, email, tenantId }: LimitedUserData,
  ) {
    try {
      return await this.userRepository.update(userId, {
        email,
        firstName,
        lastName,
        role,
        tenant: tenantId ? { id: tenantId } : null,
      } as Partial<User>);
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        tenant: true,
      },
    });
  }

  async getAll(validateQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validateQuery.q) {
      const searchTerm = `%${validateQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) Ilike :q", {
            q: searchTerm,
          }).orWhere("user.email Ilike :q", { q: searchTerm });
        }),
      );
    }

    if (validateQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validateQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();

    return result;
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
