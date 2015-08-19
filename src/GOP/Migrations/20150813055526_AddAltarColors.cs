using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class AddAltarColors : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.AddColumn<string>(
                name: "GroundColor",
                table: "CustomAltar",
                isNullable: true);
            migration.AddColumn<string>(
                name: "WaterColor",
                table: "CustomAltar",
                isNullable: true);
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropColumn(name: "GroundColor", table: "CustomAltar");
            migration.DropColumn(name: "WaterColor", table: "CustomAltar");
        }
    }
}
