using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendService.Migrations
{
    /// <inheritdoc />
    public partial class AddBirdsAndObservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Birds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ScientificName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CommonName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Family = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Order = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ConservationStatus = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Birds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BirdObservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BirdId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(9,6)", nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(9,6)", nullable: false),
                    ObservationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    NumberOfBirds = table.Column<int>(type: "INTEGER", nullable: true),
                    WeatherConditions = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Habitat = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IsVerified = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BirdObservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BirdObservations_Birds_BirdId",
                        column: x => x.BirdId,
                        principalTable: "Birds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BirdObservations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BirdObservations_BirdId",
                table: "BirdObservations",
                column: "BirdId");

            migrationBuilder.CreateIndex(
                name: "IX_BirdObservations_Latitude_Longitude",
                table: "BirdObservations",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_BirdObservations_ObservationDate",
                table: "BirdObservations",
                column: "ObservationDate");

            migrationBuilder.CreateIndex(
                name: "IX_BirdObservations_UserId",
                table: "BirdObservations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Birds_CommonName",
                table: "Birds",
                column: "CommonName");

            migrationBuilder.CreateIndex(
                name: "IX_Birds_ScientificName",
                table: "Birds",
                column: "ScientificName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BirdObservations");

            migrationBuilder.DropTable(
                name: "Birds");
        }
    }
}
