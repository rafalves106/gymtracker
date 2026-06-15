using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace GymTracker.IntegrationTests;

public class WorkoutTests(GymApiFactory factory) : IClassFixture<GymApiFactory>
{
  private readonly GymApiFactory _factory = factory;

  private record TokenResponse(string Token);
  private record ExerciseDto(Guid Id, string Name, int TargetSets, int TargetReps, int RestSeconds, int Order);
  private record WorkoutDto(Guid Id, string Name, int? ScheduledDay, List<ExerciseDto> Exercises);

  // Cria um cliente já autenticado com um usuário novo
  private async Task<HttpClient> AuthenticatedClientAsync(string suffix)
  {
    var client = _factory.CreateClient();
    var reg = await client.PostAsJsonAsync("/api/auth/register", new
    {
      username = $"user_{suffix}",
      email = $"user_{suffix}@test.com",
      password = "Senha@123"
    });
    var body = await reg.Content.ReadFromJsonAsync<TokenResponse>();
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", body!.Token);
    return client;
  }

  [Fact]
  public async Task CriarTreino_RetornaTreinoComExercicios()
  {
    var client = await AuthenticatedClientAsync("create");

    var res = await client.PostAsJsonAsync("/api/workouts", new
    {
      name = "Treino A - Peito",
      exercises = new[]
        {
            new { name = "Supino reto", targetSets = 4, targetReps = 10, restSeconds = 90 },
            new { name = "Crucifixo", targetSets = 3, targetReps = 12, restSeconds = 60 }
        }
    });

    res.StatusCode.Should().Be(HttpStatusCode.OK);
    var workout = await res.Content.ReadFromJsonAsync<WorkoutDto>();
    workout!.Name.Should().Be("Treino A - Peito");
    workout.Exercises.Should().HaveCount(2);
  }

  [Fact]
  public async Task AtribuirDia_E_BuscarTreinosDeHoje()
  {
    var client = await AuthenticatedClientAsync("today");

    // Cria o treino
    var create = await client.PostAsJsonAsync("/api/workouts", new
    {
      name = "Treino de Hoje",
      exercises = new[]
        {
            new { name = "Agachamento", targetSets = 4, targetReps = 8, restSeconds = 120 }
        }
    });
    var workout = await create.Content.ReadFromJsonAsync<WorkoutDto>();

    // Atribui o treino ao dia de HOJE
    var today = (int)DateTime.UtcNow.DayOfWeek;
    var assign = await client.PutAsJsonAsync($"/api/workouts/{workout!.Id}/day", new { day = today });
    assign.StatusCode.Should().Be(HttpStatusCode.NoContent);

    // Busca os treinos de hoje → deve conter o que acabamos de agendar
    var todayRes = await client.GetFromJsonAsync<List<WorkoutDto>>("/api/workouts/today");
    todayRes.Should().ContainSingle(w => w.Id == workout.Id);
  }

  [Fact]
  public async Task ListarTreinos_RetornaApenasDoUsuarioLogado()
  {
    var clientA = await AuthenticatedClientAsync("isolated_a");
    var clientB = await AuthenticatedClientAsync("isolated_b");

    await clientA.PostAsJsonAsync("/api/workouts", new
    {
      name = "Treino do A",
      exercises = new[] { new { name = "Rosca", targetSets = 3, targetReps = 12, restSeconds = 45 } }
    });

    // B não deve ver o treino de A
    var listB = await clientB.GetFromJsonAsync<List<WorkoutDto>>("/api/workouts");
    listB.Should().BeEmpty();
  }
}