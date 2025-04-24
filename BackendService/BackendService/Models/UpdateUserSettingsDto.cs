using System.ComponentModel.DataAnnotations;

namespace BackendService.Models;

public class UpdateUserSettingsDto
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? CurrentPassword { get; set; }

    [StringLength(100, MinimumLength = 8)]
    public string? NewPassword { get; set; }

    public string? ConfirmPassword { get; set; }
} 