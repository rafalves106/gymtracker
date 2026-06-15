using GymTracker.Domain.Common;

namespace GymTracker.Domain.Sessions;

public enum SessionStatus { Running, Paused, Completed, Cancelled }

public sealed class WorkoutSession : Entity
{
  private readonly List<ExerciseProgress> _progress = new();

  public Guid UserId { get; private set; }
  public Guid WorkoutId { get; private set; }
  public SessionStatus Status { get; private set; }
  public DateTime StartedAt { get; private set; }
  public DateTime? FinishedAt { get; private set; }
  public IReadOnlyCollection<ExerciseProgress> Progress => _progress.AsReadOnly();

  private WorkoutSession() { }

  public WorkoutSession(Guid userId, Guid workoutId, IEnumerable<Guid> exerciseIds)
  {
    UserId = userId;
    WorkoutId = workoutId;
    Status = SessionStatus.Running;
    StartedAt = DateTime.UtcNow;
    foreach (var id in exerciseIds)
      _progress.Add(new ExerciseProgress(Id, id));
  }

  public void Pause() { EnsureActive(); Status = SessionStatus.Paused; }
  public void Resume() { if (Status == SessionStatus.Paused) Status = SessionStatus.Running; }
  public void Cancel() { EnsureActive(); Status = SessionStatus.Cancelled; FinishedAt = DateTime.UtcNow; }
  public void Complete() { EnsureActive(); Status = SessionStatus.Completed; FinishedAt = DateTime.UtcNow; }

  public void IncrementSet(Guid exerciseId) =>
      Find(exerciseId).Increment();

  public void DecrementSet(Guid exerciseId) =>
      Find(exerciseId).Decrement();

  private ExerciseProgress Find(Guid exId) =>
      _progress.FirstOrDefault(p => p.ExerciseId == exId)
      ?? throw new DomainException("Exercício não está na sessão.");

  private void EnsureActive()
  {
    if (Status is SessionStatus.Completed or SessionStatus.Cancelled)
      throw new DomainException("Sessão já finalizada.");
  }
}

public sealed class ExerciseProgress : Entity
{
  public Guid SessionId { get; private set; }
  public Guid ExerciseId { get; private set; }
  public int CompletedSets { get; private set; }

  private ExerciseProgress() { }
  public ExerciseProgress(Guid sessionId, Guid exerciseId)
  {
    SessionId = sessionId; ExerciseId = exerciseId; CompletedSets = 0;
  }
  public void Increment() => CompletedSets++;
  public void Decrement() { if (CompletedSets > 0) CompletedSets--; }
}