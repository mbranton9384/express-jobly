// File: routes/jobs.test.js

"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Job = require("../models/job");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, adminToken, userToken } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "New Job",
          salary: 100000,
          equity: "0",
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });

  // More tests here for GET, PATCH, DELETE routes
});
