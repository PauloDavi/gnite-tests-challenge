import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("GetBalanceController", () => {
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

  it("should be able to get balance of an user", async () => {
    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "admin@gmail.com",
      password: "admin",
    });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        authorization: `Bearer ${token}`,
      })
      .send({
        description: "deposito do mes",
        amount: 10,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        authorization: `Bearer ${token}`,
      })
      .send({
        description: "retirada do mes",
        amount: 5,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.body.statement.length).toEqual(2);
    expect(response.body.balance).toEqual(5);
  });
});
