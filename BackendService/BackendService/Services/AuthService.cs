using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using BackendService.Constants;

namespace BackendService.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private const int ACCESS_TOKEN_EXPIRATION_MINUTES = 15;
    private const int REFRESH_TOKEN_EXPIRATION_DAYS = 7;
    private const int LOCKOUT_DURATION_MINUTES = 15;

    public AuthService(
        ApplicationDbContext context,
        IConfiguration configuration,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _context = context;
        _configuration = configuration;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(string id)
    {
        return await _userManager.FindByIdAsync(id);
    }

    public async Task<ApplicationUser?> GetUserByUsernameAsync(string username)
    {
        return await _userManager.FindByNameAsync(username);
    }

    public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public async Task<bool> ValidatePasswordAsync(ApplicationUser user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task UpdatePasswordAsync(ApplicationUser user, string newPassword)
    {
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    public async Task UpdateUserAsync(ApplicationUser user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Nieprawidłowy email lub hasło.");
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            var lockoutEnd = await _userManager.GetLockoutEndDateAsync(user);
            throw new InvalidOperationException($"Konto jest zablokowane do {lockoutEnd}.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                throw new InvalidOperationException($"Konto zostało zablokowane na {LOCKOUT_DURATION_MINUTES} minut z powodu zbyt wielu nieudanych prób logowania.");
            }
            throw new InvalidOperationException("Nieprawidłowy email lub hasło.");
        }

        // Reset failed attempts on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateAccessToken(user, roles);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(REFRESH_TOKEN_EXPIRATION_DAYS);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Roles = roles.ToArray()
            }
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        if (registerDto.Password != registerDto.ConfirmPassword)
        {
            throw new InvalidOperationException("Hasła nie są identyczne.");
        }

        var passwordValidator = new PasswordValidator<ApplicationUser>();
        var result = await passwordValidator.ValidateAsync(_userManager, null!, registerDto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        var user = new ApplicationUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true // Wymagane potwierdzenie emaila w przyszłości
        };

        var createResult = await _userManager.CreateAsync(user, registerDto.Password);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join(", ", createResult.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, AuthorizationConstants.UserRole);

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateAccessToken(user, roles);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(REFRESH_TOKEN_EXPIRATION_DAYS);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Roles = new[] { AuthorizationConstants.UserRole }
            }
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Nieprawidłowy token odświeżający.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var newToken = GenerateAccessToken(user, roles);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(REFRESH_TOKEN_EXPIRATION_DAYS);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            AccessToken = newToken,
            RefreshToken = newRefreshToken,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Roles = roles.ToArray()
            }
        };
    }

    public async Task RevokeRefreshTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("Nie znaleziono użytkownika.");
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        await _userManager.UpdateAsync(user);
    }

    private string GenerateAccessToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Email, user.Email!)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(ACCESS_TOKEN_EXPIRATION_MINUTES);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}