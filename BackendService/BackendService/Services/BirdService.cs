using BackendService.Data;
using BackendService.Interfaces;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BackendService.Services
{
    public class BirdService : IBirdService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadFolder;

        public BirdService(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;

            // Upewnij się, że katalog wwwroot istnieje
            var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            if (!Directory.Exists(wwwrootPath))
            {
                Directory.CreateDirectory(wwwrootPath);
            }

            _uploadFolder = Path.Combine(wwwrootPath, "uploads", "birds");
            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
        }

        public async Task<PaginatedResponse<Bird>> GetAllBirdsAsync(PaginationParams paginationParams)
        {
            var query = _context.Birds.Where(b => b.IsVerified);
            return await GetPaginatedResponseAsync(query, paginationParams);
        }

        public async Task<PaginatedResponse<Bird>> GetUnverifiedBirdsAsync(PaginationParams paginationParams)
        {
            var query = _context.Birds.Where(b => !b.IsVerified);
            return await GetPaginatedResponseAsync(query, paginationParams);
        }

        public async Task<PaginatedResponse<Bird>> SearchBirdsAsync(string searchTerm, PaginationParams paginationParams)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllBirdsAsync(paginationParams);
            }

            searchTerm = searchTerm.ToLower();
            var query = _context.Birds.Where(b =>
                b.IsVerified && (
                    b.CommonName.ToLower().Contains(searchTerm) ||
                    b.ScientificName.ToLower().Contains(searchTerm) ||
                    b.Family.ToLower().Contains(searchTerm) ||
                    b.Description.ToLower().Contains(searchTerm)
                )
            );
            return await GetPaginatedResponseAsync(query, paginationParams);
        }

        public async Task<Bird?> GetBirdByIdAsync(int id)
        {
            return await _context.Birds.FindAsync(id);
        }

        public async Task<Bird> CreateBirdAsync(CreateBirdDto birdDto, string userId)
        {
            string? imageUrl = null;
            if (birdDto.Image != null)
            {
                imageUrl = await SaveImageAsync(birdDto.Image);
            }

            var bird = new Bird
            {
                CommonName = birdDto.CommonName,
                ScientificName = birdDto.ScientificName,
                Family = birdDto.Family,
                ConservationStatus = birdDto.ConservationStatus,
                Description = birdDto.Description,
                ImageUrl = imageUrl,
                IsVerified = false,
                UserId = userId
            };

            _context.Birds.Add(bird);
            await _context.SaveChangesAsync();
            return bird;
        }

        public async Task UpdateBirdAsync(int id, UpdateBirdDto birdDto)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                throw new KeyNotFoundException($"Bird with ID {id} not found");
            }

            bird.CommonName = birdDto.CommonName;
            bird.ScientificName = birdDto.ScientificName;
            bird.Family = birdDto.Family;
            bird.Order = birdDto.Order;
            bird.Genus = birdDto.Genus;
            bird.Species = birdDto.Species;
            bird.ConservationStatus = birdDto.ConservationStatus;
            bird.Description = birdDto.Description;
            bird.Habitat = birdDto.Habitat;
            bird.Diet = birdDto.Diet;
            bird.Size = birdDto.Size;
            bird.Weight = birdDto.Weight;
            bird.Wingspan = birdDto.Wingspan;
            bird.Lifespan = birdDto.Lifespan;
            bird.BreedingSeason = birdDto.BreedingSeason;

            if (birdDto.Image != null)
            {
                // Usuń stare zdjęcie jeśli istnieje
                if (!string.IsNullOrEmpty(bird.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_environment.WebRootPath, bird.ImageUrl.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

                bird.ImageUrl = await SaveImageAsync(birdDto.Image);
            }

            if (birdDto.IsVerified.HasValue)
            {
                bird.IsVerified = birdDto.IsVerified.Value;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteBirdAsync(int id)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                throw new KeyNotFoundException($"Bird with ID {id} not found");
            }

            // Usuń zdjęcie jeśli istnieje
            if (!string.IsNullOrEmpty(bird.ImageUrl))
            {
                var imagePath = Path.Combine(_environment.WebRootPath, bird.ImageUrl.TrimStart('/'));
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
            }

            _context.Birds.Remove(bird);
            await _context.SaveChangesAsync();
        }

        public async Task VerifyBirdAsync(int id)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                throw new KeyNotFoundException($"Bird with ID {id} not found");
            }

            bird.IsVerified = true;
            await _context.SaveChangesAsync();
        }

        private async Task<PaginatedResponse<Bird>> GetPaginatedResponseAsync(
            IQueryable<Bird> query,
            PaginationParams paginationParams)
        {
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PaginatedResponse<Bird>
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

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "birds");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/uploads/birds/{uniqueFileName}";
        }
    }
} 