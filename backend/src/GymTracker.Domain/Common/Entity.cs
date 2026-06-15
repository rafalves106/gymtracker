namespace GymTracker.Domain.Common;

public abstract class Entity
{
  public Guid Id { get; protected set; } = Guid.NewGuid();

  public override bool Equals(object? obj) =>
      obj is Entity other && Id == other.Id && GetType() == other.GetType();

  public override int GetHashCode() => Id.GetHashCode();
}