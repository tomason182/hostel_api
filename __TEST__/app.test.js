const request = require("supertest");
const app = require("../src/app");

// User routes test
describe("Create a new user", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull$%pass",
      first_name: "myName",
      last_name: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
  test("Should throw error if body don't contain necessary values", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "notGoodPass",
      first_name: "myName",
      last_name: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if password contain white spaces", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull $%pass",
      first_name: "myName",
      last_name: "myLastname",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if body contain invalid field", async () => {
    const response = await request(app).post("/api/v1/users").send({
      username: "myemail@email.com",
      password: "hasApo123Werfull $%pass",
      first_name: "myName",
      last_name: "myLastname",
      harmful_field: "hacked",
    });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
});

describe("Authenticate a user", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users/auth");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Logout a user", () => {
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
