using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class AddGroundPattern : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.AddColumn<string>(
                name: "GroundPattern",
                table: "CustomAltar",
                nullable: true);
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropColumn(name: "GroundPattern", table: "CustomAltar");
        }
    }
}
