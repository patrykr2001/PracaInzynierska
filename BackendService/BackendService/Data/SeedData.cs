using BackendService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using BackendService.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendService.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();

            // Tworzenie ról
            if (!await roleManager.RoleExistsAsync(AuthorizationConstants.AdminRole))
            {
                await roleManager.CreateAsync(new IdentityRole(AuthorizationConstants.AdminRole));
            }

            if (!await roleManager.RoleExistsAsync(AuthorizationConstants.UserRole))
            {
                await roleManager.CreateAsync(new IdentityRole(AuthorizationConstants.UserRole));
            }

            // Tworzenie administratora
            var adminConfig = configuration.GetSection("DefaultAdmin");
            var adminEmail = adminConfig["Email"] ?? throw new InvalidOperationException("DefaultAdmin:Email is not configured");
            var adminPassword = adminConfig["Password"] ?? throw new InvalidOperationException("DefaultAdmin:Password is not configured");
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, adminPassword);
                if (result.Succeeded)
                {
                    // Przypisanie obu ról do administratora
                    await userManager.AddToRoleAsync(adminUser, AuthorizationConstants.AdminRole);
                    await userManager.AddToRoleAsync(adminUser, AuthorizationConstants.UserRole);
                }
                else
                {
                    throw new InvalidOperationException($"Nie udało się utworzyć konta administratora: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Upewniamy się, że administrator ma obie role
                if (!await userManager.IsInRoleAsync(adminUser, AuthorizationConstants.AdminRole))
                {
                    await userManager.AddToRoleAsync(adminUser, AuthorizationConstants.AdminRole);
                }
                if (!await userManager.IsInRoleAsync(adminUser, AuthorizationConstants.UserRole))
                {
                    await userManager.AddToRoleAsync(adminUser, AuthorizationConstants.UserRole);
                }
            }

            // Dodawanie przykładowych ptaków
            if (!context.Birds.Any())
            {
                var birds = new List<Bird>
                {
                    new Bird
                    {
                        CommonName = "Bogatka",
                        ScientificName = "Parus major",
                        Family = "Sikory",
                        Order = "Wróblowe",
                        Genus = "Parus",
                        Species = "major",
                        ConservationStatus = "LC",
                        Description = "Największa z europejskich sikor. Charakterystyczna czarna głowa z białymi policzkami i żółtym brzuchem z czarnym paskiem.",
                        Habitat = "Lasy liściaste, parki, ogrody",
                        Diet = "Owady, pająki, nasiona",
                        Size = "14 cm",
                        Weight = 20,
                        Wingspan = 24,
                        Lifespan = "2-3 lata",
                        BreedingSeason = "Kwiecień - Czerwiec",
                        ImageUrl = "/images/birds/bogatka.jpg",
                        IsVerified = true,
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Bird
                    {
                        CommonName = "Sikora modra",
                        ScientificName = "Cyanistes caeruleus",
                        Family = "Sikory",
                        Order = "Wróblowe",
                        Genus = "Cyanistes",
                        Species = "caeruleus",
                        ConservationStatus = "LC",
                        Description = "Mniejsza od bogatki, z charakterystycznym niebieskim wierzchem głowy i skrzydeł.",
                        Habitat = "Lasy liściaste, parki, ogrody",
                        Diet = "Owady, pająki, nasiona",
                        Size = "11 cm",
                        Weight = 11,
                        Wingspan = 20,
                        Lifespan = "2-3 lata",
                        BreedingSeason = "Kwiecień - Czerwiec",
                        ImageUrl = "/images/birds/sikora-modra.jpg",
                        IsVerified = true,
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-8)
                    },
                    new Bird
                    {
                        CommonName = "Kos",
                        ScientificName = "Turdus merula",
                        Family = "Drozdowate",
                        Order = "Wróblowe",
                        Genus = "Turdus",
                        Species = "merula",
                        ConservationStatus = "LC",
                        Description = "Samiec czarny z żółtym dziobem, samica brązowa. Śpiewa wczesnym rankiem i wieczorem.",
                        Habitat = "Lasy, parki, ogrody",
                        Diet = "Dżdżownice, owady, owoce",
                        Size = "25 cm",
                        Weight = 100,
                        Wingspan = 38,
                        Lifespan = "3-4 lata",
                        BreedingSeason = "Marzec - Lipiec",
                        ImageUrl = "/images/birds/kos.jpg",
                        IsVerified = true,
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-6)
                    },
                    new Bird
                    {
                        CommonName = "Wróbel",
                        ScientificName = "Passer domesticus",
                        Family = "Wróblowate",
                        Order = "Wróblowe",
                        Genus = "Passer",
                        Species = "domesticus",
                        ConservationStatus = "LC",
                        Description = "Mały ptak o brązowym upierzeniu. Samiec ma czarną plamę na gardle i szarą czapeczkę.",
                        Habitat = "Osiedla ludzkie, miasta, wsie",
                        Diet = "Nasiona, owady, resztki pokarmu",
                        Size = "16 cm",
                        Weight = 30,
                        Wingspan = 25,
                        Lifespan = "2-3 lata",
                        BreedingSeason = "Kwiecień - Sierpień",
                        ImageUrl = "/images/birds/wrobel.jpg",
                        IsVerified = true,
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-4)
                    },
                    new Bird
                    {
                        CommonName = "Szpak",
                        ScientificName = "Sturnus vulgaris",
                        Family = "Szpakowate",
                        Order = "Wróblowe",
                        Genus = "Sturnus",
                        Species = "vulgaris",
                        ConservationStatus = "LC",
                        Description = "Czarny ptak z metalicznym połyskiem i białymi plamkami. Świetny naśladowca dźwięków.",
                        Habitat = "Parki, ogrody, tereny rolnicze",
                        Diet = "Owady, owoce, nasiona",
                        Size = "22 cm",
                        Weight = 80,
                        Wingspan = 37,
                        Lifespan = "2-3 lata",
                        BreedingSeason = "Kwiecień - Czerwiec",
                        ImageUrl = "/images/birds/szpak.jpg",
                        IsVerified = false,
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };

                await context.Birds.AddRangeAsync(birds);
                await context.SaveChangesAsync();
            }

            // Dodawanie przykładowych obserwacji
            if (!context.BirdObservations.Any())
            {
                var bogatka = context.Birds.First(b => b.CommonName == "Bogatka");
                var sikoraModra = context.Birds.First(b => b.CommonName == "Sikora modra");

                var observations = new List<BirdObservation>
                {
                    new BirdObservation
                    {
                        BirdId = bogatka.Id,
                        UserId = adminUser.Id,
                        Latitude = 52.2297, // Warszawa
                        Longitude = 21.0122,
                        ObservationDate = DateTime.UtcNow.AddDays(-5),
                        Description = "Para bogatek w parku miejskim",
                        NumberOfBirds = 2,
                        WeatherConditions = "Słonecznie, 20°C",
                        Habitat = "Park miejski",
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new BirdObservation
                    {
                        BirdId = bogatka.Id,
                        UserId = adminUser.Id,
                        Latitude = 50.0647, // Kraków
                        Longitude = 19.9450,
                        ObservationDate = DateTime.UtcNow.AddDays(-3),
                        Description = "Bogatka przy karmniku",
                        NumberOfBirds = 1,
                        WeatherConditions = "Zachmurzenie, 15°C",
                        Habitat = "Ogród miejski",
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    },
                    new BirdObservation
                    {
                        BirdId = sikoraModra.Id,
                        UserId = adminUser.Id,
                        Latitude = 51.1079, // Wrocław
                        Longitude = 17.0385,
                        ObservationDate = DateTime.UtcNow.AddDays(-4),
                        Description = "Stado sikor modrych w lesie",
                        NumberOfBirds = 5,
                        WeatherConditions = "Deszczowo, 12°C",
                        Habitat = "Las liściasty",
                        IsVerified = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-4)
                    },
                    new BirdObservation
                    {
                        BirdId = sikoraModra.Id,
                        UserId = adminUser.Id,
                        Latitude = 54.3520, // Szczecin
                        Longitude = 18.6466,
                        ObservationDate = DateTime.UtcNow.AddDays(-2),
                        Description = "Sikora modra w dziupli",
                        NumberOfBirds = 1,
                        WeatherConditions = "Pochmurno, 16°C",
                        Habitat = "Park miejski",
                        IsVerified = false,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };

                await context.BirdObservations.AddRangeAsync(observations);
                await context.SaveChangesAsync();
            }
        }
    }
} 