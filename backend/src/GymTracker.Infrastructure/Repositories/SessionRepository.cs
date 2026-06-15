using GymTracker.Domain.Sessions;
using GymTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymTracker.Infrastructure.Repositories;

public sealed class SessionRepository(AppDbContext db) : ISessionRepository
{
  public async Task AddAsync(WorkoutSession session, CancellationToken ct = default) =>
      await db.Sessions.AddAsync(session, ct);

  public Task<WorkoutSession?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
      db.Sessions.Include(s => s.Progress)
                 .FirstOrDefaultAsync(s => s.Id == id, ct);
}