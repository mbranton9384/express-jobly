"use strict";

const request = require("supertest");
const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  const newUser = {
    username: "newuser",
    firstName: "Test",
    lastName: "User",
    email: "testuser@test.com",
    password: "password",
    isAdmin: false,
  };

  test("works for admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send(newUser)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "newuser",
        firstName: "Test",
        lastName: "User",
        email: "testuser@test.com",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .post("/users")
        .send(newUser)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app)
        .post("/users")
        .send(newUser);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body.users).toEqual([
      expect.objectContaining({ username: "u1" }),
      expect.objectContaining({ username: "u2" }),
      expect.objectContaining({ username: "u3" }),
      expect.objectContaining({ username: "admin" }),
    ]);
    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anonymous", async function () {
    const resp = await request(app).get("/users");
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for the correct user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: expect.objectContaining({ username: "u1" }),
    });
  });

  test("works for admin accessing any user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: expect.objectContaining({ username: "u1" }),
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .get(`/users/u2`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anonymous", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", function () {
  test("works for the correct user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({ firstName: "Updated" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user.firstName).toEqual("Updated");
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .patch(`/users/u2`)
        .send({ firstName: "Updated" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({ firstName: "AdminUpdated" })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.user.firstName).toEqual("AdminUpdated");
  });

  test("unauth for anonymous", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({ firstName: "Updated" });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for the correct user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .delete(`/users/u2`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth for anonymous", async function () {
    const resp = await request(app).delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });
});

