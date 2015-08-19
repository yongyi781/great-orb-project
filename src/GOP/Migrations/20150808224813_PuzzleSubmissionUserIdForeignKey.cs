using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class PuzzleSubmissionUserIdForeignKey : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.AddForeignKey(
                name: "FK_PuzzleSubmission_ApplicationUser_UserId",
                table: "PuzzleSubmission",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropForeignKey(name: "FK_PuzzleSubmission_ApplicationUser_UserId", table: "PuzzleSubmission");
        }
    }
}
