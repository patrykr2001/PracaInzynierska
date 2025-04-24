using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BackendService.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private const int BCRYPT_WORK_FACTOR = 12;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<User?> GetUserByIdAsync(string id)
    {
        if (int.TryParse(id, out int userId))
        {
            return await _context.Users.FindAsync(userId);
        }
        return null;
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public Task<bool> ValidatePasswordAsync(User user, string password)
    {
        try
        {
            return Task.FromResult(BCrypt.Net.BCrypt.Verify(password, user.PasswordHash, true));
        }
        catch (Exception)
        {
            return Task.FromResult(false);
        }
    }

    public async Task UpdatePasswordAsync(User user, string newPassword)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, BCRYPT_WORK_FACTOR);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public Task<string> GenerateJwtTokenAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Task.FromResult(tokenHandler.WriteToken(token));
    }

    public async Task<(User user, string token)> LoginAsync(LoginDto loginDto)
    {
        var user = await GetUserByUsernameAsync(loginDto.Username);
        if (user == null)
        {
            throw new Exception("Nieprawidłowa nazwa użytkownika lub hasło");
        }

        var isPasswordValid = await ValidatePasswordAsync(user, loginDto.Password);
        if (!isPasswordValid)
        {
            throw new Exception("Nieprawidłowa nazwa użytkownika lub hasło");
        }

        var token = await GenerateJwtTokenAsync(user);
        return (user, token);
    }

    public async Task<(User user, string token)> RegisterAsync(RegisterDto registerDto)
    {
        // Sprawdź, czy nazwa użytkownika jest dostępna
        var existingUsername = await GetUserByUsernameAsync(registerDto.Username);
        if (existingUsername != null)
        {
            throw new Exception("Nazwa użytkownika jest już zajęta");
        }

        // Sprawdź, czy email jest dostępny
        var existingEmail = await GetUserByEmailAsync(registerDto.Email);
        if (existingEmail != null)
        {
            throw new Exception("Email jest już zajęty");
        }

        // Utwórz nowego użytkownika
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password, BCRYPT_WORK_FACTOR),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = await GenerateJwtTokenAsync(user);
        return (user, token);
    }
}