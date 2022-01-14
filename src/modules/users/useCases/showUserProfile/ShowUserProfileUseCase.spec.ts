import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show user profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to return user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "fulano",
      email: "user@gmail.com",
      password: "123456",
    });

    const authenticatedUser = await showUserProfileUseCase.execute(user.id);

    expect(authenticatedUser).toHaveProperty("id");
    expect(authenticatedUser.id).toEqual(user.id);
    expect(authenticatedUser.name).toEqual(user.name);
  });

  it("should not be able to return inexisti user", async () => {
    expect(showUserProfileUseCase.execute("noId")).rejects.toBeInstanceOf(
      ShowUserProfileError
    );
  });
});
