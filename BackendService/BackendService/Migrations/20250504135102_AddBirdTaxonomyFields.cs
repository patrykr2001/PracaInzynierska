using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendService.Migrations
{
    /// <inheritdoc />
    public partial class AddBirdTaxonomyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BreedingSeason",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Diet",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Genus",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Habitat",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Lifespan",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Order",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Species",
                table: "Birds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Weight",
                table: "Birds",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Wingspan",
                table: "Birds",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BreedingSeason",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Diet",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Genus",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Habitat",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Lifespan",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Species",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Birds");

            migrationBuilder.DropColumn(
                name: "Wingspan",
                table: "Birds");
        }
    }
}
