const {
  dbConnect,
  cleanData,
  dbDisconnect,
} = require("../src/utils/mongoMemoryServer");
const { getDd } = require("../src/config/db_config");
const request = require("supertest");
const { saltGenerator, hashGenerator } = require("../src/utils/hash");
const app = require("../src/app");

const mockUser = {
  username: "testuser1@mail.com",
  password: "aG00dPa$$worD%12",
  firstName: "testName",
  lastName: "testLastName",
};

const mockWrongUser = {
  username: "testuser@mail.com",
  password: "1234",
  firstName: "testName",
  lastName: "testLastName",
};

const mockUserRegistration = async () => {
  (await request(app).post("/api/v1/users")).setEncoding(mockUser);
};

// User routes test
describe("Create a new user", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users").send(mockUser);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
  test("Should throw error if body don't contain necessary values", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send(mockWrongUser);
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

describe("Authenticate a user", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  const salt = saltGenerator(32);
  const hashedPassword = hashGenerator(mockUser.password, salt);

  test("Expect set cookie if user log successfully", async () => {
    const db = getDd();
    const usersCollection = db.collection("users");
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
    const db = getDd();
    const usersCollection = db.collection("users");
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

describe("Logout a user", () => {
  test("Should response status 200 when route is correct", async () => {
    const db = getDd();
    const usersCollection = db.collection("users");
    await usersCollection.insertOne({
      username: mockUser.username,
      hashedPassword: hashedPassword,
      salt: salt,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });

    const response = await request(app).post("/api/v1/users/logout");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Get user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).get("/api/v1/users/profile/");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe.skip("Update user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).put(
      "/api/v1/users/profile/userId_0001"
    );
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe.skip("Delete user profile", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).delete(
      "/api/v1/users/profile/userId_0001"
    );
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});
