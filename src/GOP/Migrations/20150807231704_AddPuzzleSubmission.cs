using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddPuzzleSubmission : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "PuzzleSubmission",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Code = table.Column<string>(isNullable: false),
                    IpAddress = table.Column<string>(isNullable: false),
                    PuzzleId = table.Column<int>(isNullable: false),
                    Score = table.Column<int>(isNullable: false),
                    Timestamp = table.Column<DateTimeOffset>(isNullable: false),
                    UserId = table.Column<int>(isNullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PuzzleSubmission", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PuzzleSubmission_Puzzle_PuzzleId",
                        column: x => x.PuzzleId,
                        principalTable: "Puzzle",
                        principalColumn: "Id");
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("PuzzleSubmission");
        }
    }
}
