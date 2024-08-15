import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTable } from "../utils";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
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
    it("Should return 201", async () => {
      // AAA rule

      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    it("should persist user in the database", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      //Asserts
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toEqual(userData.email);
    });

    it("should return id of the user created in the database", async () => {
      // Arrange
      // This section is used to set up any necessary data or context before performing the action.
      // Here, we define the user data that will be sent in the request to create a new user.
      const userData = {
        firstName: "John", // First name of the user
        lastName: "D", // Last name of the user
        email: "john@gmail.com", // Email of the user
        password: "password", // Password for the user
      };

      // Act
      // This section performs the action that you want to test.
      // We send a POST request to the `/auth/register` endpoint with the `userData` to create a new user.
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      // This section checks that the results of the action are as expected.
      // First, we check that the response body contains an "id" property, indicating that the user was successfully created.
      expect(response.body).toHaveProperty("id");

      // Next, we fetch the user repository to check the data directly from the database.
      const userRepository = connection.getRepository(User);

      // We retrieve all users from the database. Ideally, there should be only one user, the one we just created.
      const users = await userRepository.find();

      // Finally, we assert that the "id" returned in the response matches the "id" of the user stored in the database.
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });

    it("should assing a customer role", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store hashed password in the database", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it("should retur 400 status code when email already exists", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "D",
        email: "john@gmail.com",
        password: "secure",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      // Act
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });

  describe("Fields are missing", () => {});
});
