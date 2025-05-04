using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendService.Migrations
{
    /// <inheritdoc />
    public partial class AddObservationImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "BirdObservations",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "BirdObservations");
        }
    }
}
