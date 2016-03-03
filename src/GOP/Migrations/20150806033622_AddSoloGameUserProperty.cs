using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class AddSoloGameUserProperty : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.AddForeignKey(
                name: "FK_SoloGame_ApplicationUser_UserId",
                table: "SoloGame",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropForeignKey(name: "FK_SoloGame_ApplicationUser_UserId", table: "SoloGame");
        }
    }
}
