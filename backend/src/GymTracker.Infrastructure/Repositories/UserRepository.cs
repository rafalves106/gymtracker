using GymTracker.Domain.Users;
using GymTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymTracker.Infrastructure.Repositories;

public sealed class UserRepository(AppDbContext db) : IUserRepository
{
  public Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
      db.Users.FirstOrDefaultAsync(u => u.Username == username, ct);

  public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
      db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);

  public async Task AddAsync(User user, CancellationToken ct = default) =>
      await db.Users.AddAsync(user, ct);

  public Task<bool> ExistsAsync(string username, string email, CancellationToken ct = default) =>
      db.Users.AnyAsync(u => u.Username == username || u.Email == email.ToLower(), ct);
}