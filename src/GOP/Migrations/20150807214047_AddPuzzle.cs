using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class AddPuzzle : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "Puzzle",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Altar = table.Column<int>(nullable: false),
                    NumberOfOrbs = table.Column<int>(nullable: false),
                    NumberOfPlayers = table.Column<int>(nullable: false),
                    Orbs = table.Column<string>(nullable: false),
                    StartLocations = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puzzle", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("Puzzle");
        }
    }
}
