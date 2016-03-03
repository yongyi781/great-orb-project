using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class RenameGridSpawns : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.RenameColumn("GridJS", "CustomAltar", "Grid");
            migration.RenameColumn("SpawnsJS", "CustomAltar", "Spawns");
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.RenameColumn("Grid", "CustomAltar", "GridJS");
            migration.RenameColumn("Spawns", "CustomAltar", "SpawnsJS");
        }
    }
}
