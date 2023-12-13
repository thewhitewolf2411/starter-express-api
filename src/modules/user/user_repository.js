/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
const uuid = require("@common/utils/uuid")
const convertToCamelCase = require("@common/utils/convertToCamelCase")

class UserRepository {
  constructor(db) {
    this.db = db
  }
  async addTaxiUser({ email, firstName, lastName, phoneNumber, password }) {
    const query = {
      text: `INSERT INTO "user".users(id, email, first_name, last_name, phone_number, created_at, updated_at, password)
      VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6)
      ON CONFLICT (email) DO NOTHING RETURNING *`,
      values: [uuid(), email, firstName, lastName, phoneNumber, password],
    };

    try {
      const { rows } = await this.db.query(query);

      const user = convertToCamelCase(rows).shift();

      if (!user) {
        return ["User with the provided email already exists", null];
      }

      return [null, user];
    } catch (e) {
      return [e.message, null];
    }
  }

  async userByEmailAndPassword({ email, password }){
    const query = {
      text: `SELECT id, email, first_name, last_name, phone_number, created_at, updated_at
           FROM "user".users
           WHERE email = $1 AND password = $2
           LIMIT 1`,
      values: [email, password],
    };

    try {
      const { rows } = await this.db.query(query);

      if (rows.length === 0) {
        return ["User not found with the provided email and password", null];
      }

      const user = convertToCamelCase(rows[0]);
      return [null, user];
    } catch (e) {
      return [e.message, null];
    }
  }

  async getUserById({ userId }){
    const query = {
      text: `SELECT id, email, first_name, last_name, phone_number, created_at, updated_at
           FROM "user".users
           WHERE id = $1
           LIMIT 1`,
      values: [userId],
    };

    try {
      const { rows } = await this.db.query(query);

      if (rows.length === 0) {
        return ["User not found", null];
      }

      const user = convertToCamelCase(rows[0]);
      return [null, user];
    } catch (e) {
      return [e.message, null];
    }
  }

  async updateUser({ userId, email, firstName, lastName, phoneNumber }){
    try {
      // Retrieve user by ID
      const selectQuery = {
        text: `SELECT id, email, first_name, last_name, phone_number, created_at, updated_at
             FROM "user".users
             WHERE id = $1
             LIMIT 1`,
        values: [userId],
      };

      const { rows: selectRows } = await this.db.query(selectQuery);

      if (selectRows.length === 0) {
        return ["User not found", null];
      }

      const user = convertToCamelCase(selectRows[0]);

      // Update user based on ID
      const updateQuery = {
        text: `UPDATE "user".users
             SET email = $1, first_name = $2, last_name = $3, phone_number = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
        values: [
          email,
          firstName,
          lastName,
          phoneNumber,
          userId,
        ],
      };

      const { rows: updateRows } = await this.db.query(updateQuery);
      const updatedUserResult = convertToCamelCase(updateRows[0]);

      return [null, updatedUserResult];
    } catch (e) {
      return [e.message, null];
    }
  }
}

module.exports = UserRepository
