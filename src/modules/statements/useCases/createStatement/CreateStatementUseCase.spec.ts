import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";

import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a statement to an user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "fulano",
      email: "fulano@gmail.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 10,
      description: "deposito do mes",
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a statement to an user that does not exist", async () => {
    expect(
      createStatementUseCase.execute({
        user_id: "fakeUserId",
        type: "deposit" as OperationType,
        amount: 10,
        description: "deposito do mes",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a statement to an user if he have insufficient funds", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "fulano",
      email: "fulano@gmail.com",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: "deposit" as OperationType,
      amount: 10,
      description: "deposito do mes",
    });

    expect(
      createStatementUseCase.execute({
        user_id: user.id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "retirada do mes",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
