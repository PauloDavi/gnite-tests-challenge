import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";

import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Get balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should be able to get balance of an user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "fulano",
      email: "fulano@gmail.com",
      password: "123456",
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id,
      description: "deposito do mes",
      amount: 1000,
      type: "deposit" as OperationType,
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id,
      description: "retirada do mes",
      amount: 500,
      type: "withdraw" as OperationType,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(balance.statement.length).toEqual(2);
    expect(balance.balance).toEqual(500);
  });

  it("should not be able to get balance of an user that does not exist", async () => {
    expect(
      getBalanceUseCase.execute({
        user_id: "fakeUserId",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
