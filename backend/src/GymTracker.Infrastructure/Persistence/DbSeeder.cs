using GymTracker.Application.Auth;
using GymTracker.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace GymTracker.Infrastructure.Persistence;

public static class DbSeeder
{
  public static async Task SeedMasterAsync(AppDbContext db, IPasswordHasher hasher, IConfiguration cfg)
  {
    var username = cfg["MASTER_USERNAME"];
    var email = cfg["MASTER_EMAIL"];
    var password = cfg["MASTER_PASSWORD"]; // vem do .env, nunca do código

    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
      return;

    if (await db.Users.AnyAsync(u => u.Username == username)) return;

    var master = new User(username, email!, hasher.Hash(password), isMaster: true);
    db.Users.Add(master);
    await db.SaveChangesAsync();
  }
}