using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;

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
                    Id = table.Column<int>(isNullable: false),
                    GridJS = table.Column<string>(isNullable: false),
                    Name = table.Column<string>(isNullable: false),
                    SpawnsJS = table.Column<string>(isNullable: false)
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
