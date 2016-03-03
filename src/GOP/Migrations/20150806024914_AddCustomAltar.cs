using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GOP.Migrations
{
    public partial class AddCustomAltar : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "CustomAltar",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    GridJS = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    SpawnsJS = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomAltar", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("CustomAltar");
        }
    }
}
