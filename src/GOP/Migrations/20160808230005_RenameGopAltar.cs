using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GOP.Migrations
{
    public partial class RenameGopAltar : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable("CustomAltars", newName: "GopAltars");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable("GopAltars", newName: "CustomAltars");
        }
    }
}
