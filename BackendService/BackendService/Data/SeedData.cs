using BackendService.Models;

namespace BackendService.Data
{
    public static class SeedData
    {
        public static void SeedBirds(ApplicationDbContext context)
        {
            if (!context.Birds.Any())
            {
                var birds = new List<Bird>
                {
                    new Bird
                    {
                        ScientificName = "Ciconia ciconia",
                        CommonName = "Bocian biały",
                        Family = "Ciconiidae",
                        Order = "Ciconiiformes",
                        ConservationStatus = "LC",
                        Description = "Bocian biały to duży ptak brodzący, charakterystyczny dla krajobrazu polskiej wsi. Ma białe upierzenie z czarnymi lotkami, czerwony dziób i nogi. Jest symbolem wiosny i płodności.",
                        ImageUrl = "/uploads/birds/df8c59f6-5b04-47f9-a088-796e322fe93e.jpg",
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Bird
                    {
                        ScientificName = "Parus major",
                        CommonName = "Bogatka",
                        Family = "Paridae",
                        Order = "Passeriformes",
                        ConservationStatus = "LC",
                        Description = "Bogatka to największy przedstawiciel rodziny sikor w Polsce. Charakteryzuje się czarną głową z białymi policzkami, żółtym brzuchem z czarnym pasem pośrodku i zielonkawym grzbietem.",
                        ImageUrl = "/uploads/birds/69f57822-c6dd-43ba-81e2-cffbedce9da9.jpg",
                        IsVerified = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                context.Birds.AddRange(birds);
                context.SaveChanges();
            }
        }

        public static void SeedUsers(ApplicationDbContext context)
        {
            if (!context.Users.Any())
            {
                var user = new User
                {
                    Username = "test",
                    Email = "test@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", 12),
                    Role = UserRole.User,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(user);
                context.SaveChanges();
            }
        }
    }
} 