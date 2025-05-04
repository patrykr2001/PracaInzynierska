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
} 