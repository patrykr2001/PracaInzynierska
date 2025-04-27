using BackendService.Models;
using BackendService.Models.DTOs;

namespace BackendService.Services
{
    public interface IBirdService
    {
        Task<IEnumerable<Bird>> GetAllBirdsAsync();
        Task<Bird?> GetBirdByIdAsync(int id);
        Task<Bird> CreateBirdAsync(CreateBirdDto createBirdDto);
        Task UpdateBirdAsync(int id, UpdateBirdDto updateBirdDto);
        Task DeleteBirdAsync(int id);
        Task<IEnumerable<Bird>> SearchBirdsAsync(string searchTerm);
    }
} 