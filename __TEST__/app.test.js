const {
  connectToDatabase,
  usersCollection,
  closeConn,
} = require("../src/config/db_config");
const request = require("supertest");
const { saltGenerator, hashGenerator } = require("../src/utils/hash");
const { jwtTokenGenerator } = require("../src/utils/tokenGenerator");
const app = require("../src/app");
const { getEventListeners } = require("supertest/lib/test");

// User routes test
describe.skip("Create a new user", () => {
  beforeEach(async () => {
    await connectToDatabase();
    await usersCollection.deleteMany({});
    await closeConn();
  });

  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull$%pass",
      firstName: "myName",
      lastName: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
  test("Should throw error if body don't contain necessary values", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "notGoodPass",
      firstName: "myName",
      lastName: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if password contain white spaces", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull $%pass",
      firstName: "myName",
      lastName: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if body contain invalid field", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull $%pass",
      firstName: "myName",
      lastName: "myLastname",
      harmful_field: "hacked",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
});

describe.skip("Authenticate a user", () => {
  const mockUser = {
    username: "test@mail.com",
    password: "aVeryGoodP@$$word123",
    firstName: "test",
    lastName: "auth",
  };

  const salt = saltGenerator(32);
  const hashedPassword = hashGenerator(mockUser.password, salt);

  beforeEach(async () => {
    await connectToDatabase();
    await usersCollection.deleteMany({});
  });

  afterEach(async () => {
    await closeConn();
  });

  test("Expect set cookie if user log successfully", async () => {
    await usersCollection.insertOne({
      username: mockUser.username,
      hashedPassword: hashedPassword,
      salt: salt,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    const response = await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.status).toEqual(200);

    const cookies = response.headers["set-cookie"];
    const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));

    expect(jwtCookie).toBeDefined();
    expect(jwtCookie).toMatch(/Path=\//);
  });

  test("Should return error if username or password are incorrect", async () => {
    await usersCollection.insertOne({
      username: mockUser.username,
      hashedPassword: hashedPassword,
      salt: salt,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    const response = await request(app).post("/api/v1/users/auth").send({
      username: "invalid@mail.com",
      password: mockUser.password,
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.headers["set-cookie"]).not.toBeDefined();
    expect(response.status).toEqual(401);
  });
});

describe.skip("Logout a user", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users/logout");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Get user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).get(
      "/api/v1/users/profile/userId_0001"
    );
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Update user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).put(
      "/api/v1/users/profile/userId_0001"
    );
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Delete user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).delete(
      "/api/v1/users/profile/userId_0001"
    );
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});
