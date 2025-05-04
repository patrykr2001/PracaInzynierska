using BackendService.Models;
using BackendService.Models.DTOs;

namespace BackendService.Interfaces;

public interface IAuthService
{
    Task<ApplicationUser?> GetUserByIdAsync(string id);
    Task<ApplicationUser?> GetUserByUsernameAsync(string username);
    Task<ApplicationUser?> GetUserByEmailAsync(string email);
    Task<bool> ValidatePasswordAsync(ApplicationUser user, string password);
    Task UpdatePasswordAsync(ApplicationUser user, string newPassword);
    Task UpdateUserAsync(ApplicationUser user);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string userId);
}