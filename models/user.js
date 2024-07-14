"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */
class User {
  // Existing methods...

  /** Apply for a job
   *
   * Adds an application for the user with jobId.
   *
   * Returns { applied: jobId }
   *
   * Throws NotFoundError if user or job not found.
   **/
  static async applyToJob(username, jobId) {
    const result = await db.query(
      `INSERT INTO applications (username, job_id)
       VALUES ($1, $2)
       RETURNING job_id`,
      [username, jobId]
    );
    if (!result.rows[0]) {
      throw new NotFoundError(`Application failed for username: ${username} or job: ${jobId}`);
    }
    return { applied: jobId };
  }

  /** Given a username, return data about user, including jobs applied for.
   *
   * Returns { username, firstName, lastName, isAdmin, jobs }
   *   where jobs is [jobId, jobId, ...]
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"
       FROM users
       WHERE username = $1`, [username]
    );

    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const jobsRes = await db.query(
      `SELECT job_id
       FROM applications
       WHERE username = $1`, [username]
    );

    user.jobs = jobsRes.rows.map(row => row.job_id);

    return user;
  }

  // Other existing methods like authenticate, register, update, findAll, remove...
}

module.exports = User;

