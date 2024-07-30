const request = require("supertest");
const app = require("../src/app");

// User routes test
describe("Create a new user", () => {
  test("Should response status 200 when route is correct", async () => {
    const response = await request(app).post("/api/v1/users");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});
