using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BackendService.Services
{
    public class BirdObservationService : IBirdObservationService
    {
        private readonly ApplicationDbContext _context;

        public BirdObservationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResponse<BirdObservationDto>> GetAllObservationsAsync(PaginationParams paginationParams)
        {
            var query = _context.BirdObservations
                .Include(o => o.Bird)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt);

            return await GetPaginatedResponseAsync(query, paginationParams);
        }

        public async Task<PaginatedResponse<BirdObservationDto>> GetUserObservationsAsync(string userId, PaginationParams paginationParams)
        {
            var query = _context.BirdObservations
                .Include(o => o.Bird)
                .Include(o => o.User)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt);

            return await GetPaginatedResponseAsync(query, paginationParams);
        }

        public async Task<BirdObservationDto?> GetObservationByIdAsync(int id)
        {
            var observation = await _context.BirdObservations
                .Include(o => o.Bird)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (observation == null)
                return null;

            return MapToDto(observation);
        }

        public async Task<BirdObservationDto> CreateObservationAsync(CreateBirdObservationDto observationDto, string userId)
        {
            var observation = new BirdObservation
            {
                BirdId = observationDto.BirdId,
                UserId = userId,
                Latitude = observationDto.Latitude,
                Longitude = observationDto.Longitude,
                ObservationDate = observationDto.ObservationDate,
                Description = observationDto.Description,
                NumberOfBirds = observationDto.NumberOfBirds,
                WeatherConditions = observationDto.WeatherConditions,
                Habitat = observationDto.Habitat,
                IsVerified = false
            };

            _context.BirdObservations.Add(observation);
            await _context.SaveChangesAsync();

            return await GetObservationByIdAsync(observation.Id) ?? throw new Exception("Failed to create observation");
        }

        public async Task UpdateObservationAsync(int id, UpdateBirdObservationDto observationDto)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            if (observationDto.Latitude.HasValue)
                observation.Latitude = observationDto.Latitude.Value;
            if (observationDto.Longitude.HasValue)
                observation.Longitude = observationDto.Longitude.Value;
            if (observationDto.ObservationDate.HasValue)
                observation.ObservationDate = observationDto.ObservationDate.Value;
            if (observationDto.Description != null)
                observation.Description = observationDto.Description;
            if (observationDto.NumberOfBirds.HasValue)
                observation.NumberOfBirds = observationDto.NumberOfBirds;
            if (observationDto.WeatherConditions != null)
                observation.WeatherConditions = observationDto.WeatherConditions;
            if (observationDto.Habitat != null)
                observation.Habitat = observationDto.Habitat;
            if (observationDto.IsVerified.HasValue)
                observation.IsVerified = observationDto.IsVerified.Value;

            observation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteObservationAsync(int id)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            _context.BirdObservations.Remove(observation);
            await _context.SaveChangesAsync();
        }

        public async Task VerifyObservationAsync(int id)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            observation.IsVerified = true;
            observation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task<PaginatedResponse<BirdObservationDto>> GetPaginatedResponseAsync(
            IQueryable<BirdObservation> query,
            PaginationParams paginationParams)
        {
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(o => MapToDto(o))
                .ToListAsync();

            return new PaginatedResponse<BirdObservationDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)paginationParams.PageSize),
                HasPreviousPage = paginationParams.PageNumber > 1,
                HasNextPage = paginationParams.PageNumber < (int)Math.Ceiling(totalCount / (double)paginationParams.PageSize)
            };
        }

        private static BirdObservationDto MapToDto(BirdObservation observation)
        {
            return new BirdObservationDto
            {
                Id = observation.Id,
                BirdId = observation.BirdId,
                BirdCommonName = observation.Bird.CommonName,
                BirdScientificName = observation.Bird.ScientificName,
                BirdImageUrl = observation.Bird.ImageUrl,
                Latitude = observation.Latitude,
                Longitude = observation.Longitude,
                ObservationDate = observation.ObservationDate,
                Description = observation.Description,
                NumberOfBirds = observation.NumberOfBirds,
                WeatherConditions = observation.WeatherConditions,
                Habitat = observation.Habitat,
                IsVerified = observation.IsVerified,
                CreatedAt = observation.CreatedAt,
                UserId = observation.UserId,
                Username = observation.User.UserName ?? string.Empty
            };
        }
    }
} 