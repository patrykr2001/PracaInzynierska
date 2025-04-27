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
                    }
                };

                context.Birds.AddRange(birds);
                context.SaveChanges();
            }
        }
    }
} 