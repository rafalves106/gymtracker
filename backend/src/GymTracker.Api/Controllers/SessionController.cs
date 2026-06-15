using System.Security.Claims;
using GymTracker.Application.Sessions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymTracker.Api.Controllers;

[ApiController, Authorize, Route("api/sessions")]
public sealed class SessionsController(SessionService service) : ControllerBase
{
  private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

  [HttpPost("start/{workoutId:guid}")]
  public async Task<IActionResult> Start(Guid workoutId, CancellationToken ct)
      => Ok(await service.StartAsync(UserId, workoutId, ct));

  [HttpPost("{id:guid}/pause")]
  public Task<IActionResult> Pause(Guid id, CancellationToken ct) => Do(id, service.PauseAsync, ct);

  [HttpPost("{id:guid}/resume")]
  public Task<IActionResult> Resume(Guid id, CancellationToken ct) => Do(id, service.ResumeAsync, ct);

  [HttpPost("{id:guid}/stop")]
  public Task<IActionResult> Stop(Guid id, CancellationToken ct) => Do(id, service.CompleteAsync, ct);

  [HttpPost("{id:guid}/cancel")]
  public Task<IActionResult> Cancel(Guid id, CancellationToken ct) => Do(id, service.CancelAsync, ct);

  [HttpPost("{id:guid}/exercise/{exId:guid}/increment")]
  public async Task<IActionResult> Inc(Guid id, Guid exId, CancellationToken ct)
      => Ok(await service.IncrementAsync(UserId, id, exId, ct));

  [HttpPost("{id:guid}/exercise/{exId:guid}/decrement")]
  public async Task<IActionResult> Dec(Guid id, Guid exId, CancellationToken ct)
      => Ok(await service.DecrementAsync(UserId, id, exId, ct));

  private async Task<IActionResult> Do(
      Guid id,
      Func<Guid, Guid, CancellationToken, Task<SessionDto>> fn,
      CancellationToken ct)
      => Ok(await fn(UserId, id, ct));
}