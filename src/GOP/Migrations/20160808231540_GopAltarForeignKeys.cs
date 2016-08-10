using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GOP.Migrations
{
    public partial class GopAltarForeignKeys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SoloGames_Altar",
                table: "SoloGames",
                column: "Altar");

            migrationBuilder.CreateIndex(
                name: "IX_Puzzles_Altar",
                table: "Puzzles",
                column: "Altar");

            migrationBuilder.CreateIndex(
                name: "IX_MultiplayerGames_Altar",
                table: "MultiplayerGames",
                column: "Altar");

            migrationBuilder.AddForeignKey(
                name: "FK_MultiplayerGames_GopAltars_Altar",
                table: "MultiplayerGames",
                column: "Altar",
                principalTable: "GopAltars",
                principalColumn: "Id",
                onUpdate: ReferentialAction.Cascade,
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Puzzles_GopAltars_Altar",
                table: "Puzzles",
                column: "Altar",
                principalTable: "GopAltars",
                principalColumn: "Id",
                onUpdate: ReferentialAction.Cascade,
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SoloGames_GopAltars_Altar",
                table: "SoloGames",
                column: "Altar",
                principalTable: "GopAltars",
                principalColumn: "Id",
                onUpdate: ReferentialAction.Cascade,
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MultiplayerGames_GopAltars_Altar",
                table: "MultiplayerGames");

            migrationBuilder.DropForeignKey(
                name: "FK_Puzzles_GopAltars_Altar",
                table: "Puzzles");

            migrationBuilder.DropForeignKey(
                name: "FK_SoloGames_GopAltars_Altar",
                table: "SoloGames");

            migrationBuilder.DropIndex(
                name: "IX_SoloGames_Altar",
                table: "SoloGames");

            migrationBuilder.DropIndex(
                name: "IX_Puzzles_Altar",
                table: "Puzzles");

            migrationBuilder.DropIndex(
                name: "IX_MultiplayerGames_Altar",
                table: "MultiplayerGames");
        }
    }
}
