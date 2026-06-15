using GymTracker.Application.Auth;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.Api.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(AuthService auth) : ControllerBase
{
  public record RegisterRequest(string Username, string Email, string Password);
  public record LoginRequest(string UsernameOrEmail, string Password);

  [HttpPost("register")]
  public async Task<IActionResult> Register(RegisterRequest req, CancellationToken ct)
      => Ok(new { token = await auth.RegisterAsync(req.Username, req.Email, req.Password, ct) });

  [HttpPost("login")]
  public async Task<IActionResult> Login(LoginRequest req, CancellationToken ct)
      => Ok(new { token = await auth.LoginAsync(req.UsernameOrEmail, req.Password, ct) });
}