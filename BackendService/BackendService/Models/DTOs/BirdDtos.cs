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
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public DateTime ObservationDate { get; set; }
        public string? Description { get; set; }
        public int? NumberOfBirds { get; set; }
        public string? WeatherConditions { get; set; }
        public string? Habitat { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }

    public class CreateBirdObservationDto
    {
        [Required]
        public int BirdId { get; set; }

        [Required]
        [Range(-90, 90)]
        public decimal Latitude { get; set; }

        [Required]
        [Range(-180, 180)]
        public decimal Longitude { get; set; }

        [Required]
        public DateTime ObservationDate { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }
    }

    public class UpdateBirdObservationDto
    {
        [Range(-90, 90)]
        public decimal? Latitude { get; set; }

        [Range(-180, 180)]
        public decimal? Longitude { get; set; }

        public DateTime? ObservationDate { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }

        public bool? IsVerified { get; set; }
    }
} 