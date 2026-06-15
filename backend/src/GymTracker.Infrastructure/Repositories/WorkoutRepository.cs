using GymTracker.Domain.Workouts;
using GymTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GymTracker.Infrastructure.Repositories;

public sealed class WorkoutRepository(AppDbContext db) : IWorkoutRepository
{
  public async Task AddAsync(Workout workout, CancellationToken ct = default) =>
      await db.Workouts.AddAsync(workout, ct);

  public Task<List<Workout>> GetByUserAsync(Guid userId, CancellationToken ct = default) =>
      db.Workouts.Include(w => w.Exercises)
                 .Where(w => w.UserId == userId)
                 .ToListAsync(ct);

  public Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
      db.Workouts.Include(w => w.Exercises)
                 .FirstOrDefaultAsync(w => w.Id == id, ct);
}