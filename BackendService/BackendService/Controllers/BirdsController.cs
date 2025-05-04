using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using BackendService.Services;
using BackendService.Constants;
using System.Security.Claims;

namespace BackendService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BirdsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IBirdService _birdService;

        public BirdsController(ApplicationDbContext context, IBirdService birdService)
        {
            _context = context;
            _birdService = birdService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<Bird>>> GetBirds([FromQuery] PaginationParams paginationParams)
        {
            var birds = await _birdService.GetAllBirdsAsync(paginationParams);
            return Ok(birds);
        }

        [HttpGet("all")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<ActionResult<PaginatedResponse<Bird>>> GetAllBirds([FromQuery] PaginationParams paginationParams)
        {
            var query = _context.Birds.AsQueryable();
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            var response = new PaginatedResponse<Bird>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)paginationParams.PageSize),
                HasPreviousPage = paginationParams.PageNumber > 1,
                HasNextPage = paginationParams.PageNumber < (int)Math.Ceiling(totalCount / (double)paginationParams.PageSize)
            };

            return Ok(response);
        }

        [HttpGet("unverified")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<ActionResult<PaginatedResponse<Bird>>> GetUnverifiedBirds([FromQuery] PaginationParams paginationParams)
        {
            var birds = await _birdService.GetUnverifiedBirdsAsync(paginationParams);
            return Ok(birds);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Bird>> GetBird(int id)
        {
            var bird = await _birdService.GetBirdByIdAsync(id);
            if (bird == null)
            {
                return NotFound();
            }
            return Ok(bird);
        }

        [HttpPost]
        public async Task<ActionResult<Bird>> CreateBird([FromBody] CreateBirdDto birdDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bird = await _birdService.CreateBirdAsync(birdDto, userId);
            return CreatedAtAction(nameof(GetBird), new { id = bird.Id }, bird);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<IActionResult> UpdateBird(int id, [FromBody] UpdateBirdDto birdDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                return NotFound();
            }

            if (bird.UserId != userId && !User.IsInRole(AuthorizationConstants.AdminRole))
            {
                return Forbid();
            }

            await _birdService.UpdateBirdAsync(id, birdDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<IActionResult> DeleteBird(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                return NotFound();
            }

            if (bird.UserId != userId && !User.IsInRole(AuthorizationConstants.AdminRole))
            {
                return Forbid();
            }

            await _birdService.DeleteBirdAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<IActionResult> VerifyBird(int id)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                return NotFound();
            }

            await _birdService.VerifyBirdAsync(id);
            return NoContent();
        }
    }
} 