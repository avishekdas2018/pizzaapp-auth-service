import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";

describe("POST /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201", async () => {
      const tenantData = {
        name: "Joy Kali Pizza",
        address: "123, Main Street, Konnagar",
      };

      const response = await request(app).post("/tenants").send(tenantData);

      expect(response.status).toBe(201);
    });
  });
});
