using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;
using GOP.Models;
using Microsoft.Data.Entity.Infrastructure;

namespace GOP.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class AddPuzzle
    {
        protected override void BuildTargetModel(ModelBuilder builder)
        {
            builder
                .Annotation("ProductVersion", "7.0.0-beta7-13905")
                .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            builder.Entity("GOP.Models.ApplicationUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ChatColor");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Email")
                        .Annotation("MaxLength", 256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("GopControls");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("NormalizedUserName")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .Annotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.Index("NormalizedEmail")
                        .Annotation("Relational:Name", "EmailIndex");

                    b.Index("NormalizedUserName")
                        .Annotation("Relational:Name", "UserNameIndex");

                    b.Annotation("Relational:TableName", "AspNetUsers");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .Annotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Text")
                        .IsRequired();

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.CustomAltar", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("GridJS")
                        .IsRequired();

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("SpawnsJS")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.MultiplayerGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<string>("Usernames")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.Nickname", b =>
                {
                    b.Property<string>("IpAddress")
                        .Annotation("Relational:ColumnType", "varchar(50)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .Annotation("MaxLength", 50);

                    b.HasKey("IpAddress");
                });

            builder.Entity("GOP.Models.Puzzle", b =>
                {
                    b.Property<int>("Id");

                    b.Property<int>("Altar");

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("NumberOfPlayers");

                    b.Property<string>("Orbs")
                        .IsRequired();

                    b.Property<string>("StartLocations")
                        .IsRequired();

                    b.HasKey("Id");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Altar");

                    b.Property<string>("Code")
                        .IsRequired();

                    b.Property<string>("IpAddress")
                        .IsRequired();

                    b.Property<int>("NumberOfOrbs");

                    b.Property<int>("Score");

                    b.Property<int>("Seed");

                    b.Property<DateTimeOffset>("Timestamp");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("Name")
                        .Annotation("MaxLength", 256);

                    b.Property<string>("NormalizedName")
                        .Annotation("MaxLength", 256);

                    b.HasKey("Id");

                    b.Index("NormalizedName")
                        .Annotation("Relational:Name", "RoleNameIndex");

                    b.Annotation("Relational:TableName", "AspNetRoles");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("RoleId");

                    b.HasKey("Id");

                    b.Annotation("Relational:TableName", "AspNetRoleClaims");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.Annotation("Relational:TableName", "AspNetUserClaims");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<int>("UserId");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.Annotation("Relational:TableName", "AspNetUserLogins");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.Property<int>("UserId");

                    b.Property<int>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.Annotation("Relational:TableName", "AspNetUserRoles");
                });

            builder.Entity("GOP.Models.ChatMessage", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .ForeignKey("UserId");
                });

            builder.Entity("GOP.Models.SoloGame", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityRoleClaim<int>", b =>
                {
                    b.HasOne("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>")
                        .WithMany()
                        .ForeignKey("RoleId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserClaim<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserLogin<int>", b =>
                {
                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .ForeignKey("UserId");
                });

            builder.Entity("Microsoft.AspNet.Identity.EntityFramework.IdentityUserRole<int>", b =>
                {
                    b.HasOne("Microsoft.AspNet.Identity.EntityFramework.IdentityRole<int>")
                        .WithMany()
                        .ForeignKey("RoleId");

                    b.HasOne("GOP.Models.ApplicationUser")
                        .WithMany()
                        .ForeignKey("UserId");
                });
        }
    }
}
