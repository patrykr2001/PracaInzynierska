using BackendService.Data;
using BackendService.Models;
using BackendService.Models.DTOs;
using Microsoft.EntityFrameworkCore;

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

        public async Task<IEnumerable<Bird>> GetAllBirdsAsync()
        {
            return await _context.Birds.ToListAsync();
        }

        public async Task<Bird?> GetBirdByIdAsync(int id)
        {
            return await _context.Birds.FindAsync(id);
        }

        public async Task<Bird> CreateBirdAsync(CreateBirdDto createBirdDto)
        {
            var bird = new Bird
            {
                ScientificName = createBirdDto.ScientificName,
                CommonName = createBirdDto.CommonName,
                Family = createBirdDto.Family,
                Order = createBirdDto.Order,
                ConservationStatus = createBirdDto.ConservationStatus,
                Description = createBirdDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (createBirdDto.File != null)
            {
                bird.ImageUrl = await SaveImageAsync(createBirdDto.File);
            }

            _context.Birds.Add(bird);
            await _context.SaveChangesAsync();

            return bird;
        }

        public async Task UpdateBirdAsync(int id, UpdateBirdDto updateBirdDto)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                throw new Exception("Ptak nie został znaleziony");
            }

            if (updateBirdDto.ScientificName != null)
                bird.ScientificName = updateBirdDto.ScientificName;
            if (updateBirdDto.CommonName != null)
                bird.CommonName = updateBirdDto.CommonName;
            if (updateBirdDto.Family != null)
                bird.Family = updateBirdDto.Family;
            if (updateBirdDto.Order != null)
                bird.Order = updateBirdDto.Order;
            if (updateBirdDto.ConservationStatus != null)
                bird.ConservationStatus = updateBirdDto.ConservationStatus;
            if (updateBirdDto.Description != null)
                bird.Description = updateBirdDto.Description;

            if (updateBirdDto.File != null)
            {
                // Usuń stare zdjęcie jeśli istnieje
                if (!string.IsNullOrEmpty(bird.ImageUrl))
                {
                    var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", bird.ImageUrl.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

                bird.ImageUrl = await SaveImageAsync(updateBirdDto.File);
            }

            bird.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBirdAsync(int id)
        {
            var bird = await _context.Birds.FindAsync(id);
            if (bird == null)
            {
                throw new Exception("Ptak nie został znaleziony");
            }

            // Usuń zdjęcie jeśli istnieje
            if (!string.IsNullOrEmpty(bird.ImageUrl))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", bird.ImageUrl.TrimStart('/'));
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
            }

            _context.Birds.Remove(bird);
            await _context.SaveChangesAsync();
        }

        private async Task<string> SaveImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("Nie wybrano pliku");

            // Sprawdź typ pliku
            if (!file.ContentType.StartsWith("image/"))
                throw new Exception("Nieprawidłowy typ pliku. Dozwolone są tylko obrazy.");

            // Sprawdź rozmiar pliku (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                throw new Exception("Plik jest za duży. Maksymalny rozmiar to 5MB");

            // Generuj unikalną nazwę pliku
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadFolder, fileName);

            // Zapisz plik
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Zwróć ścieżkę względną do pliku
            return $"/uploads/birds/{fileName}";
        }
    }
} 