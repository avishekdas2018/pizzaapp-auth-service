import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
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
        role: Roles.CUSTOMER,
      });
    } catch (error) {
      const err = createHttpError(
        500,
        "Faled to create user & store in database",
      );
      throw err;
    }
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    return user;
  }
}
