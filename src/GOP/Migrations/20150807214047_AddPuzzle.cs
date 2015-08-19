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
                    Id = table.Column<int>(isNullable: false),
                    Altar = table.Column<int>(isNullable: false),
                    NumberOfOrbs = table.Column<int>(isNullable: false),
                    NumberOfPlayers = table.Column<int>(isNullable: false),
                    Orbs = table.Column<string>(isNullable: false),
                    StartLocations = table.Column<string>(isNullable: false)
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
