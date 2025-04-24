using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendService.Data;
using BackendService.Models;

namespace BackendService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserManagementController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserManagementController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Użytkownik został usunięty" });
    }
} 