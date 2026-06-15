using GymTracker.Domain.Users;

namespace GymTracker.Application.Auth;

public sealed class AuthService(IUserRepository users, IPasswordHasher hasher, IJwtProvider jwt, IUnitOfWork uow)
{
  public async Task<string> RegisterAsync(string username, string email, string password, CancellationToken ct)
  {
    if (await users.ExistsAsync(username, email, ct))
      throw new InvalidOperationException("Usuário ou email já cadastrado.");

    var user = new User(username, email, hasher.Hash(password));
    await users.AddAsync(user, ct);
    await uow.SaveChangesAsync(ct);
    return jwt.Generate(user);
  }

  public async Task<string> LoginAsync(string usernameOrEmail, string password, CancellationToken ct)
  {
    var user = usernameOrEmail.Contains('@')
        ? await users.GetByEmailAsync(usernameOrEmail, ct)
        : await users.GetByUsernameAsync(usernameOrEmail, ct);

    if (user is null || !hasher.Verify(password, user.PasswordHash))
      throw new UnauthorizedAccessException("Credenciais inválidas.");

    return jwt.Generate(user);
  }
}

public interface IPasswordHasher { string Hash(string pwd); bool Verify(string pwd, string hash); }
public interface IJwtProvider { string Generate(User user); }
public interface IUnitOfWork { Task SaveChangesAsync(CancellationToken ct = default); }