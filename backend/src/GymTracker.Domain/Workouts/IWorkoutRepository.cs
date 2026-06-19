namespace GymTracker.Domain.Workouts;

public interface IWorkoutRepository
{
  Task AddAsync(Workout workout, CancellationToken ct = default);
  void Remove(Workout workout);
  Task<List<Workout>> GetByUserAsync(Guid userId, CancellationToken ct = default);
  Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct = default);
}