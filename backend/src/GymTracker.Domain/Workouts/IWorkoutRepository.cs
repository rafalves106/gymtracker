namespace GymTracker.Domain.Workouts;

public interface IWorkoutRepository
{
  Task AddAsync(Workout workout, CancellationToken ct = default);
  Task<List<Workout>> GetByUserAsync(Guid userId, CancellationToken ct = default);
  Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct = default);
}