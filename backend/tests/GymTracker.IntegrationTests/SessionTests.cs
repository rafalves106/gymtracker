using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace GymTracker.IntegrationTests;

public class SessionTests(GymApiFactory factory) : IClassFixture<GymApiFactory>
{
  private readonly GymApiFactory _factory = factory;

  private record TokenResponse(string Token);
  private record ExerciseDto(Guid Id, string Name, int TargetSets, int TargetReps, int RestSeconds, int Order);
  private record WorkoutDto(Guid Id, string Name, int? ScheduledDay, List<ExerciseDto> Exercises);
  private record ProgressDto(Guid ExerciseId, int CompletedSets);
  private record SessionDto(Guid Id, Guid WorkoutId, string Status, DateTime StartedAt, DateTime? FinishedAt, List<ProgressDto> Progress);

  private async Task<(HttpClient client, WorkoutDto workout)> SetupWorkoutAsync(string suffix)
  {
    var client = _factory.CreateClient();
    var reg = await client.PostAsJsonAsync("/api/auth/register", new
    {
      username = $"sess_{suffix}",
      email = $"sess_{suffix}@test.com",
      password = "Senha@123"
    });
    var token = (await reg.Content.ReadFromJsonAsync<TokenResponse>())!.Token;
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    var create = await client.PostAsJsonAsync("/api/workouts", new
    {
      name = "Treino Sessão",
      exercises = new[]
        {
            new { name = "Supino", targetSets = 3, targetReps = 10, restSeconds = 60 }
        }
    });
    var workout = await create.Content.ReadFromJsonAsync<WorkoutDto>();
    return (client, workout!);
  }

  [Fact]
  public async Task IniciarSessao_RetornaStatusRunning()
  {
    var (client, workout) = await SetupWorkoutAsync("start");

    var res = await client.PostAsync($"/api/sessions/start/{workout.Id}", null);

    res.StatusCode.Should().Be(HttpStatusCode.OK);
    var session = await res.Content.ReadFromJsonAsync<SessionDto>();
    session!.Status.Should().Be("Running");
    session.Progress.Should().HaveCount(1);
    session.Progress[0].CompletedSets.Should().Be(0);
  }

  [Fact]
  public async Task IncrementarSerie_AumentaContador()
  {
    var (client, workout) = await SetupWorkoutAsync("inc");
    var start = await client.PostAsync($"/api/sessions/start/{workout.Id}", null);
    var session = await start.Content.ReadFromJsonAsync<SessionDto>();
    var exId = workout.Exercises[0].Id;

    var res = await client.PostAsync($"/api/sessions/{session!.Id}/exercise/{exId}/increment", null);

    var updated = await res.Content.ReadFromJsonAsync<SessionDto>();
    updated!.Progress[0].CompletedSets.Should().Be(1);
  }

  [Fact]
  public async Task PausarEFinalizarSessao_AtualizaStatus()
  {
    var (client, workout) = await SetupWorkoutAsync("flow");
    var start = await client.PostAsync($"/api/sessions/start/{workout.Id}", null);
    var session = await start.Content.ReadFromJsonAsync<SessionDto>();

    var pause = await client.PostAsync($"/api/sessions/{session!.Id}/pause", null);
    var paused = await pause.Content.ReadFromJsonAsync<SessionDto>();
    paused!.Status.Should().Be("Paused");

    var stop = await client.PostAsync($"/api/sessions/{session.Id}/stop", null);
    var completed = await stop.Content.ReadFromJsonAsync<SessionDto>();
    completed!.Status.Should().Be("Completed");
    completed.FinishedAt.Should().NotBeNull();
  }
}