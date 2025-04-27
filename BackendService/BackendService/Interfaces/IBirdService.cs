using BackendService.Models;
using BackendService.Models.DTOs;

namespace BackendService.Interfaces
{
    public interface IBirdService
    {
        Task<IEnumerable<Bird>> GetAllBirdsAsync();
        Task<IEnumerable<Bird>> GetUnverifiedBirdsAsync();
        Task<Bird?> GetBirdByIdAsync(int id);
        Task<Bird> CreateBirdAsync(CreateBirdDto createBirdDto);
        Task UpdateBirdAsync(int id, UpdateBirdDto updateBirdDto);
        Task DeleteBirdAsync(int id);
        Task<IEnumerable<Bird>> SearchBirdsAsync(string searchTerm);
    }
} 