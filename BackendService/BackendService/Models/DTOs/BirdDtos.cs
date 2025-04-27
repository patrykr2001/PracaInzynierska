using System.ComponentModel.DataAnnotations;

namespace BackendService.Models.DTOs
{
    public class CreateBirdDto
    {
        [Required]
        [StringLength(100)]
        public required string ScientificName { get; set; }

        [Required]
        [StringLength(100)]
        public required string CommonName { get; set; }

        [StringLength(100)]
        public string? Family { get; set; }

        [StringLength(100)]
        public string? Order { get; set; }

        [StringLength(50)]
        public string? ConservationStatus { get; set; }

        public string? Description { get; set; }

        public IFormFile? File { get; set; }

        public bool IsVerified { get; set; } = false;
    }

    public class UpdateBirdDto
    {
        [StringLength(100)]
        public string? ScientificName { get; set; }

        [StringLength(100)]
        public string? CommonName { get; set; }

        [StringLength(100)]
        public string? Family { get; set; }

        [StringLength(100)]
        public string? Order { get; set; }

        [StringLength(50)]
        public string? ConservationStatus { get; set; }

        public string? Description { get; set; }

        public IFormFile? File { get; set; }

        public bool? IsVerified { get; set; }
    }
} 