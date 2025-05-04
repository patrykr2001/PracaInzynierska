using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendService.Migrations
{
    /// <inheritdoc />
    public partial class ChangeCoordinatesToDouble : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "BirdObservations",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "BirdObservations",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Longitude",
                table: "BirdObservations",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");

            migrationBuilder.AlterColumn<decimal>(
                name: "Latitude",
                table: "BirdObservations",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "REAL");
        }
    }
}
