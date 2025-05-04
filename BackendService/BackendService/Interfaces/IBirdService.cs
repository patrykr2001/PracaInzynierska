using BackendService.Models;
using BackendService.Models.DTOs;

namespace BackendService.Interfaces
{
    public interface IBirdService
    {
        Task<PaginatedResponse<Bird>> GetAllBirdsAsync(PaginationParams paginationParams);
        Task<PaginatedResponse<Bird>> GetUnverifiedBirdsAsync(PaginationParams paginationParams);
        Task<PaginatedResponse<Bird>> SearchBirdsAsync(string searchTerm, PaginationParams paginationParams);
        Task<Bird?> GetBirdByIdAsync(int id);
        Task<Bird> CreateBirdAsync(CreateBirdDto birdDto, string userId);
        Task UpdateBirdAsync(int id, UpdateBirdDto birdDto);
        Task DeleteBirdAsync(int id);
        Task VerifyBirdAsync(int id);
    }
} 