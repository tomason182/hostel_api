const {
  dbConnect,
  cleanData,
  dbDisconnect,
} = require("../src/utils/mongoMemoryServer");
const { getDb } = require("../src/config/db_config");
const request = require("supertest");
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

const mockUserRegistration = async (user) => {
  await request(app).post("/api/v1/users").send(user);
};

/// USERS ROUTES TEST ///

describe.skip("Create a new user", () => {
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

describe.skip("Authenticate a user", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  test("Expect set cookie if user log successfully", async () => {
    await mockUserRegistration(mockUser);
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
    await mockUserRegistration(mockUser);
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
    const db = getDb();
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

describe.skip("Get user profile", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });
  test("Should response status 401 if user is not auth", async () => {
    const response = await request(app).get("/api/v1/users/profile/");
    //expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(401);
  });
  test("Should response 200 if user is auth", async () => {
    await mockUserRegistration(mockUser);
    const loginResponse = await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });
    const cookies = loginResponse.headers["set-cookie"];
    const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));

    const response = await request(app)
      .get("/api/v1/users/profile/")
      .set("Cookie", jwtCookie);
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

/// PROPERTIES ROUTES TEST ///

const mockProperty = {
  propertyName: "test property",
  street: "Av test 123",
  city: "Azul",
  postalCode: "7300",
  countryCode: "AR",
  phoneNumber: "+5492281536272",
  email: "test@gmail.com",
};

const makeFakeId = (length) => {
  let result = null;
  let counter = 0;
  const chars = "zxcvbnmasdfghjklqwertyuiop1234567890";
  while (counter < length) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    counter += 1;
  }
  return result;
};

describe("Create a new property", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  beforeEach(async () => {
    await mockUserRegistration(mockUser);
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  test("Should return 200 status when property is created", async () => {
    const loginResponse = await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });
    const cookies = loginResponse.headers["set-cookie"];
    const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));
    const response = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
});

describe("Get property details", () => {
  beforeAll(async () => {
    await dbConnect();
  });
  beforeEach(async () => {
    await mockUserRegistration(mockUser);
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  test("Should return 401 status if user is not authenticate", async () => {
    const response = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty);
    expect(response.status).toEqual(401);
  });

  test("Should return 200 status when get property", async () => {
    const loginResponse = await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });
    const cookies = loginResponse.headers["set-cookie"];
    const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));
    const propertyResponse = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty)
      .set("Cookie", jwtCookie);
    const propertyId = propertyResponse.body.value["insertedId"];
    const response = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });

  test("Should return 400 status when property not found", async () => {
    const loginResponse = await request(app).post("/api/v1/users/auth").send({
      username: mockUser.username,
      password: mockUser.password,
    });
    const cookies = loginResponse.headers["set-cookie"];
    const jwtCookie = cookies.find((cookie) => cookie.startsWith("jwt="));
    await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty)
      .set("Cookie", jwtCookie);
    const propertyId = "66ad1fba6f3092848fe560e2";
    const response = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body["msg"]).toEqual("property not found");
  });
  test.skip("should return 401 if user credentials are invalid", async () => {});
});
