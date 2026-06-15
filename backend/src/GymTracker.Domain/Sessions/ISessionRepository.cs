namespace GymTracker.Domain.Sessions;

public interface ISessionRepository
{
  Task AddAsync(WorkoutSession session, CancellationToken ct = default);
  Task<WorkoutSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
}