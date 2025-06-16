using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace BackendService.Services
{
    public class BirdObservationService : IBirdObservationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadFolder;

        public BirdObservationService(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;

            // Upewnij się, że katalog wwwroot istnieje
            var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            if (!Directory.Exists(wwwrootPath))
            {
                Directory.CreateDirectory(wwwrootPath);
            }

            _uploadFolder = Path.Combine(wwwrootPath, "uploads", "observations");
            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
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

        private (bool isValid, double? value) ValidateAndParseCoordinate(string coordinate, bool isLatitude)
        {
            coordinate = coordinate.Replace(".", ",");
            
            if (string.IsNullOrWhiteSpace(coordinate))
                return (false, null);

            if (!double.TryParse(coordinate, out double value))
                return (false, null);

            if (isLatitude)
            {
                if (value < -90 || value > 90)
                    return (false, null);
            }
            else
            {
                if (value < -180 || value > 180)
                    return (false, null);
            }

            // Zaokrąglenie do 4 miejsc po przecinku
            value = Math.Round(value, 4);
            return (true, value);
        }

        public async Task<BirdObservationDto> CreateObservationAsync(CreateBirdObservationDto observationDto, string userId)
        {
            // Sprawdź czy ptak istnieje
            var bird = await _context.Birds.FindAsync(observationDto.BirdId);
            if (bird == null)
                throw new ArgumentException($"Ptak o ID {observationDto.BirdId} nie istnieje.");

            // Sprawdź czy użytkownik istnieje
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ArgumentException($"Użytkownik o ID {userId} nie istnieje.");

            var (isLatitudeValid, latitude) = ValidateAndParseCoordinate(observationDto.Latitude, true);
            if (!isLatitudeValid)
                throw new ArgumentException("Nieprawidłowa szerokość geograficzna. Wartość musi być liczbą z zakresu -90 do 90.");

            var (isLongitudeValid, longitude) = ValidateAndParseCoordinate(observationDto.Longitude, false);
            if (!isLongitudeValid)
                throw new ArgumentException("Nieprawidłowa długość geograficzna. Wartość musi być liczbą z zakresu -180 do 180.");

            var observation = new BirdObservation
            {
                BirdId = observationDto.BirdId,
                UserId = userId,
                Latitude = latitude.Value,
                Longitude = longitude.Value,
                ObservationDate = observationDto.ObservationDate,
                Description = observationDto.Description,
                NumberOfBirds = observationDto.NumberOfBirds,
                WeatherConditions = observationDto.WeatherConditions,
                Habitat = observationDto.Habitat,
                IsVerified = false
            };

            if (observationDto.Images != null && observationDto.Images.Any())
            {
                foreach (var image in observationDto.Images)
                {
                    var imageUrl = await SaveImageAsync(image);
                    observation.ImageUrls.Add(imageUrl);
                }
            }

            _context.BirdObservations.Add(observation);
            await _context.SaveChangesAsync();

            return await GetObservationByIdAsync(observation.Id) ?? throw new Exception("Failed to create observation");
        }

        public async Task UpdateObservationAsync(int id, UpdateBirdObservationDto observationDto)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            if (observationDto.Latitude != null)
            {
                var (isLatitudeValid, latitude) = ValidateAndParseCoordinate(observationDto.Latitude, true);
                if (!isLatitudeValid)
                    throw new ArgumentException("Nieprawidłowa szerokość geograficzna. Wartość musi być liczbą z zakresu -90 do 90.");
                observation.Latitude = latitude.Value;
            }

            if (observationDto.Longitude != null)
            {
                var (isLongitudeValid, longitude) = ValidateAndParseCoordinate(observationDto.Longitude, false);
                if (!isLongitudeValid)
                    throw new ArgumentException("Nieprawidłowa długość geograficzna. Wartość musi być liczbą z zakresu -180 do 180.");
                observation.Longitude = longitude.Value;
            }

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

            if (observationDto.Images != null && observationDto.Images.Any())
            {
                foreach (var image in observationDto.Images)
                {
                    var imageUrl = await SaveImageAsync(image);
                    observation.ImageUrls.Add(imageUrl);
                }
            }

            observation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteObservationAsync(int id)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            // Usuń wszystkie obrazy
            foreach (var imageUrl in observation.ImageUrls)
            {
                var imagePath = Path.Combine(_environment.WebRootPath, imageUrl.TrimStart('/'));
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
            }

            _context.BirdObservations.Remove(observation);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteObservationImageAsync(int id, string imageUrl)
        {
            var observation = await _context.BirdObservations.FindAsync(id);
            if (observation == null)
                throw new KeyNotFoundException($"Observation with ID {id} not found");

            if (observation.ImageUrls.Contains(imageUrl))
            {
                observation.ImageUrls.Remove(imageUrl);
                var imagePath = Path.Combine(_environment.WebRootPath, imageUrl.TrimStart('/'));
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
                await _context.SaveChangesAsync();
            }
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
                Username = observation.User.UserName ?? string.Empty,
                ImageUrls = observation.ImageUrls
            };
        }

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
            var filePath = Path.Combine(_uploadFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/uploads/observations/{uniqueFileName}";
        }

        public async Task<List<object>> GetObservationWeeksAsync(int? year = null)
        {
            var observations = await _context.BirdObservations.ToListAsync();
            if (observations.Count == 0) return new List<object>();
            if (year.HasValue)
            {
                observations = observations.Where(o => o.ObservationDate.Year == year.Value).ToList();
            }
            if (observations.Count == 0) return new List<object>();
            var dates = observations.Select(o => o.ObservationDate.Date).ToList();
            var minDate = dates.Min();
            var maxDate = dates.Max();
            var startOfWeek = new Func<DateTime, DateTime>(d => d.AddDays(-(d.DayOfWeek == DayOfWeek.Sunday ? 6 : ((int)d.DayOfWeek - 1))).Date);
            var current = startOfWeek(minDate);
            var end = startOfWeek(maxDate);
            var result = new List<object>();
            while (current <= end)
            {
                var weekStart = current;
                var weekEnd = current.AddDays(6);
                var count = observations.Count(o => o.ObservationDate.Date >= weekStart && o.ObservationDate.Date <= weekEnd);
                if (count > 0)
                {
                    result.Add(new {
                        start = weekStart,
                        end = weekEnd,
                        count
                    });
                }
                current = current.AddDays(7);
            }
            return result;
        }
    }
} 