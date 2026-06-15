using GymTracker.Application.Auth;
namespace GymTracker.Infrastructure.Security;

public sealed class BcryptPasswordHasher : IPasswordHasher
{
  public string Hash(string pwd) => BCrypt.Net.BCrypt.HashPassword(pwd, workFactor: 12);
  public bool Verify(string pwd, string hash) => BCrypt.Net.BCrypt.Verify(pwd, hash);
}