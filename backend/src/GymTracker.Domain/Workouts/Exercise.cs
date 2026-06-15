using GymTracker.Domain.Common;

namespace GymTracker.Domain.Workouts;

public sealed class Exercise : Entity
{
  public Guid WorkoutId { get; private set; }
  public string Name { get; private set; } = default!;
  public int TargetSets { get; private set; }
  public int TargetReps { get; private set; }
  public int RestSeconds { get; private set; }
  public int Order { get; private set; }

  private Exercise() { }

  public Exercise(Guid workoutId, string name, int targetSets, int targetReps, int restSeconds, int order)
  {
    if (targetSets <= 0) throw new DomainException("Séries devem ser > 0.");
    if (restSeconds < 0) throw new DomainException("Descanso inválido.");
    WorkoutId = workoutId;
    Name = name.Trim();
    TargetSets = targetSets;
    TargetReps = targetReps;
    RestSeconds = restSeconds;
    Order = order;
  }
}