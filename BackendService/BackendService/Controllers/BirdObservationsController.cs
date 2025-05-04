using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendService.Interfaces;
using BackendService.Models.DTOs;
using BackendService.Constants;
using System.Security.Claims;

namespace BackendService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BirdObservationsController : ControllerBase
    {
        private readonly IBirdObservationService _observationService;

        public BirdObservationsController(IBirdObservationService observationService)
        {
            _observationService = observationService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<BirdObservationDto>>> GetObservations([FromQuery] PaginationParams paginationParams)
        {
            var observations = await _observationService.GetAllObservationsAsync(paginationParams);
            return Ok(observations);
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<PaginatedResponse<BirdObservationDto>>> GetUserObservations([FromQuery] PaginationParams paginationParams)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var observations = await _observationService.GetUserObservationsAsync(userId, paginationParams);
            return Ok(observations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BirdObservationDto>> GetObservation(int id)
        {
            var observation = await _observationService.GetObservationByIdAsync(id);
            if (observation == null)
            {
                return NotFound();
            }
            return Ok(observation);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BirdObservationDto>> CreateObservation([FromBody] CreateBirdObservationDto observationDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var observation = await _observationService.CreateObservationAsync(observationDto, userId);
            return CreatedAtAction(nameof(GetObservation), new { id = observation.Id }, observation);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateObservation(int id, [FromBody] UpdateBirdObservationDto observationDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            try
            {
                await _observationService.UpdateObservationAsync(id, observationDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteObservation(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            try
            {
                await _observationService.DeleteObservationAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = AuthorizationConstants.AdminRole)]
        public async Task<IActionResult> VerifyObservation(int id)
        {
            try
            {
                await _observationService.VerifyObservationAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
} 