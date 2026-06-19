namespace GymTracker.Application.Workouts;

public record ExerciseDto(Guid Id, string Name, int TargetSets, int TargetReps, int RestSeconds, int Order);
public record WorkoutDto(Guid Id, string Name, DayOfWeek? ScheduledDay, List<ExerciseDto> Exercises);

public record CreateWorkoutRequest(string Name, List<CreateExerciseRequest> Exercises);
public record UpdateWorkoutRequest(string Name, List<CreateExerciseRequest> Exercises);
public record CreateExerciseRequest(string Name, int TargetSets, int TargetReps, int RestSeconds);
public record AssignDayRequest(DayOfWeek? Day);