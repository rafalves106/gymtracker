using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace GymTracker.IntegrationTests;

public class AuthTests(GymApiFactory factory) : IClassFixture<GymApiFactory>
{
  private readonly HttpClient _client = factory.CreateClient();

  private record TokenResponse(string Token);

  [Fact]
  public async Task Register_ComDadosValidos_RetornaToken()
  {
    var res = await _client.PostAsJsonAsync("/api/auth/register", new
    {
      username = "joao_register",
      email = "joao_register@test.com",
      password = "Senha@123"
    });

    res.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await res.Content.ReadFromJsonAsync<TokenResponse>();
    body!.Token.Should().NotBeNullOrEmpty();
  }

  [Fact]
  public async Task Login_AposRegistro_RetornaToken()
  {
    await _client.PostAsJsonAsync("/api/auth/register", new
    {
      username = "maria_login",
      email = "maria_login@test.com",
      password = "Senha@123"
    });

    var res = await _client.PostAsJsonAsync("/api/auth/login", new
    {
      usernameOrEmail = "maria_login",
      password = "Senha@123"
    });

    res.StatusCode.Should().Be(HttpStatusCode.OK);
    var body = await res.Content.ReadFromJsonAsync<TokenResponse>();
    body!.Token.Should().NotBeNullOrEmpty();
  }

  [Fact]
  public async Task Login_ComSenhaErrada_RetornaUnauthorized()
  {
    await _client.PostAsJsonAsync("/api/auth/register", new
    {
      username = "pedro_wrong",
      email = "pedro_wrong@test.com",
      password = "Senha@123"
    });

    var res = await _client.PostAsJsonAsync("/api/auth/login", new
    {
      usernameOrEmail = "pedro_wrong",
      password = "SenhaErrada"
    });

    res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
  }

  [Fact]
  public async Task Workouts_SemToken_RetornaUnauthorized()
  {
    var res = await _client.GetAsync("/api/workouts");
    res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
  }
}