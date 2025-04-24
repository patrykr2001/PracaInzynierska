using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendService.Models;
using BackendService.Services;
using System.Security.Claims;
using BackendService.Interfaces;
namespace BackendService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserSettingsController : ControllerBase
{
    private readonly IAuthService _authService;

    public UserSettingsController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetUserSettings()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            email = user.Email
        });
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateUserSettings([FromBody] UpdateUserSettingsDto updateDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        // Sprawdź, czy nowa nazwa użytkownika nie jest już zajęta
        if (updateDto.Username != user.Username)
        {
            var existingUser = await _authService.GetUserByUsernameAsync(updateDto.Username);
            if (existingUser != null)
            {
                return BadRequest("Nazwa użytkownika jest już zajęta");
            }
        }

        // Sprawdź, czy nowy email nie jest już zajęty
        if (updateDto.Email != user.Email)
        {
            var existingUser = await _authService.GetUserByEmailAsync(updateDto.Email);
            if (existingUser != null)
            {
                return BadRequest("Email jest już zajęty");
            }
        }

        // Jeśli zmieniamy hasło, sprawdź aktualne hasło
        if (!string.IsNullOrEmpty(updateDto.NewPassword))
        {
            if (string.IsNullOrEmpty(updateDto.CurrentPassword))
            {
                return BadRequest("Aktualne hasło jest wymagane przy zmianie hasła");
            }

            if (updateDto.NewPassword != updateDto.ConfirmPassword)
            {
                return BadRequest("Nowe hasła nie są identyczne");
            }

            var isPasswordValid = await _authService.ValidatePasswordAsync(user, updateDto.CurrentPassword);
            if (!isPasswordValid)
            {
                return BadRequest("Nieprawidłowe aktualne hasło");
            }
        }

        // Aktualizuj dane użytkownika
        user.Username = updateDto.Username;
        user.Email = updateDto.Email;

        if (!string.IsNullOrEmpty(updateDto.NewPassword))
        {
            await _authService.UpdatePasswordAsync(user, updateDto.NewPassword);
        }

        await _authService.UpdateUserAsync(user);

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            email = user.Email
        });
    }
} 