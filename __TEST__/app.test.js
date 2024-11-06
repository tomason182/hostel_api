const {
  dbConnect,
  cleanData,
  dbDisconnect,
} = require("../src/utils/mongoMemoryServer");
const { getDb } = require("../src/config/db_config");
const request = require("supertest");
const app = require("../src/app");

/// MOCK USERS ///

const mockUser = {
  username: "testuser@mail.com",
  password: "aG00dPa$$worD%12",
  firstName: "testName",
  lastName: "testLastName",
  phoneNumber: "+5492281545152",
  role: "admin",
};

const mockEmployee = {
  username: "testEmployee@mail.com",
  password: "aG00dPa$$worD%12",
  firstName: "employeeName",
  lastName: "employeeLastName",
  phoneNumber: "+5492281545153",
  role: "employee",
};

const mockWrongUser = {
  username: "testuser@mail.com",
  password: "1234",
  firstName: "testName",
  lastName: "testLastName",
};

const mockPasswordSpaced = {
  username: "testuser@mail.com",
  password: "aG00dPa $worD%12",
  firstName: "testName",
  lastName: "testLastName",
  phoneNumber: "+5492281545152",
  role: "admin",
};

const mockInvalidFields = {
  username: "testuser@mail.com",
  password: "aG00dPa$worD%12",
  firstName: "testName",
  lastName: "testLastName",
  phoneNumber: "+5492281545152",
  role: "admin",
  hack: "hacked",
};

const updateMockUser = {
  firstName: "updatedTestName",
  lastName: "updatedTestLastName",
  phoneNumber: "+5492281545152",
  email: "testuser@mail.com",
  role: "admin",
};

const mockUserRegistration = async (user) => {
  return request(app).post("/api/v1/users").send(user);
};

const mockUserRegisterAndLogin = async (user) => {
  await request(app).post("/api/v1/users").send(user);

  const loginResponse = await request(app).post("/api/v1/users/auth").send({
    username: user.username,
    password: user.password,
  });

  const cookies = loginResponse.header["set-cookie"];
  const token = cookies.find((cookie) => cookie.startsWith("jwt="));

  return token;
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
    const response = await mockUserRegistration(mockUser);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.msg).toMatch(/User created id:/);
  });
  test("Should throw error if body don't contain necessary values", async () => {
    const response = await mockUserRegistration(mockWrongUser);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if password contain white spaces", async () => {
    const response = await mockUserRegistration(mockPasswordSpaced);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
  });
  test("Should throw error if body contain invalid field", async () => {
    const response = await mockUserRegistration(mockInvalidFields);
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
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);

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
  beforeAll(async () => {
    await dbConnect();
  });
  afterEach(async () => {
    await cleanData();
  });
  afterAll(async () => {
    await dbDisconnect();
  });

  test("Should remove token from cookies", async () => {
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);
    expect(jwtCookie).toBeDefined();
    expect(jwtCookie).toMatch(/Path=\//);

    const response = await request(app).post("/api/v1/users/logout");
    expect(response.headers["set-cookies"]).not.toBeDefined();
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
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);

    const response = await request(app)
      .get("/api/v1/users/profile/")
      .set("Cookie", jwtCookie);
    expect(response.status).toEqual(200);
  });
});

describe.skip("Update user profile", () => {
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
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);

    const response = await request(app)
      .put("/api/v1/users/profile/")
      .send(updateMockUser)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });
  test("Should response with status 403 if user user don't have the correct access role", async () => {
    const jwtCookie = await mockUserRegisterAndLogin(mockEmployee);

    const response = await request(app)
      .put("/api/v1/users/profile/")
      .set("Cookie", jwtCookie);
    expect(response.status).toEqual(403);
  });
});

describe.skip("Delete user profile", () => {
  test("Not implemented Yet", async () => {});
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

const mockCreateProperty = async (property, token) => {
  const response = await request(app)
    .post("/api/v1/properties/create")
    .send(property)
    .set("Cookie", token);

  return response.body.value["insertedId"];
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

describe.skip("Create a new property", () => {
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
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);

    const response = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.msg).toMatch(/Property created successfully/);
  });

  test("Should return 403 status if user does not have admin role", async () => {
    const jwtCookie = await mockUserRegisterAndLogin(mockEmployee);

    const response = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(403);
    expect(response.body.msg).toMatch(/Access denied/);
  });
  test("should return 401 status if user is not authenticated", async () => {
    const response = await request(app)
      .post("/api/v1/properties/create")
      .send(mockProperty);
    /* expect(response.headers["content-type"]).toMatch(/json/); */
    expect(response.status).toEqual(401);
  });
});

describe("Get property details", () => {
  beforeAll(async () => {
    await dbConnect();
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
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);
    const propertyId = await mockCreateProperty(mockProperty, jwtCookie);

    const response = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
  });

  test("Should return 400 status when property not found", async () => {
    const jwtCookie = await mockUserRegisterAndLogin(mockUser);
    await mockCreateProperty(mockProperty, jwtCookie);
    const propertyId = "66ad1fba6f3092848fe560e2";
    const response = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .set("Cookie", jwtCookie);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(400);
    expect(response.body["msg"]).toEqual("property not found");
  });
  test("should return 401 if user credentials are invalid", async () => {});
});
