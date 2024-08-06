import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
  describe("Given all fields", () => {
    it("Should return 201", async () => {
      // AAA rule

      // Arrange
      const userData = {
        firstName: "Avishek",
        lastName: "D",
        email: "dasavishek@gmail.com",
        password: "secure",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });
  });

  it("it should return json", async () => {
    // Arrange
    const userData = {
      firstName: "Avishek",
      lastName: "D",
      email: "dasavishek@gmail.com",
      password: "secure",
    };
    // Act
    const response = await request(app).post("/auth/register").send(userData);
    // Assert
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });

  it("should persist the user in the database", async () => {
    // Arrange
    const userData = {
      firstName: "Avishek",
      lastName: "D",
      email: "dasavishek@gmail.com",
      password: "secure",
    };

    // Act
    const response = await request(app).post("/auth/register").send(userData);
  });

  describe("Fields are missing", () => {});
});
