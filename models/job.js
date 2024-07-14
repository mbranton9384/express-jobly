"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    static async create({ title, salary, equity, companyHandle }) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [title, salary, equity, companyHandle]
        );
        return result.rows[0];
    }

    static async findAll({ title, minSalary, hasEquity } = {}) {
        let query = `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs`;
        let whereConditions = [];
        let queryValues = [];

        if (title) {
            queryValues.push(`%${title}%`);
            whereConditions.push(`title ILIKE $${queryValues.length}`);
        }

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            whereConditions.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            whereConditions.push(`equity > 0`);
        }

        if (whereConditions.length > 0) {
            query += " WHERE " + whereConditions.join(" AND ");
        }

        query += " ORDER BY title";

        const result = await db.query(query, queryValues);
        return result.rows;
    }

    static async get(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
            [id]
        );
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            { companyHandle: "company_handle" }
        );
        const jobIdVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${jobIdVarIdx}
                          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
        return job;
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;

