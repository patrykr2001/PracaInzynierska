using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using BackendService.Authorization;

namespace BackendService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BirdsController : ControllerBase
    {
        private readonly IBirdService _birdService;

        public BirdsController(IBirdService birdService)
        {
            _birdService = birdService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bird>>> GetBirds()
        {
            var birds = await _birdService.GetAllBirdsAsync();
            return Ok(birds);
        }

        [HttpGet("unverified")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<ActionResult<IEnumerable<Bird>>> GetUnverifiedBirds()
        {
            var birds = await _birdService.GetUnverifiedBirdsAsync();
            return Ok(birds);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Bird>>> SearchBirds([FromQuery] string searchTerm)
        {
            var birds = await _birdService.SearchBirdsAsync(searchTerm);
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

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Bird>> CreateBird([FromForm] CreateBirdDto createBirdDto)
        {
            try
            {
                var bird = await _birdService.CreateBirdAsync(createBirdDto);
                return CreatedAtAction(nameof(GetBird), new { id = bird.Id }, bird);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBird(int id, [FromForm] UpdateBirdDto updateBirdDto)
        {
            try
            {
                await _birdService.UpdateBirdAsync(id, updateBirdDto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBird(int id)
        {
            try
            {
                await _birdService.DeleteBirdAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 