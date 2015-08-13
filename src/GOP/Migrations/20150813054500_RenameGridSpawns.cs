using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class RenameGridSpawns : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.RenameColumn("GridJS", "CustomAltar", "Grid");
            migration.RenameColumn("SpawnsJS", "CustomAltar", "Spawns");
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.RenameColumn("Grid", "CustomAltar", "GridJS");
            migration.RenameColumn("Spawns", "CustomAltar", "SpawnsJS");
        }
    }
}
