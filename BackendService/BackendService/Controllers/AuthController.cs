using BackendService.Interfaces;
using BackendService.Models.DTOs;
using BackendService.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            try
            {
                var (user, token) = await _authService.RegisterAsync(registerDto);
                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            try
            {
                var (user, token) = await _authService.LoginAsync(loginDto);
                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 