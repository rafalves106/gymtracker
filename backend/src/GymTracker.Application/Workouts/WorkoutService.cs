using GymTracker.Domain.Workouts;
using GymTracker.Application.Auth;

namespace GymTracker.Application.Workouts;

public sealed class WorkoutService(IWorkoutRepository repo, IUnitOfWork uow)
{
  public async Task<WorkoutDto> CreateAsync(Guid userId, CreateWorkoutRequest req, CancellationToken ct)
  {
    var workout = new Workout(userId, req.Name);
    foreach (var e in req.Exercises)
      workout.AddExercise(e.Name, e.TargetSets, e.TargetReps, e.RestSeconds);

    await repo.AddAsync(workout, ct);
    await uow.SaveChangesAsync(ct);
    return Map(workout);
  }

  public async Task<List<WorkoutDto>> GetAllAsync(Guid userId, CancellationToken ct) =>
      (await repo.GetByUserAsync(userId, ct)).Select(Map).ToList();

  public async Task AssignDayAsync(Guid userId, Guid workoutId, DayOfWeek? day, CancellationToken ct)
  {
    var w = await repo.GetByIdAsync(workoutId, ct)
            ?? throw new KeyNotFoundException();
    if (w.UserId != userId) throw new UnauthorizedAccessException();
    w.AssignToDay(day);
    await uow.SaveChangesAsync(ct);
  }

  public async Task<List<WorkoutDto>> GetTodayAsync(Guid userId, CancellationToken ct)
  {
    var today = DateTime.UtcNow.DayOfWeek;
    return (await repo.GetByUserAsync(userId, ct))
        .Where(w => w.ScheduledDay == today)
        .Select(Map).ToList();
  }

  private static WorkoutDto Map(Workout w) => new(
      w.Id, w.Name, w.ScheduledDay,
      w.Exercises.OrderBy(e => e.Order)
          .Select(e => new ExerciseDto(e.Id, e.Name, e.TargetSets, e.TargetReps, e.RestSeconds, e.Order))
          .ToList());
}