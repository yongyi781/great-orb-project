using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Operations;
using Microsoft.Data.Entity.SqlServer.Metadata;

namespace GOP.Migrations
{
    public partial class AddDeadPracticeResult : Migration
    {
        protected override void Up(MigrationBuilder migration)
        {
            migration.CreateTable(
                name: "DeadPracticeResult",
                columns: table => new
                {
                    Id = table.Column<int>(isNullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerIdentityStrategy.IdentityColumn),
                    Data = table.Column<string>(isNullable: false),
                    IpAddress = table.Column<string>(isNullable: false),
                    Settings = table.Column<string>(isNullable: false),
                    Timestamp = table.Column<DateTimeOffset>(isNullable: false),
                    UserId = table.Column<int>(isNullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeadPracticeResult", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeadPracticeResult_ApplicationUser_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });
        }

        protected override void Down(MigrationBuilder migration)
        {
            migration.DropTable("DeadPracticeResult");
        }
    }
}
