import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("GetStatementOperationController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 10);

    await connection.query(`
      INSERT INTO USERS(id, name, email, password, created_at)
      values('${id}', 'admin', 'admin@gmail.com', '${password}', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement of an user", async () => {
    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "admin@gmail.com",
      password: "admin",
    });

    const { body: statementCreated } = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        authorization: `Bearer ${token}`,
      })
      .send({
        description: "deposito do mes",
        amount: 10,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statementCreated.id}`)
      .set({
        authorization: `Bearer ${token}`,
      })
      .send();

    expect(response.body.id).toEqual(statementCreated.id);
    expect(response.body.amount).toEqual("10.00");
  });
});
