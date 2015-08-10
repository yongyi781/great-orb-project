using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddPuzzleSubmission : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "PuzzleSubmission",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Code = table.Column<string>(nullable: false),
                    IpAddress = table.Column<string>(nullable: false),
                    PuzzleId = table.Column<int>(nullable: false),
                    Score = table.Column<int>(nullable: false),
                    Timestamp = table.Column<DateTimeOffset>(nullable: false),
                    UserId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PuzzleSubmission", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PuzzleSubmission_Puzzle_PuzzleId",
                        columns: x => x.PuzzleId,
                        referencedTable: "Puzzle",
                        referencedColumn: "Id");
                });
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropTable("PuzzleSubmission");
        }
    }
}
