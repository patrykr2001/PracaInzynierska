using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace BackendService.Models
{
    public class BirdObservation
    {
        public int Id { get; set; }

        [Required]
        public int BirdId { get; set; }
        public Bird Bird { get; set; } = null!;

        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public DateTime ObservationDate { get; set; }

        public string? Description { get; set; }

        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<string> ImageUrls { get; set; } = new List<string>();
    }
} 