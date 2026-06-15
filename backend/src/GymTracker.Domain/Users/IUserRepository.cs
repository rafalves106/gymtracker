namespace GymTracker.Domain.Users;

public interface IUserRepository
{
  Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
  Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
  Task AddAsync(User user, CancellationToken ct = default);
  Task<bool> ExistsAsync(string username, string email, CancellationToken ct = default);
}