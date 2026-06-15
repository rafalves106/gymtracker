using System.Security.Claims;
using GymTracker.Application.Workouts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.Api.Controllers;

[ApiController, Authorize, Route("api/workouts")]
public sealed class WorkoutsController(WorkoutService service) : ControllerBase
{
  private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

  [HttpGet]
  public async Task<IActionResult> GetAll(CancellationToken ct)
      => Ok(await service.GetAllAsync(UserId, ct));

  [HttpGet("today")]
  public async Task<IActionResult> GetToday(CancellationToken ct)
      => Ok(await service.GetTodayAsync(UserId, ct));

  [HttpPost]
  public async Task<IActionResult> Create(CreateWorkoutRequest req, CancellationToken ct)
      => Ok(await service.CreateAsync(UserId, req, ct));

  [HttpPut("{id:guid}/day")]
  public async Task<IActionResult> AssignDay(Guid id, AssignDayRequest req, CancellationToken ct)
  {
    await service.AssignDayAsync(UserId, id, req.Day, ct);
    return NoContent();
  }
}