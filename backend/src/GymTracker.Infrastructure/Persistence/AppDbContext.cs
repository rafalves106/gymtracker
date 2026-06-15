using GymTracker.Application.Auth;
using GymTracker.Domain.Sessions;
using GymTracker.Domain.Users;
using GymTracker.Domain.Workouts;
using Microsoft.EntityFrameworkCore;

namespace GymTracker.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
  : DbContext(options), IUnitOfWork
{
  public DbSet<User> Users => Set<User>();
  public DbSet<Workout> Workouts => Set<Workout>();
  public DbSet<WorkoutSession> Sessions => Set<WorkoutSession>();

  protected override void OnModelCreating(ModelBuilder b)
  {
    b.Entity<User>(e =>
    {
      e.HasKey(u => u.Id);
      e.HasIndex(u => u.Username).IsUnique();
      e.HasIndex(u => u.Email).IsUnique();
      e.Property(u => u.Username).HasMaxLength(50);
      e.Property(u => u.Email).HasMaxLength(255);
    });

    b.Entity<Workout>(e =>
    {
      e.HasKey(w => w.Id);
      e.Property(w => w.Name).HasMaxLength(100);
      e.HasMany(w => w.Exercises).WithOne()
         .HasForeignKey(x => x.WorkoutId).OnDelete(DeleteBehavior.Cascade);
      e.Metadata.FindNavigation(nameof(Workout.Exercises))!
         .SetPropertyAccessMode(PropertyAccessMode.Field);
    });

    b.Entity<Exercise>().HasKey(x => x.Id);

    b.Entity<WorkoutSession>(e =>
    {
      e.HasKey(s => s.Id);
      e.HasMany(s => s.Progress).WithOne()
         .HasForeignKey(p => p.SessionId).OnDelete(DeleteBehavior.Cascade);
      e.Metadata.FindNavigation(nameof(WorkoutSession.Progress))!
         .SetPropertyAccessMode(PropertyAccessMode.Field);
    });

    b.Entity<ExerciseProgress>().HasKey(p => p.Id);
  }

  Task IUnitOfWork.SaveChangesAsync(CancellationToken ct) =>
  base.SaveChangesAsync(ct);
}