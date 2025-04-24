using Microsoft.EntityFrameworkCore;
using BackendService.Models;

namespace BackendService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Bird> Birds { get; set; }
        public DbSet<BirdObservation> BirdObservations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Konfiguracja indeksów dla Users
            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Konfiguracja indeksów dla Birds
            builder.Entity<Bird>()
                .HasIndex(b => b.ScientificName);

            builder.Entity<Bird>()
                .HasIndex(b => b.CommonName);

            // Konfiguracja indeksów dla BirdObservations
            builder.Entity<BirdObservation>()
                .HasIndex(b => b.BirdId);

            builder.Entity<BirdObservation>()
                .HasIndex(b => b.UserId);

            builder.Entity<BirdObservation>()
                .HasIndex(b => b.ObservationDate);

            builder.Entity<BirdObservation>()
                .HasIndex(b => new { b.Latitude, b.Longitude });

            // Konfiguracja relacji dla BirdObservations
            builder.Entity<BirdObservation>()
                .HasOne(b => b.Bird)
                .WithMany(b => b.Observations)
                .HasForeignKey(b => b.BirdId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<BirdObservation>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 