using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddSoloGame : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "SoloGame",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Altar = table.Column<int>(nullable: false),
                    Code = table.Column<string>(nullable: false),
                    IpAddress = table.Column<string>(nullable: false),
                    NumberOfOrbs = table.Column<int>(nullable: false),
                    Score = table.Column<int>(nullable: false),
                    Seed = table.Column<int>(nullable: false),
                    Timestamp = table.Column<DateTimeOffset>(nullable: false),
                    UserId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoloGame", x => x.Id);
                });
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropTable("SoloGame");
        }
    }
}
