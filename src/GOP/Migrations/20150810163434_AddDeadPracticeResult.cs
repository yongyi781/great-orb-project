using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddDeadPracticeResult : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "DeadPracticeResult",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Data = table.Column<string>(nullable: false),
                    IpAddress = table.Column<string>(nullable: false),
                    Settings = table.Column<string>(nullable: false),
                    Timestamp = table.Column<DateTimeOffset>(nullable: false),
                    UserId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeadPracticeResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeadPracticeResult_ApplicationUser_UserId",
                        columns: x => x.UserId,
                        referencedTable: "AspNetUsers",
                        referencedColumn: "Id");
                });
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropTable("DeadPracticeResult");
        }
    }
}
