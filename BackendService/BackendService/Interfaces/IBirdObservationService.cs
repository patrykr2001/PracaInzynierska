using BackendService.Models.DTOs;

namespace BackendService.Interfaces
{
    public interface IBirdObservationService
    {
        Task<PaginatedResponse<BirdObservationDto>> GetAllObservationsAsync(PaginationParams paginationParams);
        Task<PaginatedResponse<BirdObservationDto>> GetUserObservationsAsync(string userId, PaginationParams paginationParams);
        Task<BirdObservationDto?> GetObservationByIdAsync(int id);
        Task<BirdObservationDto> CreateObservationAsync(CreateBirdObservationDto observationDto, string userId);
        Task UpdateObservationAsync(int id, UpdateBirdObservationDto observationDto);
        Task DeleteObservationAsync(int id);
        Task VerifyObservationAsync(int id);
        Task DeleteObservationImageAsync(int id, string imageUrl);
        Task<List<object>> GetObservationWeeksAsync(int? year = null);
    }
} 