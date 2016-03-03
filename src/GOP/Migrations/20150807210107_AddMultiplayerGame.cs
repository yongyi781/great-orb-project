using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace GOP.Migrations
{
    public partial class AddMultiplayerGame : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "MultiplayerGame",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Altar = table.Column<int>(nullable: false),
                    Code = table.Column<string>(nullable: false),
                    NumberOfOrbs = table.Column<int>(nullable: false),
                    NumberOfPlayers = table.Column<int>(nullable: false),
                    Score = table.Column<int>(nullable: false),
                    Seed = table.Column<int>(nullable: false),
                    Timestamp = table.Column<DateTimeOffset>(nullable: false),
                    Usernames = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MultiplayerGame", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("MultiplayerGame");
        }
    }
}
