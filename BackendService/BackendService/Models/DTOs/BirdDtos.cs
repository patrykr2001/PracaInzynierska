using System.ComponentModel.DataAnnotations;

namespace BackendService.Models.DTOs
{
    public class BirdDto
    {
        [Required]
        public string CommonName { get; set; } = string.Empty;

        [Required]
        public string ScientificName { get; set; } = string.Empty;

        [Required]
        public string Family { get; set; } = string.Empty;

        [Required]
        public string ConservationStatus { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
    }

    public class CreateBirdDto : BirdDto
    {
        public IFormFile? Image { get; set; }
    }

    public class UpdateBirdDto : BirdDto
    {
        public string? Order { get; set; }
        public string? Genus { get; set; }
        public string? Species { get; set; }
        public string? Habitat { get; set; }
        public string? Diet { get; set; }
        public string? Size { get; set; }
        public double? Weight { get; set; }
        public double? Wingspan { get; set; }
        public string? Lifespan { get; set; }
        public string? BreedingSeason { get; set; }
        public IFormFile? Image { get; set; }
        public bool? IsVerified { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }

    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;

        public int PageNumber { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }
    }

    public class BirdObservationDto
    {
        public int Id { get; set; }
        public int BirdId { get; set; }
        public string BirdCommonName { get; set; } = string.Empty;
        public string BirdScientificName { get; set; } = string.Empty;
        public string? BirdImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime ObservationDate { get; set; }
        public string? Description { get; set; }
        public int? NumberOfBirds { get; set; }
        public string? WeatherConditions { get; set; }
        public string? Habitat { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new List<string>();
    }

    public class CreateBirdObservationDto
    {
        [Required]
        public int BirdId { get; set; }

        [Required]
        public string Latitude { get; set; } = string.Empty;

        [Required]
        public string Longitude { get; set; } = string.Empty;

        [Required]
        public DateTime ObservationDate { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }

        public List<IFormFile>? Images { get; set; }
    }

    public class UpdateBirdObservationDto
    {
        public string? Latitude { get; set; }

        public string? Longitude { get; set; }

        public DateTime? ObservationDate { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }

        public bool? IsVerified { get; set; }

        public List<IFormFile>? Images { get; set; }
    }

    public class DeleteObservationImageDto
    {
        [Required]
        public string ImageUrl { get; set; } = string.Empty;
    }
} 