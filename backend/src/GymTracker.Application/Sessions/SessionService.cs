using GymTracker.Application.Auth;        // IUnitOfWork
using GymTracker.Domain.Sessions;
using GymTracker.Domain.Workouts;

namespace GymTracker.Application.Sessions;

public record ExerciseProgressDto(Guid ExerciseId, int CompletedSets);

public record SessionDto(
Guid Id,
Guid WorkoutId,
string Status,
DateTime StartedAt,
DateTime? FinishedAt,
List<ExerciseProgressDto> Progress);

public sealed class SessionService(
ISessionRepository sessions,
IWorkoutRepository workouts,
IUnitOfWork uow)
{
  public async Task<SessionDto> StartAsync(Guid userId, Guid workoutId, CancellationToken ct)
  {
    var workout = await workouts.GetByIdAsync(workoutId, ct)
        ?? throw new KeyNotFoundException("Treino não encontrado.");
    if (workout.UserId != userId) throw new UnauthorizedAccessException();

    var session = new WorkoutSession(userId, workoutId, workout.Exercises.Select(e => e.Id));
    await sessions.AddAsync(session, ct);
    await uow.SaveChangesAsync(ct);
    return Map(session);
  }

  public Task<SessionDto> PauseAsync(Guid userId, Guid id, CancellationToken ct)
      => MutateAsync(userId, id, s => s.Pause(), ct);

  public Task<SessionDto> ResumeAsync(Guid userId, Guid id, CancellationToken ct)
      => MutateAsync(userId, id, s => s.Resume(), ct);

  public Task<SessionDto> CompleteAsync(Guid userId, Guid id, CancellationToken ct)
      => MutateAsync(userId, id, s => s.Complete(), ct);

  public Task<SessionDto> CancelAsync(Guid userId, Guid id, CancellationToken ct)
      => MutateAsync(userId, id, s => s.Cancel(), ct);

  public Task<SessionDto> IncrementAsync(Guid userId, Guid id, Guid exId, CancellationToken ct)
      => MutateAsync(userId, id, s => s.IncrementSet(exId), ct);

  public Task<SessionDto> DecrementAsync(Guid userId, Guid id, Guid exId, CancellationToken ct)
      => MutateAsync(userId, id, s => s.DecrementSet(exId), ct);

  private async Task<SessionDto> MutateAsync(
      Guid userId, Guid id, Action<WorkoutSession> action, CancellationToken ct)
  {
    var session = await sessions.GetByIdAsync(id, ct)
        ?? throw new KeyNotFoundException("Sessão não encontrada.");
    if (session.UserId != userId) throw new UnauthorizedAccessException();

    action(session);
    await uow.SaveChangesAsync(ct);
    return Map(session);
  }

  private static SessionDto Map(WorkoutSession s) => new(
      s.Id,
      s.WorkoutId,
      s.Status.ToString(),
      s.StartedAt,
      s.FinishedAt,
      s.Progress.Select(p => new ExerciseProgressDto(p.ExerciseId, p.CompletedSets)).ToList());
}