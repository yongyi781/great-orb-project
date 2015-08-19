using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddSoloGame : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "SoloGame",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Altar = table.Column<int>(isNullable: false),
                    Code = table.Column<string>(isNullable: false),
                    IpAddress = table.Column<string>(isNullable: false),
                    NumberOfOrbs = table.Column<int>(isNullable: false),
                    Score = table.Column<int>(isNullable: false),
                    Seed = table.Column<int>(isNullable: false),
                    Timestamp = table.Column<DateTimeOffset>(isNullable: false),
                    UserId = table.Column<int>(isNullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoloGame", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("SoloGame");
        }
    }
}
