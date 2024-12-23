import request from "supertest";
import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should persist user in the database", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "password",
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("should create manager user", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "password",
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it("should return 403 if non admin user tries to create a user", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const nonAdminToken = jwks.token({
        sub: "1",
        role: Roles.MANAGER,
      });

      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "password",
        tenantId: tenant.id,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${nonAdminToken}`])
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(403);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });
  });
});
