using GymTracker.Domain.Common;

namespace GymTracker.Domain.Users;

public sealed class User : Entity
{
  public string Username { get; private set; } = default!;
  public string Email { get; private set; } = default!;
  public string PasswordHash { get; private set; } = default!;
  public bool IsMaster { get; private set; }
  public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

  private User() { } // EF

  public User(string username, string email, string passwordHash, bool isMaster = false)
  {
    if (string.IsNullOrWhiteSpace(username))
      throw new DomainException("Username é obrigatório.");
    if (!email.Contains('@'))
      throw new DomainException("Email inválido.");

    Username = username.Trim();
    Email = email.Trim().ToLowerInvariant();
    PasswordHash = passwordHash;
    IsMaster = isMaster;
  }

  public void ChangePassword(string newHash) => PasswordHash = newHash;
}