import bcrypt from "bcrypt";

export class CredentialService {
  async comparePassword(userPassword: string, passwordHash: string) {
    return bcrypt.compare(userPassword, passwordHash);
  }
}
