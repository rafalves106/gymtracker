using GymTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace GymTracker.IntegrationTests;

public sealed class GymApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
  private readonly PostgreSqlContainer _db = new PostgreSqlBuilder("postgres:18")
    .WithDatabase("gymtracker_test")
    .WithUsername("test")
    .WithPassword("test")
    .Build();

  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    // Injeta as configs necessárias para a API subir nos testes
    builder.UseSetting("ConnectionStrings:Default", _db.GetConnectionString());
    builder.UseSetting("Jwt:Key", "chave_de_teste_com_no_minimo_32_caracteres_aqui!!");
    builder.UseSetting("Jwt:Issuer", "gym-tracker-test");
    builder.UseSetting("Jwt:Audience", "gym-tracker-test");
    // Master vazio para o seed não rodar nos testes (criamos usuários nos próprios testes)
    builder.UseSetting("MASTER_USERNAME", "");
    builder.UseSetting("MASTER_PASSWORD", "");
  }

  public async Task InitializeAsync()
  {
    await _db.StartAsync();

    // Aplica as migrations no banco de teste
    using var scope = Services.CreateScope();
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await ctx.Database.MigrateAsync();
  }

  public new async Task DisposeAsync() => await _db.DisposeAsync();
}