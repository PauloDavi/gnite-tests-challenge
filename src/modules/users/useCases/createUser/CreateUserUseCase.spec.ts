import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const newUser = await createUserUseCase.execute({
      name: "fulano",
      email: "user@gmail.com",
      password: "123456",
    });

    expect(newUser).toHaveProperty("id");
  });

  it("should not be able to create a new user with exists email", async () => {
    const user = {
      name: "fulano",
      email: "user@gmail.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    expect(createUserUseCase.execute(user)).rejects.toBeInstanceOf(
      CreateUserError
    );
  });
});
