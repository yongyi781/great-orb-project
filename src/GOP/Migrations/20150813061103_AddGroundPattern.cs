using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class AddGroundPattern : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.AddColumn<string>(
                name: "GroundPattern",
                table: "CustomAltar",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropColumn(name: "GroundPattern", table: "CustomAltar");
        }
    }
}
