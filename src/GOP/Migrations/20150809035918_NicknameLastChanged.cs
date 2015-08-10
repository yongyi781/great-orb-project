using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Migrations.Builders;
using Microsoft.Data.Entity.Migrations.Operations;

namespace GOP.Migrations
{
    public partial class NicknameLastChanged : Migration
    {
        public override void Up(MigrationBuilder migration)
        {
            migration.AddColumn<DateTimeOffset>(
                name: "LastChanged",
                table: "Nickname",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        public override void Down(MigrationBuilder migration)
        {
            migration.DropColumn(name: "LastChanged", table: "Nickname");
        }
    }
}
