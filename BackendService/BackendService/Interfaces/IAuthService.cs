using BackendService.Models;
using BackendService.Models.DTOs;

namespace BackendService.Interfaces;

public interface IAuthService
{
    Task<User?> GetUserByIdAsync(string id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> GetUserByEmailAsync(string email);
    Task<bool> ValidatePasswordAsync(User user, string password);
    Task UpdatePasswordAsync(User user, string newPassword);
    Task UpdateUserAsync(User user);
    Task<string> GenerateJwtTokenAsync(User user);
    Task<AuthResponse> LoginAsync(LoginDto loginDto);
    Task<AuthResponse> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string userId);
}