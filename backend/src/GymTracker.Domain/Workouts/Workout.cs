using GymTracker.Domain.Common;

namespace GymTracker.Domain.Workouts;

public sealed class Workout : Entity
{
  private readonly List<Exercise> _exercises = new();

  public Guid UserId { get; private set; }
  public string Name { get; private set; } = default!;
  // Nulo = treino não atribuído a nenhum dia
  public DayOfWeek? ScheduledDay { get; private set; }
  public IReadOnlyCollection<Exercise> Exercises => _exercises.AsReadOnly();

  private Workout() { }

  public Workout(Guid userId, string name)
  {
    if (string.IsNullOrWhiteSpace(name))
      throw new DomainException("Nome do treino é obrigatório.");
    UserId = userId;
    Name = name.Trim();
  }

  public void Rename(string name) => Name = name.Trim();

  // Usado pelo drag-and-drop: arrastar para a caixinha de um dia
  public void AssignToDay(DayOfWeek? day) => ScheduledDay = day;

  public Exercise AddExercise(string name, int sets, int reps, int restSeconds)
  {
    var order = _exercises.Count;
    var exercise = new Exercise(Id, name, sets, reps, restSeconds, order);
    _exercises.Add(exercise);
    return exercise;
  }

  public void RemoveExercise(Guid exerciseId)
  {
    var ex = _exercises.FirstOrDefault(e => e.Id == exerciseId);
    if (ex is not null) _exercises.Remove(ex);
  }

  public void ReplaceExercises(IEnumerable<(string Name, int Sets, int Reps, int RestSeconds)> exercises)
  {
    _exercises.Clear();
    foreach (var e in exercises)
      AddExercise(e.Name, e.Sets, e.Reps, e.RestSeconds);
  }
}