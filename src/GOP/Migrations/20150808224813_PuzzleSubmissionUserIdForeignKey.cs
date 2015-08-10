using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class PuzzleSubmissionUserIdForeignKey : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.AddForeignKey(
                name: "FK_PuzzleSubmission_ApplicationUser_UserId",
                table: "PuzzleSubmission",
                column: "UserId",
                referencedTable: "AspNetUsers",
                referencedColumn: "Id");
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropForeignKey(name: "FK_PuzzleSubmission_ApplicationUser_UserId", table: "PuzzleSubmission");
        }
    }
}
